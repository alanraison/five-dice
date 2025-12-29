import {
  AttributeValue,
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { NumberAttribute } from 'aws-cdk-lib/aws-cognito';
import logger from '../logger';
import { Bid, BidderType } from './types';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}

const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

export async function getData(gameId: string, connectionId: string) {
  // given a game id, check whether the given connection is the previous bidder, the next bidder or someone else
  // return the current bid and the game dice
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
        '#player': 'Player',
        '#players': 'Players',
        '#nextPlayer': 'NextPlayer',
        '#dice': 'Dice',
        '#bid': 'Bid',
      },
      ExpressionAttributeValues: {
        ':pk': { S: gameId },
      },
      ProjectionExpression: '#pk,#player,#players,#nextPlayer,#dice,#bid',
    })
  );
  logger.debug(result, 'getData Result');
  const player = result.Items?.find(
    (item) => item.GSI2PK?.S === `CONN#${connectionId}`
  )?.Player?.S;
  if (!player) {
    throw new Error('Player name not found');
  }
  const game = result.Items?.find((item) => item.GSI2PK?.S === 'GAME');
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
    q: parseInt(q.N || '0', 10),
    v: parseInt(v.N || '7', 10),
  };
  const diceAttrs = game.Dice.M;
  if (!diceAttrs) {
    throw new Error('Dice not found');
  }
  const dice = Object.entries(diceAttrs).reduce(
    (acc, [player, dice]) => ({
      ...acc,
      [player]: dice.L?.map((d) => parseInt(d.N || '0', 10)),
    }),
    {}
  );
  const currentIndex = players.indexOf(nextPlayer);
  const newNextPlayer = players[currentIndex + (1 % players.length)];
  return {
    bidderType: getBidderType(player, players, nextPlayer),
    currentBid,
    dice,
    bidder: player,
    nextPlayer: newNextPlayer,
  };
}

function getBidderType(
  player: string,
  players: Array<string>,
  nextPlayer: string
) {
  const bidder = players.indexOf(player);
  const next = players.indexOf(nextPlayer);
  if (bidder === next) {
    return BidderType.NEW_BIDDER;
  }
  if (bidder === (next - 1) % players.length) {
    return BidderType.OLD_BIDDER;
  }
  return BidderType.OTHER;
}

export async function saveBid(
  bid: Bid,
  gameId: string,
  bidder: string,
  nextPlayer: string
) {
  const response = await ddb.send(
    new UpdateItemCommand({
      TableName: table,
      Key: {
        PK: { S: `GAME#${gameId}` },
      },
      UpdateExpression:
        'SET #bid = :bid, #nextPlayer = :nextPlayer, #bidder = :bidder',
      ExpressionAttributeNames: {
        '#bid': 'Bid',
        '#nextPlayer': 'NextPlayer',
        '#bidder': 'Bidder',
      },
      ExpressionAttributeValues: {
        ':bid': {
          M: {
            q: { N: bid.q.toString() },
            v: { N: bid.v.toString() },
          },
        },
        ':nextPlayer': { S: nextPlayer },
        ':bidder': { S: bidder },
      },
    })
  );
  logger.info('saved new bid');
  logger.debug(response, 'saveBid response');
}
