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

export interface CreateGameHandlerProps {
  gameService: GameService;
}

export default function createGameHandlerFactory({
  gameService,
}: CreateGameHandlerProps) {
  return async function createGameHandler(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    if (!event.body) {
      return Promise.resolve({
        statusCode: 400,
        body: 'Bad Request',
      });
    }
    let body: CreateGameRequest;
    try {
      const parsed = JSON.parse(event.body || '');
      const valid = validator.validate(parsed, createGameRequestSchema);
      if (!valid.valid) {
        return await Promise.resolve({
          statusCode: 400,
          body: valid.toString(),
        });
      }
      body = parsed as CreateGameRequest;
    } catch (e) {
      return Promise.resolve(handleError(e, 400));
    }
    try {
      return await gameService.createGame(body.name);
    } catch (e) {
      return Promise.resolve(handleError(e, 500));
    }
  };
}
