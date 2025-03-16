import {
  BaseConstruct,
  grantAppConfigAccess,
  type IBaseConstruct,
  NodeJsFunctionSimplePattern,
} from "@gymbeam/cdk-template"
import * as cdk from "aws-cdk-lib"
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import type * as lambda from "aws-cdk-lib/aws-lambda"

import { defaultNodeJsFunctionSimplePatternArgs } from "../../defaults/default-lambda-function-props"

export class ApiFunction extends BaseConstruct {
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
      ...defaultNodeJsFunctionSimplePatternArgs(this, id, {
        description: "API",
        entry: "src/functions/api/api-function.ts",
        environment: {
          STATS_TABLE_NAME: statsTable.tableName,
        },
        timeout: cdk.Duration.seconds(10),
        warmUp: { concurrency: 1 },
      }),
    )
    this.function = lambdaFunction

    grantAppConfigAccess(lambdaFunction)
    statsTable.grantReadData(lambdaFunction)
  }
}
