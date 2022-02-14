import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { RemixApi, RemixFunction, RemixStaticBucket } from 'remix-cdk';
import Broadcast from './broadcastFunction';
import JoinGame from './joinGameFunction';
import LeaveGame from './leaveGameFunction';

export class RemixStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new Table(this, 'FiveDice', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'Ttl',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    table.addGlobalSecondaryIndex({
      indexName: 'Connections',
      partitionKey: {
        name: 'GSI1PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ['CID', 'GID', 'Player', 'Character'],
    });

    const wsApi = new WebSocketApi(this, 'Websocket');

    const wsStage = new WebSocketStage(this, 'default', {
      stageName: 'default',
      webSocketApi: wsApi,
      autoDeploy: true,
    });

    const eventBus = new EventBus(this, 'GameEvents');

    const join = new JoinGame(this, 'Connect', { table, eventBus });
    const leave = new LeaveGame(this, 'Disconnect', { table, eventBus });
    const broadcast = new Broadcast(this, 'Broadcast', {
      table,
      wsApiStage: wsStage,
    });

    wsApi.addRoute('$connect', {
      integration: new WebSocketLambdaIntegration('ConnectIntegration', join),
    });
    wsApi.addRoute('$disconnect', {
      integration: new WebSocketLambdaIntegration(
        'DisconnectIntegration',
        leave
      ),
    });
    new Rule(this, 'Events', {
      eventBus,
      eventPattern: {
        source: ['five-dice-wsapi'],
      },
      targets: [new LambdaFunction(broadcast)],
    });

    const staticBucket = new RemixStaticBucket(this, 'StaticBucket');
    const ssrFunction = new RemixFunction(this, 'Server', {
      serverBuildDirectory: 'server',
      environment: {
        TABLE_NAME: table.tableName,
        //API_URL: api.url || '',
        WS_API: wsStage.url,
      },
    });
    ssrFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        resources: [table.tableArn],
      })
    );
    const api = new RemixApi(this, 'Api', {
      publicPath: '/_static/',
      ssrFunction,
      staticBucket,
    });
    new CfnOutput(this, 'apiUrl', {
      value: api.url || '',
    });
    new CfnOutput(this, 'assetsBucket', {
      value: staticBucket.bucketName,
    });
  }
}
