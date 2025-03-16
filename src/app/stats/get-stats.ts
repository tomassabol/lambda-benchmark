import { type AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { type HandlerFunction } from "@gymbeam/lambda-api"

import type { MetricsData } from "../../functions/metrics/types"

const dynamoDbClient = new DynamoDBClient()
const docClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true },
})

const { STATS_TABLE_NAME } = process.env

export const getStats: HandlerFunction = async () => {
  const items: MetricsData[] = []
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined

  do {
    const scanCommand = new ScanCommand({
      TableName: STATS_TABLE_NAME,
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    const result = await docClient.send(scanCommand)
    items.push(...((result.Items as MetricsData[]) ?? []))
    lastEvaluatedKey = result.LastEvaluatedKey
  } while (lastEvaluatedKey)

  return { total: items.length, items } as const
}
