import { BaseConstruct, type IBaseConstruct } from "@gymbeam/cdk-template"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

import { defaultDynamoDbTableArgs } from "../defaults/default-dynamodb-table-props"

/**
 * Table to store performance test results
 */

export class StatsTable extends BaseConstruct {
  public table: dynamodb.Table

  constructor(scope: IBaseConstruct, id: string) {
    super(scope, id)

    this.table = new dynamodb.Table(
      ...defaultDynamoDbTableArgs(this, id, {
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }),
    )
  }
}
