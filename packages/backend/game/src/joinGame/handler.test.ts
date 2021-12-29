import pino from 'pino';
import joinGame, { UnsuccessfulJoinGameResponse } from './dao';
import { handler } from './handler';

jest.mock('./dao');
jest.mock('../logger', () => pino({ enabled: false }));

describe('joinGameHandler', () => {
  it("should return an error if the request doesn't contain the expected parameters", async () => {
    await expect(
      handler({
        queryStringParameters: {},
        requestContext: {
          connectionId: 'aaa',
        },
      })
    ).resolves.toMatchObject({
      statusCode: 400,
    });
  });
  it('should register the player with the game', async () => {
    (joinGame as jest.Mock).mockReturnValue({
      players: [
        {
          name: 'alan',
          character: 'char1',
        },
        { name: 'bob', character: 'char2' },
      ],
    });
    const response = await handler({
      queryStringParameters: {
        gameId: '123',
        name: 'alan',
        character: 'char1',
      },
      requestContext: {
        connectionId: 'aaa',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      players: expect.arrayContaining([{ name: 'alan', character: 'char1' }]),
    });
  });
  it('should return an error if the DAO errors', async () => {
    (joinGame as jest.Mock).mockImplementation(() => {
      throw new Error('Some Error');
    });
    await expect(
      handler({
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
  it('should return an error if the join was unsuccessful', async () => {
    (joinGame as jest.Mock).mockImplementation(() => {
      const response = new UnsuccessfulJoinGameResponse();
      Object.assign(response, {
        reason: 'Mock reason',
      });
      return response;
    });
    const result = await handler({
      queryStringParameters: {
        gameId: '123',
        name: 'player1',
      },
      requestContext: {
        connectionId: 'bbb',
      },
    });
    expect(UnsuccessfulJoinGameResponse).toHaveBeenCalled();
    expect(result).toMatchObject({
      statusCode: 400,
      body: 'Mock reason',
    });
  });
});
