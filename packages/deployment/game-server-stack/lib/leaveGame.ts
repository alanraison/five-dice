import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { IEventBus } from '@aws-cdk/aws-events';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';

interface LeaveGameProps {
  table: ITable;
  eventBus: IEventBus;
  wsApi: WebSocketApi;
}

export default class LeaveGame extends Construct {
  constructor(scope: Construct, id: string, props: LeaveGameProps) {
    super(scope, id);
    const { table, wsApi, eventBus } = props;

    const handler = new NodejsFunction(this, 'Handler', {
      entry: require.resolve('@five-dice/game/src/leaveGame'),
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS: eventBus.eventBusName,
      },
    });

    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:DeleteItem'],
        resources: [table.tableArn],
      })
    );

    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
      })
    );

    wsApi.addRoute('$disconnect', {
      integration: new LambdaWebSocketIntegration({
        handler,
      }),
    });
  }
}
