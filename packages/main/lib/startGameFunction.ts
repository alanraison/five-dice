import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface StartGameProps {
  table: ITable;
  eventBus: IEventBus;
}

export class StartGame extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    { table, eventBus }: StartGameProps
  ) {
    super(scope, id, {
      entry: require.resolve('../src/startGame'),
      environment: {
        TABLE_NAME: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
        resources: [table.tableArn],
      })
    );
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/GSI2`],
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
