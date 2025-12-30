import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from './handler.js';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

vi.mock('../logger.js');
const mockDynamoDBClient = mockClient(new DynamoDBClient());

describe('StartGame handler', () => {
  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.resetAllMocks();
  });
  it('should error if there are not enough players', async () => {
    await expect(() =>
      handler({
        requestContext: { connectionId: 'abcde' },
        body: JSON.stringify({ gameId: 'aaaa' }),
      })
    ).rejects.toThrow();
  });
  it.todo('should mark the game as in-progess', () => {});
  it.todo('should create a game-started event', () => {});
});
