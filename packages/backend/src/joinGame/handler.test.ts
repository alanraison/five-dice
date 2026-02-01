import { afterEach, describe, expect, it, vi } from 'vitest';
import { UnsuccessfulJoinGameResponse } from './dao.js';
import { handlerFactory } from './handler.js';

vi.mock('./dao.js');
vi.mock('./event.js');

describe('joinGameHandler', () => {
  const joinGame = vi.fn();
  const queuer = vi.fn();

  const handler = handlerFactory(
    joinGame,
    queuer,
  );

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return an error if the request doesn't contain a gameId parameter", async () => {
    await expect(
      handler({
        queryStringParameters: {
          name: 'player',
          character: 'character',
        },
        requestContext: {
          connectionId: 'aaa',
        },
      }),
    ).resolves.toMatchObject({
      statusCode: 400,
    });
  });
  it("should return an error if the request doesn't contain a name parameter", async () => {
    await expect(
      handler({
        queryStringParameters: {
          gameId: 'aaabbb',
          character: 'character',
        },
        requestContext: {
          connectionId: 'aaa',
        },
      }),
    ).resolves.toMatchObject({
      statusCode: 400,
    });
  });
  it("should return an error if the request doesn't contain a character parameter", async () => {
    await expect(
      handler({
        queryStringParameters: {
          gameId: 'aaabbb',
          name: 'player',
        },
        requestContext: {
          connectionId: 'aaa',
        },
      }),
    ).resolves.toMatchObject({
      statusCode: 400,
    });
  });
  it('should register the player with the game', async () => {
    vi.mocked(joinGame).mockResolvedValue({
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
    vi.mocked(joinGame).mockImplementation(() => {
      throw new Error('Some Error');
    });
    await expect(
      handler({
        queryStringParameters: {
          gameId: '123',
          name: 'alan',
          character: 'character',
        },
        requestContext: {
          connectionId: 'bbb',
        },
      }),
    ).resolves.toMatchObject({
      statusCode: 500,
      body: 'Some Error',
    });
  });
  it('should return an error if the join was unsuccessful', async () => {
    vi.mocked(joinGame).mockImplementation(() => {
      const response = new UnsuccessfulJoinGameResponse();
      Object.assign(response, {
        reason: 'Mock reason',
      });
      return Promise.resolve(response);
    });
    const result = await handler({
      queryStringParameters: {
        gameId: '123',
        name: 'player1',
        character: 'character',
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
