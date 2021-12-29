import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { IEventBus } from '@aws-cdk/aws-events';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';

export interface JoinGameProps {
  table: ITable;
  wsApi: WebSocketApi;
  eventBus: IEventBus;
}

export default class JoinGame extends Construct {
  constructor(scope: Construct, id: string, props: JoinGameProps) {
    super(scope, id);
    const { table, wsApi, eventBus } = props;

    const handler = new NodejsFunction(this, 'Handler', {
      entry: require.resolve('@five-dice/game/src/joinGame'),
      environment: {
        TABLE: table.tableName,
        EVENTBUS_NAME: eventBus.eventBusName,
      },
    });

    handler.addToRolePolicy(
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
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/Connections`],
      })
    );
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
      })
    );
    wsApi.addRoute('$connect', {
      integration: new LambdaWebSocketIntegration({
        handler,
      }),
    });
  }
}
