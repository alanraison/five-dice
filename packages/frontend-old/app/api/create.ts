import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import logger from '~/logger';

const ddb = new DynamoDBClient({ endpoint: process.env.DYNAMO_ENDPOINT });
const table = process.env.TABLE_NAME;
if (!table) {
  throw new Error('Initialisation error: TABLE_NAME not found');
}

function nameGenerator() {
  return randomBytes(4)
    .toString('base64')
    .substring(0, 6)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
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
        GID: { S: name },
        Status: { S: 'Pending' },
        Characters: { M: {} },
        GSI2PK: { S: name },
        GSI2SK: { S: 'GAME' },
        Ttl: { N: ttl },
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
