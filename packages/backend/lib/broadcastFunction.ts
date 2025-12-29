import { join } from 'node:path';
import { type IWebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { Stack } from 'aws-cdk-lib';
import { type ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BroadcastProps {
  /** The dynamodb table containing the Game data */
  table: ITable;
  /** The WS API to broadcast to */
  wsApiStage: IWebSocketStage;
}
export default class Broadcast extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    { table, wsApiStage }: BroadcastProps,
  ) {
    super(scope, id, {
      entry: join(import.meta.dirname, '../src/broadcast/index.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      environment: {
        TABLE_NAME: table.tableName,
        WSAPI_URL: wsApiStage.callbackUrl,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
      },
    });
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/GSI1`],
      }),
    );
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
