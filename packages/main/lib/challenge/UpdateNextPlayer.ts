import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { JsonPath, TaskStateBaseProps } from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

interface UpdateNextPlayerProps extends TaskStateBaseProps {
  table: ITable;
  gameId: string;
  nextPlayer: string;
}

export default class UpdateNextPlayer extends DynamoUpdateItem {
  constructor(
    scope: Construct,
    id: string,
    { table, gameId, nextPlayer, ...baseProps }: UpdateNextPlayerProps
  ) {
    super(scope, id, {
      table,
      key: {
        PK: DynamoAttributeValue.fromString(gameId),
      },
      updateExpression: 'Set #nextPlayer = :nextPlayer',
      expressionAttributeNames: {
        '#nextPlayer': 'NextPlayer',
      },
      expressionAttributeValues: {
        ':nextPlayer': DynamoAttributeValue.fromString(nextPlayer),
      },
      ...baseProps,
    });
  }
}
