import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
    { table, wsApiStage }: BroadcastProps
  ) {
    super(scope, id, {
      entry: require.resolve('../src/broadcast'),
      environment: {
        TABLE_NAME: table.tableName,
        WSAPI_URL: wsApiStage.callbackUrl,
      },
    });
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/Connections`],
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
