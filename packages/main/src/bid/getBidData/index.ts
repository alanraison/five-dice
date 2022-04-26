import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';
import logger from '../../logger';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}

const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

const inputEvent = z.object({
  gameId: z.string(),
  connectionId: z.string(),
});

export async function handler({
  gameId,
  connectionId,
}: z.infer<typeof inputEvent>) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#sk': 'GSI2SK',
        '#player': 'Player',
        '#players': 'Players',
        '#nextPlayer': 'NextPlayer',
        '#bid': 'Bid',
      },
      ExpressionAttributeValues: {
        ':pk': { S: gameId },
      },
      ProjectionExpression: '#sk,#player,#players,#nextPlayer,#bid',
    })
  );
  logger.debug(result, 'getData Result');
  const player = result.Items?.find(
    (item) => item.GSI2SK?.S === `CONN#${connectionId}`
  )?.Player?.S;
  if (!player) {
    throw new Error('Player name not found');
  }
  const game = result.Items?.find((item) => item.GSI2SK?.S === 'GAME');
  if (!game) {
    throw new Error('Game item not found');
  }
  const players = game.Players?.L?.map((p) => {
    const name = p.S;
    if (!name) {
      throw new Error('Player name not found in Players list');
    }
    return name;
  });
  if (!players) {
    throw new Error('Players not found');
  }
  const nextPlayer = game.NextPlayer?.S;
  if (!nextPlayer) {
    throw new Error('NextPlayer not found');
  }
  const { q, v } = game.Bid?.M || { q: { N: '0' }, v: { N: '7' } };
  const currentBid = {
    q: Number.parseInt(q.N || '0', 10),
    v: Number.parseInt(v.N || '7', 10),
  };
  const currentIndex = players.indexOf(nextPlayer);
  const newNextPlayer = players[(currentIndex + 1) % players.length];
  return {
    isCurrentBidder: player === nextPlayer,
    currentBid,
    bidder: player,
    nextPlayer: newNextPlayer,
  };
}
