import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { EventBus, Rule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct, Stack } from '@aws-cdk/core';

interface BroadcastProps {
  wsApiStage: IWebSocketStage;
  table: ITable;
  eventBus: EventBus;
}

export default class Broadcast extends Construct {
  constructor(scope: Construct, id: string, props: BroadcastProps) {
    super(scope, id);
    const { wsApiStage, table, eventBus } = props;

    const handler = new NodejsFunction(this, 'Handler', {
      entry: require.resolve('@five-dice/game/src/broadcast'),
      environment: {
        WSAPI_URL: wsApiStage.callbackUrl,
        TABLE_NAME: table.tableName,
      },
    });

    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:GetItem'],
        resources: [table.tableArn],
      })
    );
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [
          Stack.of(this).formatArn({
            service: 'execute-api',
            resource: `${wsApiStage.api.apiId}/${wsApiStage.stageName}/POST/@connections/{connectionId}`,
          }),
        ],
      })
    );

    new Rule(this, 'Events', {
      eventBus,
      eventPattern: {
        source: ['five-dice-wsapi'],
      },
      targets: [new LambdaFunction(handler)],
    });
  }
}
