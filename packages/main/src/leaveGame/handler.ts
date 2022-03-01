/* eslint-disable import/prefer-default-export */
import {
  DeleteItemCommand,
  DynamoDBClient,
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

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: no EVENTBUS_NAME set');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE_NAME;
const eventBridgeClient = new EventBridgeClient({});
const eventBus = process.env.EVENTBUS_NAME;

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

  if (!gameId) {
    throw new Error('Game ID not found');
  }
  if (!player) {
    throw new Error('Player not found');
  }

  const updateResult = await ddb.send(
    new UpdateItemCommand({
      TableName: table,
      Key: {
        PK: { S: `GAME#${gameId}` },
      },
      UpdateExpression: 'Delete #playerNames :playerName',
      ExpressionAttributeNames: {
        '#playerNames': 'PlayerNames',
      },
      ExpressionAttributeValues: {
        ':playerName': { SS: [player as string] },
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  const players = updateResult.Attributes?.Players?.L?.map(
    (player) => player.S
  );
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
          Resources: [gameId],
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
