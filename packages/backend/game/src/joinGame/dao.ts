/* eslint-disable max-classes-per-file */
import {
  BatchWriteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DateTime } from 'luxon';
import logger from '../logger';

if (!process.env.TABLE) {
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
  constructor(readonly players: Array<string>) {}
}

export class UnsuccessfulJoinGameResponse {
  readonly reason = 'Game not joinable';
}

const table = process.env.TABLE;
const ddb = new DynamoDBClient({});

export default async function joinGameDAO(
  gameId: string,
  player: string,
  connectionId: string
) {
  try {
    const ttl = DateTime.now().plus({ days: 1 }).toSeconds().toString(10);
    const result = await ddb.send(
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
          ':players': { SS: [player] },
          ':player': { S: player },
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

    const players = result.Attributes?.Players.SS || [];

    await ddb.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [table]: [
            {
              PutRequest: {
                Item: {
                  PK: { S: `PLAYER#${gameId}#${player}` },
                  T: { S: 'Player' },
                  Name: { S: player },
                  CID: { S: connectionId },
                  Ttl: { N: ttl },
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  PK: { S: `CONN#${connectionId}` },
                  T: { S: 'Connection' },
                  GSI1PK: { S: gameId },
                  GSI1SK: { S: `CONN#${connectionId}` },
                  CID: { S: connectionId },
                  GID: { S: gameId },
                  Player: { S: player },
                  Ttl: { N: ttl },
                },
              },
            },
          ],
        },
      })
    );

    return new SuccessfulJoinGameResponse(players);
  } catch (e) {
    if (isConditionalCheckFailedException(e)) {
      logger.info({ msg: 'Game not joinable', gameId });
      return new UnsuccessfulJoinGameResponse();
    }
    throw e;
  }
}
