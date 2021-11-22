import pino from 'pino';
import { createGame } from './dao';
import { handler } from './handler';

jest.mock('./dao');
jest.mock('../logger', () => pino({ enabled: false }));

describe('createGameHandler', () => {
  it('should return a 500 error if there is a problem in the dao', async () => {
    (createGame as jest.Mock).mockRejectedValue(new Error('some error'));
    const result = handler();
    await expect(result).resolves.toMatchObject({
      statusCode: 500,
      body: 'some error',
    });
  });
  it('should return the game id from the dao', async () => {
    (createGame as jest.Mock).mockReturnValue('abcde');
    const result = await handler();
    expect(result).toBe('{"gameId":"abcde"}');
  });
});
