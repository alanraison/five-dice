import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface LeaveGameProps {
  /** The table storing games */
  table: ITable;
  /** The event bus to publish events to */
  eventBus: IEventBus;
}

export default class LeaveGame extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    { table, eventBus }: LeaveGameProps
  ) {
    super(scope, id, {
      entry: require.resolve('../src/leaveGame'),
      environment: {
        TABLE_NAME: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
      tracing: Tracing.ACTIVE,
    });
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:DeleteItem', 'dynamodb:UpdateItem'],
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
