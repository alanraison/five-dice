import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { JsonPath, TaskStateBaseProps } from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoReturnValues,
  DynamoUpdateItem,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

interface UpdateDiceSuccessProps extends TaskStateBaseProps {
  table: ITable;
  connectionId: string;
}

export class UpdateDice extends DynamoUpdateItem {
  constructor(
    scope: Construct,
    id: string,
    { table, connectionId, ...baseProps }: UpdateDiceSuccessProps
  ) {
    super(scope, id, {
      table,
      key: {
        PK: DynamoAttributeValue.fromString(connectionId),
      },
      updateExpression: 'Set #diceCount = #diceCount - :one',
      conditionExpression: '#diceCount > :zero',
      expressionAttributeNames: {
        '#diceCount': 'DiceCount',
      },
      expressionAttributeValues: {
        ':one': DynamoAttributeValue.fromNumber(1),
        ':zero': DynamoAttributeValue.fromNumber(0),
      },
      returnValues: DynamoReturnValues.ALL_NEW,
      ...baseProps,
    });
  }
}
