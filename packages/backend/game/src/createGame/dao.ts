import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';

function nameGenerator() {
  return randomBytes(4).toString('base64').substr(0, 6);
}

export type CreateGameDAO = (owner: string) => Promise<string>;

export default function createGameDAOFactory(
  ddb: DynamoDBClient,
  table: string
) {
  return async function createGame(owner: string): Promise<string> {
    let lastError: unknown | undefined;
    for (
      let name = nameGenerator(), i = 0;
      i < 50;
      i += 1, name = nameGenerator()
    ) {
      const req = new PutItemCommand({
        TableName: table,
        Item: {
          PK: { S: `GAME#${name}` },
          // SK: { S: name },
          Owner: { S: owner },
          Status: { S: 'Pending' },
          T: { S: 'Game' },
          Ttl: {
            N: DateTime.now().plus({ days: 1 }).toSeconds().toString(10),
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
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(`Unable to create game. Last error: ${lastError}`);
  } as CreateGameDAO;
}
