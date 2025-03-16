import { BaseConstruct, type IBaseConstruct } from "@gymbeam/cdk-template"
import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"

export class PerformanceTestFunction extends BaseConstruct {
  public function: lambda.Function

  constructor(
    scope: IBaseConstruct,
    id: string,
    props: {
      runtime: lambda.Runtime
      architecture: lambda.Architecture
      codePath: string
      isGo?: boolean
    },
  ) {
    super(scope, id)

    const {
      runtime,
      architecture,
      codePath = "src/functions",
      isGo = false,
    } = props

    if (runtime.name.startsWith("nodejs")) {
      this.function = new lambdaNodejs.NodejsFunction(
        this,
        `${id}-${runtime}`,
        {
          runtime,
          handler: "handler",
          entry: path.resolve(codePath, "index.ts"),
          description: `Performance test function for ${runtime}`,
          timeout: cdk.Duration.seconds(10),
          architecture,
          environment: {
            STAGE: scope.stageName,
          },
          bundling: {
            minify: true,
            sourceMap: true,
          },
        },
      )
    } else if (runtime.name.startsWith("dotnet")) {
      this.function = new lambda.Function(this, `${id}-${runtime}`, {
        runtime,
        handler: "PerformanceBenchmark",
        code: lambda.Code.fromAsset(path.resolve(codePath), {
          bundling: {
            image: runtime.bundlingImage,
            command: [
              "bash",
              "-c",
              [
                "dotnet restore",
                "dotnet publish -c Release -o /asset-output",
              ].join(" && "),
            ],
          },
        }),
        description: `Performance test function for ${runtime}`,
        timeout: cdk.Duration.seconds(10),
        architecture,
        environment: {
          STAGE: scope.stageName,
        },
      })
    } else if (runtime.name.startsWith("java")) {
      this.function = new lambda.Function(this, `${id}-${runtime}`, {
        runtime,
        handler: "com.benchmark.Handler::handleRequest",
        code: lambda.Code.fromAsset(path.resolve(codePath), {
          bundling: {
            image: runtime.bundlingImage,
            command: [
              "bash",
              "-c",
              [
                "mkdir -p /root/.m2/repository",
                "mvn clean package",
                "cp target/lambda-benchmark-1.0.0.jar /asset-output/",
              ].join(" && "),
            ],
            user: "root",
          },
        }),
        description: `Performance test function for ${runtime}`,
        timeout: cdk.Duration.seconds(10),
        architecture,
        environment: {
          STAGE: scope.stageName,
        },
      })
    } else if (isGo) {
      const goArch =
        architecture === lambda.Architecture.ARM_64 ? "arm64" : "amd64"
      this.function = new lambda.Function(this, `${id}-go`, {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        handler: "bootstrap",
        code: lambda.Code.fromAsset(path.resolve(codePath), {
          bundling: {
            image: cdk.DockerImage.fromRegistry("golang:1.21-alpine"),
            command: [
              "sh",
              "-c",
              [
                "cd /asset-input",
                "mkdir -p /tmp/go-cache",
                "GOCACHE=/tmp/go-cache go mod tidy",
                "GOCACHE=/tmp/go-cache go mod download",
                `GOCACHE=/tmp/go-cache GOOS=linux GOARCH=${goArch} go build -tags lambda.norpc -o bootstrap main.go`,
                "cp bootstrap /asset-output/",
              ].join(" && "),
            ],
            user: "root",
          },
        }),
        description: `Performance test function for Go (${architecture.name})`,
        timeout: cdk.Duration.seconds(10),
        architecture,
        environment: {
          STAGE: scope.stageName,
        },
      })
    } else if (runtime.name.startsWith("rust")) {
      this.function = new lambda.Function(this, `${id}-${runtime}`, {
        runtime: lambda.Runtime.PROVIDED_AL2023,
        handler: "bootstrap",
        code: lambda.Code.fromAsset(path.resolve(codePath)),
        description: `Performance test function for Rust (${architecture.name})`,
        timeout: cdk.Duration.seconds(10),
        architecture,
        environment: {
          STAGE: scope.stageName,
        },
      })
    } else {
      this.function = new lambda.Function(this, `${id}-${runtime}`, {
        runtime,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.resolve(codePath)),
        description: `Performance test function for ${runtime}`,
        timeout: cdk.Duration.seconds(10),
        architecture,
        environment: {
          STAGE: scope.stageName,
        },
      })
    }
  }
}
