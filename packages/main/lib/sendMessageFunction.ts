import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface SendMessageProps {
  wsApiStage: IWebSocketStage;
}

export class SendMessage extends NodejsFunction {
  constructor(scope: Construct, id: string, { wsApiStage }: SendMessageProps) {
    super(scope, id, {
      entry: require.resolve('../src/sendMessage'),
      environment: {
        WSAPI_URL: wsApiStage.callbackUrl,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });
    this.addToRolePolicy(
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
  }
}
