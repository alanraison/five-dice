import { JTDSchemaType } from 'ajv/dist/core';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import bodyParserFactory from '../bodyParser';
import { JoinGameDAO } from './dao';

interface JoinGameRequest {
  gameId: string;
  name: string;
}
const joinGameRequestSchema: JTDSchemaType<JoinGameRequest> = {
  properties: {
    gameId: { type: 'string' },
    name: { type: 'string' },
  },
};

export default function joinGameHandlerFactory(joinGameDAO: JoinGameDAO) {
  const bodyParser = bodyParserFactory(joinGameRequestSchema);
  return async function joinGameHandler(event: APIGatewayProxyEventV2) {
    console.log(JSON.stringify(event));
    let request: JoinGameRequest;
    try {
      request = bodyParser(event);
    } catch (e) {
      return Promise.resolve({
        statusCode: 400,
        body: e instanceof Error ? e.message : 'unknown error',
      });
    }
    try {
      return JSON.stringify({
        players: await joinGameDAO(request.gameId, request.name),
      });
    } catch (e) {
      return Promise.resolve({
        statusCode: 500,
        body: e instanceof Error ? e.message : 'unknown error',
      });
    }
  };
}
