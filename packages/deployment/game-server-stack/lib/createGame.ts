import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';

interface CreateGameProps {
  table: ITable;
  api: HttpApi;
}

export default class CreateGame extends Construct {
  constructor(scope: Construct, id: string, props: CreateGameProps) {
    super(scope, id);
    const { table, api } = props;

    const handler = new NodejsFunction(this, 'Handler', {
      entry: require.resolve('@five-dice/game/src/createGame'),
      environment: {
        TABLE: table.tableName,
      },
    });

    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:PutItem'],
        resources: [table.tableArn],
      })
    );

    api.addRoutes({
      path: '/game',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler,
      }),
    });
  }
}
