import * as cdk from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export default class GameServerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'FiveDice', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'ttl',
    });

    const game = new NodejsFunction(this, 'Game', {
      entry: require.resolve('@five-dice/game'),
      handler: 'createGameHandler',
      environment: {
        TABLE: table.tableName,
      },
    });

    game.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'dynamodb:PutItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:GetItem',
        ],
        resources: [table.tableArn],
      })
    );
  }
}
