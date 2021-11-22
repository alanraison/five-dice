/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import logger from '../logger';
import { createGame } from './dao';

export async function handler(): Promise<APIGatewayProxyResultV2> {
  try {
    const gameId = await createGame();
    return JSON.stringify({ gameId });
  } catch (e) {
    logger.error(e);
    return Promise.resolve({
      statusCode: 500,
      body: e instanceof Error ? e.message : 'unknown',
    });
  }
}
