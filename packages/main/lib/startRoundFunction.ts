import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface StartRoundProps {
  table: ITable;
  wsApiStage: IWebSocketStage;
}

export class StartRound extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    { table, wsApiStage }: StartRoundProps
  ) {
    super(scope, id, {
      entry: require.resolve('../src/startRound'),
      environment: {
        TABLE_NAME: table.tableName,
        WSAPI_URL: wsApiStage.callbackUrl,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:UpdateItem'],
        resources: [table.tableArn],
      })
    );
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/GSI1`],
      })
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
      })
    );
  }
}
