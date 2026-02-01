import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { handlerFactory } from './handler.js';
import { leaveGameDAOFactory } from './dao.js';
import { queuerFactory } from './event.js';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: no TABLE_NAME set');
}
const table = process.env.TABLE_NAME;

export const ddb = new DynamoDBClient({});

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: no EVENTBUS_NAME set');
}
const eventBridgeClient = new EventBridgeClient({});
const eventBus = process.env.EVENTBUS_NAME;

export const handler = handlerFactory(
  leaveGameDAOFactory(ddb, table),
  queuerFactory(eventBridgeClient, eventBus),
);
