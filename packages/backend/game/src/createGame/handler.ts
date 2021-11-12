import { JTDSchemaType } from 'ajv/dist/core';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import bodyParserFactory from '../bodyParser';
import { CreateGameDAO } from './dao';

interface CreateGameRequest {
  name: string;
}

const createGameRequestSchema: JTDSchemaType<CreateGameRequest> = {
  properties: {
    name: { type: 'string' },
  },
};

function handleError(e: unknown, statusCode: number) {
  if (e instanceof Error) {
    return {
      statusCode,
      body: e.message,
    };
  }
  return {
    statusCode: 500,
    body: 'unknown error',
  };
}

export interface CreateGameHandlerProps {
  dao: CreateGameDAO;
}

export default function createGameHandlerFactory({
  dao,
}: CreateGameHandlerProps) {
  const bodyParser = bodyParserFactory(createGameRequestSchema);
  return async function createGameHandler(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    let body: CreateGameRequest;
    try {
      body = bodyParser(event);
    } catch (e) {
      return Promise.resolve(handleError(e, 400));
    }
    try {
      const gameId = await dao(body.name);
      return JSON.stringify({ gameId });
    } catch (e) {
      return Promise.resolve(handleError(e, 500));
    }
  };
}
