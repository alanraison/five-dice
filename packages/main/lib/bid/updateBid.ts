import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { JsonPath } from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

interface UpdateBidTaskProps {
  table: ITable;
}

export class UpdateBidTask extends DynamoUpdateItem {
  constructor(scope: Construct, id: string, { table }: UpdateBidTaskProps) {
    super(scope, id, {
      table,
      key: {
        PK: DynamoAttributeValue.fromString(
          JsonPath.stringAt('$.data.gameKey')
        ),
      },
      updateExpression:
        'Set #bid = :bid, #nextPlayer = :nextPlayer, #bidder = :bidder',
      expressionAttributeNames: {
        '#bid': 'Bid',
        '#nextPlayer': 'NextPlayer',
        '#bidder': 'Bidder',
      },
      expressionAttributeValues: {
        ':bid': DynamoAttributeValue.fromMap({
          q: DynamoAttributeValue.numberFromString(
            JsonPath.stringAt("States.Format('{}', $.q)")
          ),
          v: DynamoAttributeValue.numberFromString(
            JsonPath.stringAt("States.Format('{}', $.v)")
          ),
        }),
        ':nextPlayer': DynamoAttributeValue.fromString(
          JsonPath.stringAt('$.data.nextPlayer')
        ),
        ':bidder': DynamoAttributeValue.fromString(
          JsonPath.stringAt('$.data.bidder')
        ),
      },
      resultPath: JsonPath.DISCARD,
    });
  }
}
