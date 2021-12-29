import {
  HttpApi,
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2';
import { AttributeType, ProjectionType, Table } from '@aws-cdk/aws-dynamodb';
import { EventBus } from '@aws-cdk/aws-events';
import { HostedZone } from '@aws-cdk/aws-route53';
import {
  CfnOutput,
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import Broadcast from './broadcast';
import CreateGame from './createGame';
import JoinGame from './joinGame';
import LeaveGame from './leaveGame';

interface GameServerStackProps extends StackProps {
  /** Route53 zone in which to add the DNS names */
  zoneid: string;
}
export default class GameServerStack extends Stack {
  constructor(scope: Construct, id: string, props: GameServerStackProps) {
    super(scope, id, props);

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

    const eventBus = new EventBus(this, 'Events');

    const api = new HttpApi(this, 'FiveDiceApi', {});
    const wsApi = new WebSocketApi(this, 'Websocket');

    new CreateGame(this, 'CreateGame', { table, api });
    new JoinGame(this, 'JoinGame', { table, wsApi, eventBus });
    new LeaveGame(this, 'LeaveGame', { table, wsApi, eventBus });

    const wsStage = new WebSocketStage(this, 'default', {
      stageName: 'default',
      webSocketApi: wsApi,
      autoDeploy: true,
    });

    new Broadcast(this, 'Broadcast', {
      eventBus,
      table,
      wsApiStage: wsStage,
    });

    HostedZone.fromHostedZoneId(this, 'Zone', props.zoneid);

    // new RecordSet(this, 'GameServerApi', {
    //   recordType: RecordType.A,
    //   target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties()),
    //   zone,
    // });

    new CfnOutput(this, 'HttpApiUrl', {
      value: api.url || 'unknown',
    });
    new CfnOutput(this, 'WsApiUrl', {
      value: wsStage.url || 'unknown',
    });
  }
}
