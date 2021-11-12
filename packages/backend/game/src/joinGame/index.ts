/* eslint-disable import/prefer-default-export */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import joinGameHandlerFactory from './handler';
import joinGameDAOFactory from './dao';

if (!process.env.TABLE) {
  throw new Error('Initialisation Error: No Table given');
}

export const handler = joinGameHandlerFactory(
  joinGameDAOFactory(new DynamoDBClient({}), process.env.TABLE)
);
