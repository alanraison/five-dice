import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
      handler: '',
      entry: require.resolve('../src/joinGame'),
      environment: {
        TABLE_NAME: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
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
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/Connections`],
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
