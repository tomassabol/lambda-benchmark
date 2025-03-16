import "./service-name"

import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  StartQueryCommand,
} from "@aws-sdk/client-cloudwatch-logs"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import { logger } from "@gymbeam/aws-common/utils/logger"
import { createId } from "@paralleldrive/cuid2"
import { type Context } from "aws-lambda"

import type {
  LambdaMetrics,
  LogQueryResult,
  MetricsData,
  StepFunctionEvent,
} from "./types"

// Initialize clients
const cloudWatchLogsClient = new CloudWatchLogsClient()
const dynamoDbClient = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(dynamoDbClient)

// Get the table name from environment variables
const { STATS_TABLE_NAME } = process.env

export const handler = async (event: StepFunctionEvent, _context: Context) => {
  logger.info("Event:", JSON.stringify(event, null, 2))

  if (!event.functionName || !event.functionArn) {
    throw new Error("Missing required parameters in event")
  }

  try {
    // Extract function details from ARN
    // Format: arn:aws:lambda:region:account-id:function:function-name:qualifier
    const arnParts = event.functionArn.split(":")
    const functionName = arnParts[6] || event.functionName // The function name is the 7th part (index 6)

    // Use runtime, architecture, and language passed from the state machine
    const { runtime, architecture, language } = event

    // Get the log group name for the Lambda function
    const logGroupName = `/aws/lambda/${functionName}`
    logger.info(`Searching logs in log group: ${logGroupName}`)

    // Get current time and time 30 minutes ago (increased from 15 to give more buffer)
    const endTime = new Date().getTime()
    const startTime = endTime - 30 * 60 * 1000 // 30 minutes ago

    logger.info(
      `Time range: ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`,
    )

    // Query for cold start metrics (only logs with "Init Duration")
    const coldStartMetrics = await queryLambdaMetrics(
      logGroupName,
      startTime,
      endTime,
      "REPORT RequestId",
      "Init Duration", // include filter for cold start
    )

    // Query for warm start metrics (exclude logs with "Init Duration")
    const warmStartMetrics = await queryLambdaMetrics(
      logGroupName,
      startTime,
      endTime,
      "REPORT RequestId",
      undefined, // no additional inclusion filter
      "Init Duration", // exclude logs with Init Duration
    )

    if (!coldStartMetrics && !warmStartMetrics) {
      throw new Error(
        `Failed to retrieve any metrics from CloudWatch Logs for ${functionName}`,
      )
    }

    // Use default values if one of the metrics is missing
    const defaultMetrics: LambdaMetrics = {
      duration: 0,
      billedDuration: 0,
      memoryUsed: 0,
    }

    const finalColdStartMetrics = coldStartMetrics || defaultMetrics
    const finalWarmStartMetrics = warmStartMetrics || defaultMetrics

    // Prepare metrics data for DynamoDB
    const metricsData: MetricsData = {
      id: createId(), // Generate a unique ID using CUID2
      timestamp: Math.floor(Date.now() / 1000),
      functionName,
      runtime,
      architecture,
      language,
      coldStartDuration: finalColdStartMetrics.duration,
      warmStartDuration: finalWarmStartMetrics.duration,
      coldStartMemoryUsed: finalColdStartMetrics.memoryUsed,
      warmStartMemoryUsed: finalWarmStartMetrics.memoryUsed,
      coldStartBilledDuration: finalColdStartMetrics.billedDuration,
      warmStartBilledDuration: finalWarmStartMetrics.billedDuration,
    }

    // Add init duration if available (only for cold starts)
    if (finalColdStartMetrics.initDuration) {
      metricsData.coldStartInitDuration = finalColdStartMetrics.initDuration
    }

    logger.info("Collected metrics:", JSON.stringify(metricsData, null, 2))

    // Save metrics to DynamoDB
    await saveMetricsToDynamoDB(metricsData)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Metrics collected successfully",
        metrics: metricsData,
      }),
    }
  } catch (error) {
    logger.error("Error collecting metrics:", { error })
    throw error
  }
}

/**
 * Query CloudWatch Logs for Lambda metrics.
 *
 * @param logGroupName - The CloudWatch Logs group name.
 * @param startTime - The start time in milliseconds.
 * @param endTime - The end time in milliseconds.
 * @param includePattern - A required pattern to include.
 * @param includeAdditionalPattern - An optional additional inclusion filter.
 * @param excludePattern - An optional pattern to exclude.
 */
