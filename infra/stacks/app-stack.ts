import {
  type AppContext,
  BaseStack,
  type StackConfig,
} from "@gymbeam/cdk-template"
import * as lambda from "aws-cdk-lib/aws-lambda"

import { RestApiGateway } from "../constructs/api-getways/api-gateway"
import { ApiFunction } from "../constructs/functions/api/api-function"
import { MetricsCollectorFunction } from "../constructs/functions/metrics-collector/metrics-collector-function"
import { PerformanceTestFunction } from "../constructs/functions/performance-test/performance-test-function"
import { PerformanceTestStateMachine } from "../constructs/state-machines/performance-state-machine"
import { StatsTable } from "../constructs/tables/stats-table"

export class AppStack extends BaseStack {
  constructor(appContext: AppContext, stackConfig: StackConfig) {
    super(appContext, stackConfig, {
      description: `Lambda Benchmark - stage ${appContext.stageName}`,
    })

    /**
     * Tables
     */
    const { table: statsTable } = new StatsTable(this, "StatsTable")

    /**
     * Functions
     */

    // Node.js
    const { function: performanceTestFunctionNode22Arm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-node22-arm64", {
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/nodejs",
      })

    const { function: performanceTestFunctionNode22X86 } =
      new PerformanceTestFunction(this, "performance-benchmark-node22-x86", {
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/nodejs",
      })

    const { function: performanceTestFunctionNode18Arm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-node18-arm64", {
        runtime: lambda.Runtime.NODEJS_18_X,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/nodejs",
      })

    const { function: performanceTestFunctionNode18X86 } =
      new PerformanceTestFunction(this, "performance-benchmark-node18-x86", {
        runtime: lambda.Runtime.NODEJS_18_X,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/nodejs",
      })

    const { function: metricsCollectorFunction } = new MetricsCollectorFunction(
      this,
      "metrics-collector",
      { statsTable },
    )

    // Python
    const { function: performanceTestFunctionPython311Arm64 } =
      new PerformanceTestFunction(
        this,
        "performance-benchmark-python311-arm64",
        {
          runtime: lambda.Runtime.PYTHON_3_11,
          architecture: lambda.Architecture.ARM_64,
          codePath: "src/functions/performance-benchmark/python",
        },
      )

    const { function: performanceTestFunctionPython311X86 } =
      new PerformanceTestFunction(this, "performance-benchmark-python311-x86", {
        runtime: lambda.Runtime.PYTHON_3_11,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/python",
      })

    // dotnet
    const { function: performanceTestFunctionDotnet8Arm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-dotnet8-arm64", {
        runtime: lambda.Runtime.DOTNET_8,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/dotnet",
      })

    const { function: performanceTestFunctionDotnet8X86 } =
      new PerformanceTestFunction(this, "performance-benchmark-dotnet8-x86", {
        runtime: lambda.Runtime.DOTNET_8,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/dotnet",
      })

    // Java 21
    const { function: performanceTestFunctionJava21Arm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-java21-arm64", {
        runtime: lambda.Runtime.JAVA_21,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/java",
      })

    const { function: performanceTestFunctionJava21X86 } =
      new PerformanceTestFunction(this, "performance-benchmark-java21-x86", {
        runtime: lambda.Runtime.JAVA_21,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/java",
      })

    // Go (using provided runtime)
    const { function: performanceTestFunctionGoArm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-go-arm64", {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/go",
        isGo: true,
      })

    const { function: performanceTestFunctionGoX86 } =
      new PerformanceTestFunction(this, "performance-benchmark-go-x86", {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/go",
        isGo: true,
      })

    // Rust (using provided runtime)
    const { function: performanceTestFunctionRustArm64 } =
      new PerformanceTestFunction(this, "performance-benchmark-rust-arm64", {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        architecture: lambda.Architecture.ARM_64,
        codePath: "src/functions/performance-benchmark/rust",
      })

    const { function: performanceTestFunctionRustX86 } =
      new PerformanceTestFunction(this, "performance-benchmark-rust-x86", {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        architecture: lambda.Architecture.X86_64,
        codePath: "src/functions/performance-benchmark/rust",
      })

    /**
     * State Machines
     */
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-node22-arm64",
      {
        performanceTestFunction: performanceTestFunctionNode22Arm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-node22-x86",
      {
        performanceTestFunction: performanceTestFunctionNode22X86,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-node18-arm64",
      {
        performanceTestFunction: performanceTestFunctionNode18Arm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-node18-x86",
      {
        performanceTestFunction: performanceTestFunctionNode18X86,
        metricsCollectorFunction,
      },
    )

    // Python state machine
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-python311-arm64",
      {
        performanceTestFunction: performanceTestFunctionPython311Arm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-python311-x86",
      {
        performanceTestFunction: performanceTestFunctionPython311X86,
        metricsCollectorFunction,
      },
    )

    // .NET state machines
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-dotnet8-arm64",
      {
        performanceTestFunction: performanceTestFunctionDotnet8Arm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-dotnet8-x86",
      {
        performanceTestFunction: performanceTestFunctionDotnet8X86,
        metricsCollectorFunction,
      },
    )

    // Java 21 state machines
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-java21-arm64",
      {
        performanceTestFunction: performanceTestFunctionJava21Arm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-java21-x86",
      {
        performanceTestFunction: performanceTestFunctionJava21X86,
        metricsCollectorFunction,
      },
    )

    // Go state machines
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-go-arm64",
      {
        performanceTestFunction: performanceTestFunctionGoArm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-go-x86",
      {
        performanceTestFunction: performanceTestFunctionGoX86,
        metricsCollectorFunction,
      },
    )

    // Rust state machines
    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-rust-arm64",
      {
        performanceTestFunction: performanceTestFunctionRustArm64,
        metricsCollectorFunction,
      },
    )

    new PerformanceTestStateMachine(
      this,
      "performance-test-state-machine-rust-x86",
      {
        performanceTestFunction: performanceTestFunctionRustX86,
        metricsCollectorFunction,
      },
    )

    /**
     * API Gateway
     */

    const { function: apiFunction } = new ApiFunction(this, "api-function", {
      statsTable,
    })

    new RestApiGateway(this, "api-gateway", { apiFunction })
  }
}
