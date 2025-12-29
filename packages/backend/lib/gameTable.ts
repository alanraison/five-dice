import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class GameTable extends Table {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'Ttl',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.addGlobalSecondaryIndex({
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
    this.addGlobalSecondaryIndex({
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
        'Bidder',
        'NextPlayer',
        'Dice',
        'Bid',
        'Status',
      ],
    });
  }
}
