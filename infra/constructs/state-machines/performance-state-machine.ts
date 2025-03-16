import { BaseConstruct, type IBaseConstruct } from "@gymbeam/cdk-template"
import * as cdk from "aws-cdk-lib"
import * as events from "aws-cdk-lib/aws-events"
import * as targets from "aws-cdk-lib/aws-events-targets"
import type * as lambda from "aws-cdk-lib/aws-lambda"
import * as stepFunctions from "aws-cdk-lib/aws-stepfunctions"
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks"

export class PerformanceTestStateMachine extends BaseConstruct {
  public stateMachine: stepFunctions.StateMachine

  constructor(
    scope: IBaseConstruct,
    id: string,
    props: {
      performanceTestFunction: lambda.IFunction
      metricsCollectorFunction: lambda.IFunction
    },
  ) {
    super(scope, id)

    const { performanceTestFunction, metricsCollectorFunction } = props

    const originalId = id.toLowerCase()

    // Determine runtime and architecture from the ID
    let runtime = "unknown"
    let architecture = "unknown"
    let language = "unknown"

    // Check for specific runtime patterns
    if (originalId.includes("node22")) {
      runtime = "node22"
      language = "nodejs"
    } else if (originalId.includes("node18")) {
      runtime = "node18"
      language = "nodejs"
    } else if (originalId.includes("python311")) {
      runtime = "python311"
      language = "python"
    } else if (originalId.includes("dotnet8")) {
      runtime = "dotnet8"
      language = "dotnet"
    } else if (originalId.includes("java21")) {
      runtime = "java21"
      language = "java"
    } else if (originalId.includes("rust")) {
      runtime = "provided-al2023"
      language = "rust"
    } else if (originalId.includes("go")) {
      runtime = "provided-al2023"
      language = "go"
    }

    // Check for architecture
    if (originalId.includes("arm64")) {
      architecture = "arm64"
    } else if (originalId.includes("x86")) {
      architecture = "x86_64"
    }

    const coldTestTask = new tasks.LambdaInvoke(this, "InvokeColdTest", {
      lambdaFunction: performanceTestFunction,
      outputPath: "$.Payload",
    })

    const warmTestTask = new tasks.LambdaInvoke(this, "InvokeWarmTest", {
      lambdaFunction: performanceTestFunction,
      outputPath: "$.Payload",
    })

    // Add a wait state to allow time for logs to be available in CloudWatch
    const waitForLogs = new stepFunctions.Wait(this, "WaitForLogs", {
      time: stepFunctions.WaitTime.duration(cdk.Duration.minutes(10)),
    })

    // Create a pass state to prepare the input for the metrics collector
    const prepareMetricsInput = new stepFunctions.Pass(
      this,
      "PrepareMetricsInput",
      {
        parameters: {
          functionName: performanceTestFunction.functionName,
          functionArn: performanceTestFunction.functionArn,
          runtime,
          architecture,
          language,
          "executionId.$": "$$.Execution.Id",
        },
      },
    )

    const metricsTask = new tasks.LambdaInvoke(this, "InvokeMetricsCollector", {
      lambdaFunction: metricsCollectorFunction,
      inputPath: "$",
      outputPath: "$.Payload",
    })

    const successState = new stepFunctions.Succeed(this, "SuccessState")

    const definition = coldTestTask
      .next(warmTestTask)
      .next(waitForLogs)
      .next(prepareMetricsInput)
      .next(metricsTask)
      .next(successState)

    this.stateMachine = new stepFunctions.StateMachine(
      this,
      "PerformanceTestStateMachine",
      {
        definition,
        timeout: cdk.Duration.minutes(15),
      },
    )

    new events.Rule(this, "PerformanceTestCronTrigger", {
      schedule: events.Schedule.expression("cron(0 */2 * * ? *)"),
      targets: [new targets.SfnStateMachine(this.stateMachine)],
    })
  }
}
