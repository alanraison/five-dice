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
import { Bid } from './bid';
import { Flow as BidFlow } from './bid/flow';
import Broadcast from './broadcastFunction';
import { Challenge } from './challenge';
import { Flow as ChallengeFlow } from './challenge/Flow';
import { GameTable } from './gameTable';
import JoinGame from './joinGameFunction';
import LeaveGame from './leaveGameFunction';
import { Remix } from './remix';
import { SendMessage } from './sendMessageFunction';
import { StartGame } from './startGameFunction';
import { StartRound } from './startRoundFunction';

export class RemixStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new GameTable(this, 'FiveDice');

    const wsApi = new WebSocketApi(this, 'Websocket');

    const wsStage = new WebSocketStage(this, 'default', {
      stageName: 'default',
      webSocketApi: wsApi,
      autoDeploy: true,
    });

    const eventBus = new EventBus(this, 'GameEvents');

    const join = new JoinGame(this, 'Connect', { table, eventBus });
    const leave = new LeaveGame(this, 'Disconnect', { table, eventBus });
    const sendMessageFunction = new SendMessage(this, 'SendMessage', {
      wsApiStage: wsStage,
    });
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

    new Bid(this, 'Bid', {
      eventBus,
      table,
      sendMessageFunction,
      wsApi,
    });
    new Challenge(this, 'Challenge', {
      eventBus,
      table,
      sendMessageFunction,
      wsApi,
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
    const remix = new Remix(this, 'Remix', {
      table,
      wsStage: wsStage,
    });

    new CfnOutput(this, 'apiUrl', {
      value: remix.api.url || '',
    });
    new CfnOutput(this, 'assetsBucket', {
      value: remix.staticBucket.bucketName,
    });
  }
}
