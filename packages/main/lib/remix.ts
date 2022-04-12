import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { RemixApi, RemixFunction, RemixStaticBucket } from 'remix-cdk';

interface RemixProps {
  table: ITable;
  wsStage: IWebSocketStage;
}

export class Remix extends Construct {
  readonly api: RemixApi;
  readonly staticBucket: RemixStaticBucket;
  constructor(scope: Construct, id: string, { table, wsStage }: RemixProps) {
    super(scope, id);

    this.staticBucket = new RemixStaticBucket(this, 'StaticBucket');
    const ssrFunction = new RemixFunction(this, 'Server', {
      serverBuildDirectory: 'server',
      environment: {
        TABLE_NAME: table.tableName,
        WS_API: wsStage.url,
      },
    });
    ssrFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        resources: [table.tableArn],
      })
    );
    this.api = new RemixApi(this, 'Api', {
      publicPath: '/_static/',
      ssrFunction,
      staticBucket: this.staticBucket,
    });
  }
}
