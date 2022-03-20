import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { randomInt } from 'crypto';
import logger from '../logger';
import { Player } from '../types';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}

const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

type CheckGameDetailsResponse = {
  player: string;
  allPlayers: Array<Player>;
};

export async function checkGameDetails(
  connectionId: string,
  gameId: string
): Promise<CheckGameDetailsResponse> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'GSI2',
      KeyConditionExpression: '#pk = :gameId',
      ExpressionAttributeNames: {
        '#pk': 'GSI2PK',
      },
      ExpressionAttributeValues: {
        ':gameId': { S: gameId },
      },
    })
  );
  logger.debug(result);

  const player = result.Items?.find(
    (item) => item.GSI2SK?.S === `CONN#${connectionId}`
  )?.Player?.S;
  const allPlayers = Object.entries(
    result.Items?.find((item) => item.GSI2SK?.S === 'GAME')?.Characters?.M || {}
  ).map(([name, character]) => ({
    name: name,
    character: character.S || '',
  }));
  if (!(player && allPlayers)) {
    throw new Error('Game details not found');
  }
  return {
    player,
    allPlayers,
  };
}

export async function updateGame(gameId: string, allPlayers: Array<Player>) {
  const randomPlayer = 0; //randomInt(allPlayers.length);
  const updateResponse = await ddb.send(
    new UpdateItemCommand({
      TableName: table,
      Key: { PK: { S: `GAME#${gameId}` } },
      UpdateExpression:
        'SET #status = :inprogress, #nextPlayer = :nextPlayer, #players = :players',
      ConditionExpression:
        'attribute_exists(#pk) AND #status = :pending AND size(#characters) BETWEEN :min AND :max',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#status': 'Status',
        '#characters': 'Characters',
        '#players': 'Players',
        '#nextPlayer': 'NextPlayer',
      },
      ExpressionAttributeValues: {
        ':inprogress': { S: 'InProgress' },
        ':pending': { S: 'Pending' },
        ':min': { N: '2' },
        ':max': { N: '6' },
        ':nextPlayer': { S: allPlayers[randomPlayer].name },
        ':players': { L: allPlayers.map((p) => ({ S: p.name })) },
      },
    })
  );
  logger.debug(updateResponse, 'update response');
}
