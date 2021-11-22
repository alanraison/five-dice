/* eslint-disable import/prefer-default-export */
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
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
  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          DetailType: 'player-left',
          Detail: JSON.stringify({
            name: result.Attributes?.Player?.S,
            gameId: result.Attributes?.GID?.S,
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
