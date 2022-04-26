import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { JsonPath } from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { Status } from '../../src/status';

interface UpdateBidTaskProps {
  table: ITable;
}

export class UpdateBidTask extends DynamoUpdateItem {
  constructor(scope: Construct, id: string, { table }: UpdateBidTaskProps) {
    super(scope, id, {
      table,
      key: {
        PK: DynamoAttributeValue.fromString(
          JsonPath.stringAt("States.Format('GAME#{}', $.gameId)")
        ),
      },
      updateExpression:
        'Set #bid = :bid, #nextPlayer = :nextPlayer, #bidder = :bidder, #status = :bidding',
      expressionAttributeNames: {
        '#bid': 'Bid',
        '#nextPlayer': 'NextPlayer',
        '#bidder': 'Bidder',
        '#status': 'Status',
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
        ':bidding': DynamoAttributeValue.fromString(Status.BIDDING),
      },
      resultPath: JsonPath.DISCARD,
    });
  }
}
