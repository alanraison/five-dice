import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { randomInt } from 'crypto';
import logger from '../logger';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}

const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

type CheckGameDetailsResponse = {
  player: string;
  allPlayers: Array<string>;
};

export async function checkGameDetails(
  connectionId: string,
  gameId: string
): Promise<CheckGameDetailsResponse> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'Connections',
      KeyConditionExpression: '#pk = :gameId',
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
      },
      ExpressionAttributeValues: {
        ':gameId': { S: gameId },
      },
    })
  );
  logger.debug(result);

  const player = result.Items?.find(
    (item) => item.GSI1SK?.S === `CONN#${connectionId}`
  )?.Player?.S;
  const allPlayers = result.Items?.find(
    (item) => item.GSI1SK?.S === `GAME#${gameId}`
  )?.PlayerNames?.SS;
  if (!(player && allPlayers)) {
    throw new Error('Game details not found');
  }
  return {
    player,
    allPlayers,
  };
}

export async function updateGame(gameId: string, allPlayers: Array<string>) {
  const randomPlayer = randomInt(allPlayers.length);
  const updateResponse = await ddb.send(
    new UpdateItemCommand({
      TableName: table,
      Key: { PK: { S: `GAME#${gameId}` } },
      UpdateExpression:
        'SET #status = :inprogress, #currentBid = :initialBid, #nextToStart = :nextToStart, #players = :players',
      ConditionExpression:
        'attribute_exists(#pk) AND #status = :pending AND size(#playerNames) BETWEEN :min AND :max',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#status': 'Status',
        '#playerNames': 'PlayerNames',
        '#players': 'Players',
        '#currentBid': 'CurrentBid',
        '#nextToStart': 'NextToStart',
      },
      ExpressionAttributeValues: {
        ':inprogress': { S: 'InProgress' },
        ':pending': { S: 'Pending' },
        ':min': { N: '2' },
        ':max': { N: '6' },
        ':initialBid': { M: { q: { N: '0' }, v: { N: '7' } } },
        ':nextToStart': { S: allPlayers[randomPlayer] },
        ':players': { L: allPlayers.map((p) => ({ S: p })) },
      },
    })
  );
  logger.debug(updateResponse, 'update response');
}
