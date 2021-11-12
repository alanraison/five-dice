/* eslint-disable import/prefer-default-export */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import createGameHandlerFactory from './handler';
import createGameDAOFactory from './dao';

if (!process.env.TABLE) {
  throw new Error('Initialisation Error: No Table given');
}

export const handler = createGameHandlerFactory({
  dao: createGameDAOFactory(new DynamoDBClient({}), process.env.TABLE),
});
