/* eslint-disable max-classes-per-file */
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DateTime } from 'luxon';
import logger from '../logger';
import { Player } from '../types';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: No Table given');
}

interface ConditionalCheckFailedException extends Error {
  name: 'ConditionalCheckFailedException';
}

function isConditionalCheckFailedException(
  o: any
): o is ConditionalCheckFailedException {
  return 'name' in o && o.name === 'ConditionalCheckFailedException';
}

export class SuccessfulJoinGameResponse {
  constructor(readonly players: Array<Player>) {}
}

export class UnsuccessfulJoinGameResponse {
  readonly reason = 'Game not joinable';
}

const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({ endpoint: process.env.DYNAMO_ENDPOINT });

export default async function joinGameDAO(
  gameId: string,
  player: Player,
  connectionId: string
) {
  try {
    const ttl = DateTime.now().plus({ days: 1 }).toSeconds().toString(10);
    await ddb.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
        UpdateExpression: 'Add #players :players',
        ExpressionAttributeNames: {
          '#pk': 'PK',
          '#status': 'Status',
          '#players': 'Players',
        },
        ExpressionAttributeValues: {
          ':players': { SS: [player.name] },
          ':player': { S: player.name },
          ':maxItems': { N: '6' },
          ':pending': { S: 'Pending' },
        },
        ConditionExpression:
          '    attribute_exists(#pk) ' +
          'AND #status = :pending ' +
          'AND (' +
          '        attribute_not_exists(#players) ' +
          '     OR (' +
          '         NOT contains(#players, :player)' +
          '         AND size(#players) < :maxItems' +
          '     )' +
          ')',
        ReturnValues: 'ALL_NEW',
      })
    );

    await ddb.send(
      new PutItemCommand({
        TableName: table,
        Item: {
          PK: { S: `CONN#${connectionId}` },
          T: { S: 'Connection' },
          GSI1PK: { S: gameId },
          GSI1SK: { S: `CONN#${connectionId}` },
          CID: { S: connectionId },
          GID: { S: gameId },
          Player: { S: player.name },
          Character: { S: player.character },
          Ttl: { N: ttl },
        },
      })
    );
    const allPlayers = await ddb.send(
      new QueryCommand({
        TableName: table,
        IndexName: 'Connections',
        KeyConditionExpression: '#pk = :gameId AND begins_with(#sk, :conn)',
        ExpressionAttributeNames: {
          '#pk': 'GSI1PK',
          '#sk': 'GSI1SK',
          '#player': 'Player',
          '#character': 'Character',
        },
        ExpressionAttributeValues: {
          ':gameId': { S: gameId },
          ':conn': { S: 'CONN#' },
        },
        ProjectionExpression: '#player,#character',
      })
    );

    return new SuccessfulJoinGameResponse(
      allPlayers.Items?.map((item) => ({
        name: item.Player?.S || 'unknown',
        character: item.Character?.S || '',
      })) || []
    );
  } catch (e) {
    if (isConditionalCheckFailedException(e)) {
      logger.info({ msg: 'Game not joinable', gameId });
      return new UnsuccessfulJoinGameResponse();
    }
    throw e;
  }
}
