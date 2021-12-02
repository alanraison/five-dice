/* eslint-disable import/prefer-default-export */
import {
  BatchExecuteStatementCommand,
  BatchWriteItemCommand,
  DeleteItemCommand,
  DynamoDBClient,
  TransactWriteItemsCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import logger from '../logger';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: no TABLE_NAME set');
}

if (!process.env.EVENT_BUS) {
  throw new Error('Initialisation Error: no EVENT_BUS set');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE_NAME;
const eventBridgeClient = new EventBridgeClient({});
const eventBus = process.env.EVENT_BUS;

interface APIGatewayWebsocketProxyEvent {
  requestContext: {
    connectionId: string;
  };
}

export async function handler(event: APIGatewayWebsocketProxyEvent) {
  logger.info({
    msg: 'Handling disconnect',
    connectionId: event.requestContext.connectionId,
  });
  const result = await ddb.send(
    new DeleteItemCommand({
      TableName: table,
      Key: {
        PK: { S: `CONN#${event.requestContext.connectionId}` },
      },
      ReturnValues: 'ALL_OLD',
    })
  );
  const gameId = result.Attributes?.GID?.S;
  const player = result.Attributes?.Player?.S;

  if (!(gameId || player)) {
    throw new Error('Game ID or Player not found');
  }

  const results = await Promise.allSettled([
    ddb.send(
      new DeleteItemCommand({
        TableName: table,
        Key: { PK: { S: `PLAYER#${gameId}#${player}` } },
      })
    ),
    ddb.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
        UpdateExpression: 'Delete #players :player',
        ExpressionAttributeNames: {
          '#players': 'Players',
        },
        ExpressionAttributeValues: {
          ':player': { SS: [player as string] },
        },
        ReturnValues: 'ALL_NEW',
      })
    ),
  ]);
  results.forEach((res) => {
    if (res.status === 'rejected') {
      throw new Error(res.reason);
    }
  });
  const updateResult = results[1];
  const players =
    updateResult.status === 'fulfilled'
      ? updateResult.value.Attributes?.Players?.SS
      : undefined;
  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          DetailType: 'player-left',
          Detail: JSON.stringify({
            player,
            allPlayers: players,
            gameId,
          }),
          Source: 'five-dice-wsapi',
          EventBusName: eventBus,
        },
      ],
    })
  );
  return {
    statusCode: 200,
  };
}
