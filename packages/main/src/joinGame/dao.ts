/* eslint-disable max-classes-per-file */
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DateTime } from 'luxon';
import logger from '../logger';
import { Status } from '../status';
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
    const updateGameResult = await ddb.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
        UpdateExpression: 'Set #characters.#player = :character',
        ExpressionAttributeNames: {
          '#pk': 'PK',
          '#status': 'Status',
          '#characters': 'Characters',
          '#player': player.name,
        },
        ExpressionAttributeValues: {
          ':maxItems': { N: '6' },
          ':pending': { S: Status.PENDING },
          ':character': { S: player.character },
        },
        ConditionExpression:
          '    attribute_exists(#pk) ' +
          'AND #status = :pending ' +
          'AND (' +
          '        attribute_not_exists(#characters) ' +
          '     OR (' +
          '         attribute_not_exists(#characters.#player)' +
          '         AND size(#characters) < :maxItems' +
          '     )' +
          ')',
        ReturnValues: 'ALL_NEW',
      })
    );
    logger.debug(updateGameResult, 'update game');

    const addConnectionResult = await ddb.send(
      new PutItemCommand({
        TableName: table,
        Item: {
          PK: { S: `CONN#${connectionId}` },
          T: { S: 'Connection' },
          GSI1PK: { S: gameId },
          GSI1SK: { S: `CONN#${connectionId}` },
          GSI2PK: { S: gameId },
          GSI2SK: { S: `CONN#${connectionId}` },
          CID: { S: connectionId },
          GID: { S: gameId },
          Player: { S: player.name },
          Character: { S: player.character },
          DiceCount: { N: '5' },
          Ttl: { N: ttl },
        },
      })
    );
    logger.debug(addConnectionResult, 'add connection result');

    const allPlayers = Object.entries(
      updateGameResult.Attributes?.Characters?.M || {}
    ).map(([name, character]) => ({ name, character: character.S || '' }));
    return new SuccessfulJoinGameResponse(allPlayers);
  } catch (e) {
    if (isConditionalCheckFailedException(e)) {
      logger.info({ gameId, error: e }, 'Game not joinable');
      return new UnsuccessfulJoinGameResponse();
    }
    throw e;
  }
}
