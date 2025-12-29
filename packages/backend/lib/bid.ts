import { type IWebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Stack } from 'aws-cdk-lib';
import { CfnIntegration, CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { type ITable } from 'aws-cdk-lib/aws-dynamodb';
import { type IEventBus } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { Flow } from './bid/flow.js';
import { SendMessage } from './sendMessageFunction.js';

interface BidProps {
  eventBus: IEventBus;
  table: ITable;
  sendMessageFunction: SendMessage;
  wsApi: IWebSocketApi;
}

export class Bid extends Construct {
  constructor(scope: Construct, id: string, props: BidProps) {
    super(scope, id);
    const { eventBus, table, sendMessageFunction, wsApi } = props;
    const bid = new Flow(this, 'Bid', {
      eventBus,
      table,
      sendMessageFunction,
    });
    const integrationArn = Stack.of(bid.stateMachine).formatArn({
      account: 'states',
      resource: 'action',
      resourceName: 'StartExecution',
      service: 'apigateway',
    });
    const bidIntegration = new CfnIntegration(this, 'BidIntegration', {
      apiId: wsApi.apiId,
      integrationType: 'AWS',
      integrationUri: integrationArn,
      integrationMethod: 'POST',
      credentialsArn: bid.invokeRole.roleArn,
      templateSelectionExpression: 'bid',
      requestTemplates: {
        bid: `#set($body = $input.path('$'))
#set($dummy = $body.put("connectionId", $context.connectionId))
{
  "input": "$util.escapeJavaScript($input.json('$')).replaceAll("\\\\'","'")",
  "stateMachineArn":"${bid.stateMachine.stateMachineArn}"
}`,
      },
    });
    new CfnRoute(this, 'BidRoute', {
      apiId: wsApi.apiId,
      routeKey: 'bid',
      target: `integrations/${bidIntegration.ref}`,
    });
  }
}
