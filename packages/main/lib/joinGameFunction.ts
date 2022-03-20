import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface JoinGameProps {
  /** The dynamodb table for the game */
  table: ITable;
  /** The event bus to publish events to */
  eventBus: IEventBus;
}

export default class JoinGame extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    { table, eventBus }: JoinGameProps
  ) {
    super(scope, id, {
      entry: require.resolve('../src/joinGame'),
      environment: {
        TABLE_NAME: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });

    this.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'dynamodb:ConditionCheckItem',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
        ],
        resources: [table.tableArn],
      })
    );
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
      })
    );
  }
}
