import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { handlerFactory } from './handler.js';

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: No Event Bus given');
}

const eventBridgeClient = new EventBridgeClient();

const client = new DynamoDBClient();

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: No Table given');
}

export const handler = handlerFactory({
  ddb: client,
  tableName: process.env.TABLE_NAME,
  eventBusName: process.env.EVENTBUS_NAME,
  eventBridgeClient,
});
