import { IWebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { CfnIntegration, CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { Flow } from './challenge/Flow';
import { SendMessage } from './sendMessageFunction';

interface ChallengeProps {
  eventBus: IEventBus;
  table: ITable;
  sendMessageFunction: SendMessage;
  wsApi: IWebSocketApi;
}

export class Challenge extends Construct {
  constructor(scope: Construct, id: string, props: ChallengeProps) {
    super(scope, id);
    const { table, sendMessageFunction, wsApi, eventBus } = props;
    const challenge = new Flow(this, 'Challenge', {
      table,
      sendMessageFunction,
      eventBus,
    });
    const challengeIntegrationArn = Stack.of(challenge.stateMachine).formatArn({
      account: 'states',
      resource: 'action',
      resourceName: 'StartExecution',
      service: 'apigateway',
    });
    const challengeIntegration = new CfnIntegration(
      this,
      'ChallengeIntegration',
      {
        apiId: wsApi.apiId,
        integrationType: 'AWS',
        integrationUri: challengeIntegrationArn,
        integrationMethod: 'POST',
        credentialsArn: challenge.invokeRole.roleArn,
        templateSelectionExpression: 'challenge',
        requestTemplates: {
          challenge: `#set($body = $input.path('$'))
#set($dummy = $body.put("connectionId", $context.connectionId))
{
  "input": "$util.escapeJavaScript($input.json('$')).replaceAll(\"\\\\'\",\"'\")",
  "stateMachineArn":"${challenge.stateMachine.stateMachineArn}"
}`,
        },
      }
    );
    new CfnRoute(this, 'ChallengeRoute', {
      apiId: wsApi.apiId,
      routeKey: 'challenge',
      target: `integrations/${challengeIntegration.ref}`,
    });
  }
}
