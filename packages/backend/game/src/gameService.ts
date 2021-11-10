import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';

export default class GameService {
  constructor(private ddb: DynamoDBClient, private table: string) {}

  async createGame(owner: string): Promise<string> {
    let lastError: unknown | undefined;
    for (
      let name = GameService.nameGenerator(), i = 0;
      i < 50;
      i += 1, name = GameService.nameGenerator()
    ) {
      const req = new PutItemCommand({
        TableName: this.table,
        Item: {
          PK: { S: name },
          Owner: { S: owner },
          Status: { S: 'Pending' },
          ttl: {
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
        await this.ddb.send(req);
        return name;
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(`Unable to create game. Last error: ${lastError}`);
  }

  private static nameGenerator() {
    return randomBytes(4).toString('base64').substr(0, 6);
  }
}
