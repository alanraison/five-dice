import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}

const ddb = new DynamoDBClient({});
const TableName = process.env.TABLE_NAME;

const challengeEvent = z.object({
  gameId: z.string(),
  connectionId: z.string(),
});

export async function handler(event: any) {
  const { gameId, connectionId } = challengeEvent.parse(event);
  const result = await ddb.send(
    new QueryCommand({
      TableName,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: gameId },
      },
    })
  );
  if ((result.Count || 0) < 2) {
    throw new Error(`Unexpected result count: ${result.Count || 0}`);
  }
  const game = result.Items?.find((item) => item.GSI2SK.S === 'GAME');
  const challenger = result.Items?.find(
    (item) => item.GSI2SK.S === `CONN#${connectionId}`
  );
  if (!game) {
    throw new Error(`Game ${gameId} not found`);
  }
  if (!challenger) {
    throw new Error(`Connection ${connectionId} not found in game ${gameId}`);
  }
  const bidderName = game.Bidder?.S;
  const bidder = result.Items?.find((item) => item.Player?.S === bidderName);
  if (!bidder) {
    throw new Error(`Bidder ${bidderName} not found`);
  }
  const diceAttr = game.Dice.M;
  if (!diceAttr) {
    throw new Error('Dice attribute not found');
  }
  const dice = Object.entries(diceAttr).reduce(
    (acc, [player, dice]) => ({
      ...acc,
      [player]: dice.L?.map((d) => Number.parseInt(d.N || '0', 10)),
    }),
    {}
  );
  const bidAttr = game.Bid.M;
  if (!bidAttr) {
    throw new Error('Bid attribute not found');
  }
  const bid = {
    q: Number.parseInt(bidAttr.q?.N || '0', 10),
    v: Number.parseInt(bidAttr.v?.N || '0', 10),
  };
  const isCorrectPlayer = challenger.Player?.S === game.NextPlayer?.S;
  const challengerName = challenger.Player?.S;
  return {
    bid,
    dice,
    isCorrectPlayer,
    bidder: {
      name: bidderName,
      connectionId: bidder.GSI2SK.S,
    },
    challenger: {
      name: challengerName,
      connectionId: challenger.GSI2SK.S,
    },
    players: game.Players.L?.map((item) => item.S),
  };
}
