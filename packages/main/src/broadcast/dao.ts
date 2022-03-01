import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import getConnectionsForGameFactory from '../getConnectionsForGame';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not defined');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE_NAME;

export const getConnectionsForGame = getConnectionsForGameFactory(ddb, table);
