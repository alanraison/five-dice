/* eslint-disable import/prefer-default-export */
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import logger from '../logger';

if (!process.env.TABLE) {
  throw new Error('Initialisation Error: No Table given');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE;

function nameGenerator() {
  return randomBytes(4).toString('base64').substr(0, 6);
}

export async function createGame(): Promise<string> {
  const ttl = DateTime.now().plus({ days: 1 }).toSeconds().toString(10);
  for (
    let name = nameGenerator(), i = 0;
    i < 50;
    i += 1, name = nameGenerator()
  ) {
    const req = new PutItemCommand({
      TableName: table,
      Item: {
        PK: { S: `GAME#${name}` },
        T: { S: 'Game' },
        GSI1PK: { S: name },
        GSI1SK: { S: `GAME#${name}` },
        GID: { S: name },
        Status: { S: 'Pending' },
        Ttl: {
          N: ttl,
        },
      },
      ConditionExpression: 'attribute_not_exists(#pk)',
      ExpressionAttributeNames: {
        '#pk': 'PK',
      },
    });
    try {
      // eslint-disable-next-line no-await-in-loop
      await ddb.send(req);
      return name;
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === 'ConditionalCheckFailedException'
      ) {
        logger.info({
          gameId: name,
          msg: 'duplicate gameId created, trying again',
        });
      } else {
        logger.error({ msg: 'in createGame()', err });
        throw err;
      }
    }
  }
  throw new Error('Unable to create game.');
}
