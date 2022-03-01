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
import getConnectionsForGameFactory, {
  Attributes,
} from '../getConnectionsForGame';

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

const getConnectionsForGame = getConnectionsForGameFactory(ddb, table);

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
        UpdateExpression: 'Add #playerNames :playerNames',
        ExpressionAttributeNames: {
          '#pk': 'PK',
          '#status': 'Status',
          '#playerNames': 'PlayerNames',
        },
        ExpressionAttributeValues: {
          ':playerNames': { SS: [player.name] },
          ':player': { S: player.name },
          ':maxItems': { N: '6' },
          ':pending': { S: 'Pending' },
        },
        ConditionExpression:
          '    attribute_exists(#pk) ' +
          'AND #status = :pending ' +
          'AND (' +
          '        attribute_not_exists(#playerNames) ' +
          '     OR (' +
          '         NOT contains(#playerNames, :player)' +
          '         AND size(#playerNames) < :maxItems' +
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
    const allPlayers = await getConnectionsForGame(gameId, [
      Attributes.player,
      Attributes.character,
    ]);
    logger.debug(allPlayers, 'find all players');

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
