/* eslint-disable import/prefer-default-export */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import joinGameHandlerFactory from './handler';
import joinGameDAOFactory from './dao';
import eventQueueFactory from './eventqueue';

if (!process.env.TABLE) {
  throw new Error('Initialisation Error: No Table given');
}
if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: No Event Bus given');
}

export const handler = joinGameHandlerFactory(
  joinGameDAOFactory(new DynamoDBClient({}), process.env.TABLE),
  eventQueueFactory(new EventBridgeClient({}), process.env.EVENTBUS_NAME)
);
