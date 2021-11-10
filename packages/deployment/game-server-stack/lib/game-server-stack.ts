import * as cdk from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import {
  HostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from '@aws-cdk/aws-route53';
import { ApiGatewayv2DomainProperties } from '@aws-cdk/aws-route53-targets';

interface GameServerStackProps extends cdk.StackProps {
  /** Route53 zone in which to add the DNS names */
  zoneid: string;
}
export default class GameServerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: GameServerStackProps) {
    super(scope, id, props);

    const table = new Table(this, 'FiveDice', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'ttl',
    });

    const createGame = new NodejsFunction(this, 'CreateGame', {
      entry: require.resolve('@five-dice/game'),
      handler: 'createGameHandler',
      environment: {
        TABLE: table.tableName,
      },
    });

    createGame.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'dynamodb:PutItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:GetItem',
        ],
        resources: [table.tableArn],
      })
    );

    const api = new HttpApi(this, 'FiveDiceApi', {});

    api.addRoutes({
      path: '/game',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: createGame,
      }),
    });

    const zone = HostedZone.fromHostedZoneId(this, 'Zone', props.zoneid);

    // new RecordSet(this, 'GameServerApi', {
    //   recordType: RecordType.A,
    //   target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties()),
    //   zone,
    // });
  }
}
