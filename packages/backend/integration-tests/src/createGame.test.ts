import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import request from 'supertest';
import { baseUrl, table } from './constants';

const ddb = new DynamoDBClient({});

describe('Create Game', () => {
  test('POST to game endpoint creates a game', async () => {
    const result = await request(baseUrl).post('/game').expect(200);
    expect(result.body).toMatchObject({
      gameId: expect.stringMatching(/[A-Za-z0-9\+\/=]+/),
    });
    const item = await ddb.send(
      new GetItemCommand({
        Key: { PK: { S: `GAME#${result.body.gameId}` } },
        TableName: table,
      })
    );
    expect(item.Item).toBeDefined();
    expect(item.Item?.Status.S).toBe('Pending');
  });
});
