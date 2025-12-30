import { join } from 'node:path';
import { type IWebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface SendMessageProps {
  wsApiStage: IWebSocketStage;
}

export class SendMessage extends NodejsFunction {
  constructor(scope: Construct, id: string, { wsApiStage }: SendMessageProps) {
    super(scope, id, {
      entry: join(import.meta.dirname, '../src/sendMessage/index.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      environment: {
        WSAPI_URL: wsApiStage.callbackUrl,
      },
      tracing: Tracing.ACTIVE,
      logGroup: new LogGroup(scope, 'SendMessageLogGroup', {
        retention: RetentionDays.ONE_DAY,
      }),
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
      },
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
      }),
    );
  }
}
