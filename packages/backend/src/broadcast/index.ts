import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { handlerFactory } from './handler.js';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { broadcastDAOFactory } from './dao.js';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not defined');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE_NAME;

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation Error: WSAPI_URL not defined');
}

const apiGwClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

export const handler = handlerFactory(apiGwClient, broadcastDAOFactory(ddb, table));
