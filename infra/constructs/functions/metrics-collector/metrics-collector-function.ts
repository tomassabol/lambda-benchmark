import {
  BaseConstruct,
  type IBaseConstruct,
  NodeJsFunctionSimplePattern,
} from "@gymbeam/cdk-template"
import * as cdk from "aws-cdk-lib"
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as iam from "aws-cdk-lib/aws-iam"
import type * as lambda from "aws-cdk-lib/aws-lambda"

export class MetricsCollectorFunction extends BaseConstruct {
  public function: lambda.Function

  constructor(
    scope: IBaseConstruct,
    id: string,
    props: {
      statsTable: dynamodb.Table
    },
  ) {
    super(scope, id)

    const { statsTable } = props

    const { lambdaFunction } = new NodeJsFunctionSimplePattern(
      this,
      "metrics-collector",
      {
        description:
          "Collects performance metrics from CloudWatch and writes them to DynamoDB",
        entry: "src/functions/metrics/index.ts",
        environment: {
          STATS_TABLE_NAME: statsTable.tableName,
        },
        timeout: cdk.Duration.seconds(10),
        warmUp: false,
      },
    )
    this.function = lambdaFunction
    statsTable.grantWriteData(this.function)

    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "ssm:GetParameters",
          "logs:StartQuery",
          "logs:GetQueryResults",
        ],
      }),
    )
  }
}
