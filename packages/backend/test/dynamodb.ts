import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

export async function createTable(client: DynamoDBClient, tableName: string) {
  const createTableCommand = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'PK', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: {
          NonKeyAttributes: ['CID', 'GID', 'Player', 'DiceCount'],
          ProjectionType: 'INCLUDE',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
        ],
        Projection: {
          NonKeyAttributes: [
            'Player',
            'Characters',
            'Players',
            'Bidder',
            'NextPlayer',
            'Dice',
            'Bid',
            'Status',
          ],
          ProjectionType: 'INCLUDE',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
  });
  await client.send(createTableCommand);
}