async function queryLambdaMetrics(
  logGroupName: string,
  startTime: number,
  endTime: number,
  includePattern: string,
  includeAdditionalPattern?: string,
  excludePattern?: string,
): Promise<LambdaMetrics | null> {
  try {
    // Build the query string with inclusion and exclusion filters
    const filters = [`filter @message like '${includePattern}'`]

    if (includeAdditionalPattern) {
      filters.push(`filter @message like '${includeAdditionalPattern}'`)
    }

    if (excludePattern) {
      filters.push(`filter not(@message like '${excludePattern}')`)
    }

    const queryString = `fields @timestamp, @message | ${filters.join(
      " | ",
    )} | sort @timestamp desc | limit 20`
    logger.info(`Executing CloudWatch Logs query: ${queryString}`)

    // Start the CloudWatch Logs query
    const startQueryCommand = new StartQueryCommand({
      logGroupName,
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      queryString,
    })

    const startQueryResponse =
      await cloudWatchLogsClient.send(startQueryCommand)
    const { queryId } = startQueryResponse

    if (!queryId) {
      throw new Error("Failed to start CloudWatch Logs query")
    }

    logger.info(`Started CloudWatch Logs query with ID: ${queryId}`)

    // Poll for query results
    const results = await pollQueryResults(queryId)

    logger.info(`Query results count: ${results.length}`)

    if (!results || results.length === 0) {
      logger.warn(`No results found for query.`)
      return null
    }

    // Use the first matching result
    const result = results[0] as LogQueryResult
    logger.info(`Processing log message: ${result["@message"]}`)

    const message = result["@message"]

    // Extract duration (in ms)
    const durationMatch = message.match(/Duration: ([\d.]+) ms/)
    const duration = durationMatch ? parseFloat(durationMatch[1]) : 0

    // Extract billed duration (in ms)
    const billedDurationMatch = message.match(/Billed Duration: ([\d.]+) ms/)
    const billedDuration = billedDurationMatch
      ? parseFloat(billedDurationMatch[1])
      : 0

    // Extract memory used (in MB)
    const memoryUsedMatch = message.match(/Max Memory Used: ([\d.]+) MB/)
    const memoryUsed = memoryUsedMatch ? parseFloat(memoryUsedMatch[1]) : 0

    // Extract init duration if available (in ms)
    let initDuration: number | undefined
    const initDurationMatch = message.match(/Init Duration: ([\d.]+) ms/)
    if (initDurationMatch) {
      initDuration = parseFloat(initDurationMatch[1])
    }

    const metrics: LambdaMetrics = {
      duration,
      billedDuration,
      memoryUsed,
      initDuration,
    }

    logger.info(`Extracted metrics: ${JSON.stringify(metrics, null, 2)}`)
    return metrics
  } catch (error) {
    logger.error("Error querying CloudWatch Logs:", { error })
    return null
  }
}

/**
 * Poll for CloudWatch Logs query results.
 */
async function pollQueryResults(
  queryId: string,
  maxAttempts = 20,
  delayMs = 1000,
): Promise<LogQueryResult[]> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const getQueryResultsCommand = new GetQueryResultsCommand({
      queryId,
    })

    const response = await cloudWatchLogsClient.send(getQueryResultsCommand)

    if (response.status === "Complete") {
      if (!response.results || response.results.length === 0) {
        return []
      }

      // Convert the results to a more usable format
      return response.results.map((result) => {
        const formattedResult: LogQueryResult = {
          "@message": "",
          "@timestamp": "",
        }

        // Each result is an array of { field, value } objects
        result.forEach((item) => {
          if (item.field && item.value) {
            formattedResult[item.field] = item.value
          }
        })

        return formattedResult
      })
    }

    logger.info(
      `Query status: ${response.status}, attempt ${attempts + 1}/${maxAttempts}`,
    )
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    attempts++
  }

  throw new Error(
    `CloudWatch Logs query did not complete after ${maxAttempts} attempts`,
  )
}

/**
 * Save metrics to DynamoDB.
 */
async function saveMetricsToDynamoDB(metricsData: MetricsData): Promise<void> {
  if (!STATS_TABLE_NAME) {
    throw new Error("STATS_TABLE_NAME environment variable is not set")
  }

  const putCommand = new PutCommand({
    TableName: STATS_TABLE_NAME,
    Item: metricsData,
  })

  await docClient.send(putCommand)
  logger.info("Metrics saved to DynamoDB:", metricsData.id)
}
