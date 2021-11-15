/* eslint-disable import/prefer-default-export */
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import handlerFactory from './handler';
import dao from './dao';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation Error: WSAPI_URL not defined');
}

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not defined');
}

export const handler = handlerFactory(
  dao(new DynamoDBClient({}), process.env.TABLE_NAME),
  new ApiGatewayManagementApiClient({
    endpoint: process.env.WSAPI_URL,
  })
);
