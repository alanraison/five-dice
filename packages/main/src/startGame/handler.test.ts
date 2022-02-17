import { handler } from './handler';

jest.mock('@aws-sdk/client-dynamodb');

describe('StartGame handler', () => {
  it('should error if there are not enough players', () => {
    expect(() =>
      handler({ requestContext: { connectionId: 'abcde' } })
    ).toThrow();
  });
  it('should mark the game as in-progess', () => {});
  it('should create a game-started event', () => {});
});
