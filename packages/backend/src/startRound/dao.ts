import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import logger from '../logger.js';
import { Status } from '../status.js';
import { DiceData } from './types.js';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not set');
}
const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

export async function getConnectionsForGame(gameId: string) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'GSI1',
      KeyConditionExpression: '#pk = :gameId AND begins_with(#sk, :conn)',
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
        '#sk': 'GSI1SK',
        '#cid': 'CID',
        '#diceCount': 'DiceCount',
        '#player': 'Player',
      },
      ExpressionAttributeValues: {
        ':gameId': { S: gameId },
        ':conn': { S: 'CONN#' },
        ':zero': { N: '0' },
      },
      ProjectionExpression: '#cid,#diceCount,#player',
      FilterExpression: '#diceCount > :zero',
    })
  );
  logger.info(result);
  return result.Items?.map(({ CID, DiceCount, Player }) => {
    if (!(CID?.S && Player?.S)) {
      throw Error(
        `Invalid Player data: connection id ${CID?.S}, Player Name ${Player?.S}`
      );
    }
    return {
      CID: CID.S,
      DiceCount: Number.parseInt(DiceCount.N || '0', 10),
      Player: Player.S,
    };
  });
}

/**
 *
 * @param gameId game identifier
 * @param connections dice by connection id and player name
 * @returns the next player to start
 */
export async function saveDice(
  gameId: string,
  connections: DiceData
): Promise<string> {
  const allDice: { [name: string]: AttributeValue } = Object.entries(
    connections.byPlayer
  ).reduce(
    (acc, [name, dice]) => ({
      ...acc,
      [name]: {
        L: dice.map((value) => ({ N: value.toString() })),
      },
    }),
    {}
  );
  const updates = await ddb.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
        UpdateExpression:
          'SET #dice = :dice, #bid = :bid, #status = :initialBid',
        ExpressionAttributeNames: {
          '#dice': 'Dice',
          '#bid': 'Bid',
          '#status': 'Status',
        },
        ExpressionAttributeValues: {
          ':dice': { M: allDice },
          ':bid': {
            M: {
              q: { N: '0' },
              v: { N: '7' },
            },
          },
          ':initialBid': { S: Status.INITIAL_BID },
        },
        ReturnValues: 'ALL_NEW',
      })
    );

  const nextPlayer = updates.Attributes?.NextPlayer?.S;
  if (!nextPlayer) {
    throw new Error('NextPlayer not found');
  }
  return nextPlayer;
}
