import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { JsonPath } from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

interface UpdateDiceSuccessProps {
  table: ITable;
}

export class UpdateDiceSuccess extends DynamoUpdateItem {
  constructor(scope: Construct, id: string, { table }: UpdateDiceSuccessProps) {
    super(scope, id, {
      table,
      key: {
        PK: DynamoAttributeValue.fromString(JsonPath.stringAt('$.data.gameId')),
      },
      updateExpression: 'Remove Players[]',
    });
  }
}
