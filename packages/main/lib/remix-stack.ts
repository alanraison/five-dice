import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { CfnIntegration, CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { AttributeType, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import P from 'pino';
import { RemixApi, RemixFunction, RemixStaticBucket } from 'remix-cdk';
import { BidFunction } from './bidFunction';
import Broadcast from './broadcastFunction';
import JoinGame from './joinGameFunction';
import LeaveGame from './leaveGameFunction';
import { StartGame } from './startGameFunction';
import { StartRound } from './startRoundFunction';

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
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ['CID', 'GID', 'Player', 'DiceCount'],
    });
    table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: [
        'Player',
        'Characters',
        'Players',
        'NextPlayer',
        'Dice',
        'Bid',
      ],
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
    const startGame = new StartGame(this, 'StartGame', {
      table,
      eventBus,
    });
    const startRound = new StartRound(this, 'StartRound', {
      table,
      wsApiStage: wsStage,
    });
    const bid = new BidFunction(this, 'Bid', {
      eventBus,
      table,
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
    wsApi.addRoute('start', {
      integration: new WebSocketLambdaIntegration(
        'StartGameIntegration',
        startGame
      ),
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
  "input": "$util.escapeJavaScript($input.json('$')).replaceAll(\"\\\\'\",\"'\")",
  "stateMachineArn":"${bid.stateMachine.stateMachineArn}"
}`,
      },
    });

    new CfnRoute(this, 'BidRoute', {
      apiId: wsApi.apiId,
      routeKey: 'bid',
      target: `integrations/${bidIntegration.ref}`,
    });

    new Rule(this, 'Events', {
      eventBus,
      eventPattern: {
        source: ['five-dice-wsapi'],
      },
      targets: [new LambdaFunction(broadcast)],
    });
    new Rule(this, 'StartRoundEvent', {
      eventBus,
      eventPattern: {
        source: ['five-dice-wsapi'],
        detailType: ['game-started'],
      },
      targets: [new LambdaFunction(startRound)],
    });

    const staticBucket = new RemixStaticBucket(this, 'StaticBucket');
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
