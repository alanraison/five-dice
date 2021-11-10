import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Validator } from 'jsonschema';
import GameService from './gameService';

const validator = new Validator();
const createGameRequestSchema = {
  id: 'CreateGameRequest',
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

interface CreateGameRequest {
  name: string;
}

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

function getBody({
  body,
  isBase64Encoded,
}: {
  body?: string;
  isBase64Encoded: boolean;
}): CreateGameRequest {
  if (!body) {
    throw new Error('No request body provided');
  }

  const bodyString = isBase64Encoded
    ? Buffer.from(body, 'base64').toString('utf-8')
    : body;

  const bodyObj = JSON.parse(bodyString);
  const valid = validator.validate(bodyObj, createGameRequestSchema);
  if (!valid.valid) {
    throw new Error(valid.toString());
  }
  return bodyObj as CreateGameRequest;
}

export interface CreateGameHandlerProps {
  gameService: GameService;
}

export default function createGameHandlerFactory({
  gameService,
}: CreateGameHandlerProps) {
  return async function createGameHandler(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    let body: CreateGameRequest;
    try {
      body = getBody(event);
    } catch (e) {
      return Promise.resolve(handleError(e, 400));
    }
    try {
      const gameId = await gameService.createGame(body.name);
      return JSON.stringify({ gameId });
    } catch (e) {
      return Promise.resolve(handleError(e, 500));
    }
  };
}
