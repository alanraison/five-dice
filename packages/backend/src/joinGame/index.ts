import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { handlerFactory } from './handler.js';
import { queuerFactory } from './event.js';
import { joinGameDAOFactory } from './dao.js';

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: No Event Bus given');
}

const eventBridgeClient = new EventBridgeClient();

const client = new DynamoDBClient();

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: No Table given');
}

export const handler = handlerFactory(
  joinGameDAOFactory(client, process.env.TABLE_NAME),
  queuerFactory(eventBridgeClient, process.env.EVENTBUS_NAME),
);
