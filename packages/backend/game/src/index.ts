/* eslint-disable import/prefer-default-export */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import createGameHandlerFactory from './createGame';
import GameService from './gameService';

if (!process.env.TABLE) {
  throw new Error('Initialisation Error: No Table given');
}

export const createGameHandler = createGameHandlerFactory({
  gameService: new GameService(new DynamoDBClient({}), process.env.TABLE),
});
