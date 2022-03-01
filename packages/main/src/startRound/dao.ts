import {
  AttributeValue,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import getConnectionsForGameFactory from '../getConnectionsForGame';
import { DiceData } from './types';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not set');
}
const table = process.env.TABLE_NAME;
const ddb = new DynamoDBClient({});

export const getConnectionsForGame = getConnectionsForGameFactory(ddb, table);

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
  const updates = await Promise.allSettled([
    ddb.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
        UpdateExpression: 'SET #dice = :dice',
        ExpressionAttributeNames: {
          '#dice': 'Dice',
        },
        ExpressionAttributeValues: {
          ':dice': { M: allDice },
        },
        ReturnValues: 'ALL_NEW',
      })
    ),
    Object.entries(connections.byConnection).map(([conn, dice]) =>
      ddb.send(
        new UpdateItemCommand({
          TableName: table,
          Key: {
            PK: { S: `CONN#${conn}` },
          },
          UpdateExpression: 'SET #dice = :dice',
          ExpressionAttributeNames: {
            '#dice': 'Dice',
          },
          ExpressionAttributeValues: {
            ':dice': {
              L: dice.map((d) => ({ N: d.toString() })),
            },
          },
        })
      )
    ),
  ]);
  const failed = updates.filter(
    (promise) => promise.status === 'rejected'
  ) as Array<PromiseRejectedResult>;
  if (failed.length > 0) {
    throw new Error(`Some updates failed: ${failed.map((p) => p.reason)}`);
  }
  const nextToStart =
    updates[0].status === 'fulfilled'
      ? updates[0].value.Attributes?.NextToStart?.S
      : undefined;
  if (!nextToStart) {
    throw new Error('NextToStart not found');
  }
  return nextToStart;
}
