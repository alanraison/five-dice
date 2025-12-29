import { join } from 'node:path';
import { type ITable } from 'aws-cdk-lib/aws-dynamodb';
import { type IEventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
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
    { table, eventBus }: JoinGameProps,
  ) {
    super(scope, id, {
      entry: join(import.meta.dirname, '../src/joinGame/index.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      environment: {
        TABLE_NAME: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24'
      }
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
      }),
    );
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
      }),
    );
  }
}
