import createGameHandlerFactory from './createGame';
import GameService from './gameService';

jest.mock('./gameService');

describe('createGameHandler', () => {
  const gameService = new GameService({} as any, '');
  const createGameHandler = createGameHandlerFactory({
    gameService,
  });
  it('should return 400 if there is no body in the request', () =>
    expect(createGameHandler({} as any)).resolves.toMatchObject({
      statusCode: 400,
    }));
  it('should return 400 if the body does not match the schema', () =>
    expect(
      createGameHandler({
        body: '["Invalid body"]',
      } as any)
    ).resolves.toMatchObject({
      statusCode: 400,
    }));
  it('should return a 400 if the body is invalid JSON', () =>
    expect(
      createGameHandler({
        body: '{Not valid JSON]',
      } as any)
    ).resolves.toMatchObject({
      statusCode: 400,
    }));
  it('should call the GameService if all input is valid', async () => {
    await createGameHandler({
      body: JSON.stringify({ name: 'alan' }),
    } as any);
    expect(gameService.createGame).toHaveBeenCalled();
  });
  it('should return a 500 error if there is a problem in the gameService', async () => {
    (gameService.createGame as jest.Mock).mockRejectedValue(
      new Error('some error')
    );
    const result = createGameHandler({
      body: JSON.stringify({ name: 'alan' }),
    } as any);
    await expect(result).resolves.toMatchObject({
      statusCode: 500,
    });
  });
  it('should return the game id from the gameService', async () => {
    (gameService.createGame as jest.Mock).mockReturnValue('abcde');
    const result = await createGameHandler({
      body: JSON.stringify({ name: 'alan' }),
    } as any);
    expect(result).toBe('abcde');
  });
});
