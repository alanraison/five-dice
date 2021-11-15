import { APIGatewayProxyResultV2 } from 'aws-lambda';
import joinGameDAOFactory from './dao';
import joinGameHandlerFactory, {
  APIGatewayWebsocketProxyEvent,
} from './handler';

jest.mock('./dao');

describe('joinGameHandler', () => {
  let joinGameHandler: (
    e: APIGatewayWebsocketProxyEvent
  ) => Promise<APIGatewayProxyResultV2>;
  const dao = jest.fn();
  beforeEach(() => {
    (joinGameDAOFactory as jest.Mock).mockReturnValue(dao);
    joinGameHandler = joinGameHandlerFactory(dao, jest.fn());
  });
  it("should return an error if the request doesn't contain the expected parameters", async () => {
    await expect(
      joinGameHandler({
        queryStringParameters: {},
        requestContext: {
          connectionId: 'aaa',
        },
      })
    ).resolves.toMatchObject({
      statusCode: 400,
    });
  });
  it('should register the player with the game', () => {
    joinGameHandler({
      queryStringParameters: {
        gameId: '123',
        name: 'alan',
      },
      requestContext: {
        connectionId: 'aaa',
      },
    });
    expect(dao).toBeCalledWith('123', 'alan', 'aaa');
  });
  it('should return an error if the DAO errors', async () => {
    dao.mockImplementation(() => {
      throw new Error('Some Error');
    });
    await expect(
      joinGameHandler({
        queryStringParameters: {
          gameId: '123',
          name: 'alan',
        },
        requestContext: {
          connectionId: 'bbb',
        },
      })
    ).resolves.toMatchObject({
      statusCode: 500,
      body: 'Some Error',
    });
  });
});
