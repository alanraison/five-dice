import { describe, expect, it, beforeEach, vi } from 'vitest';
import { checkGameDetails, startGameRound } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { randomInt } from 'crypto';

vi.mock('crypto', () => {
  return {
    randomInt: vi.fn(() => 0),
  };
});

describe('StartGameDAO', () => {
  const mockDynamoDBClient = mockClient(DynamoDBClient);
  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.clearAllMocks();
  });
  describe('checkGameDetails', () => {
    it('should error if game id not found', async () => {
      const query = {
        ExpressionAttributeValues: {
          ':gameId': { S: 'nonexistent' },
        },
      };
      mockDynamoDBClient.on(QueryCommand, query).resolves({
        Items: [],
      });
      await expect(checkGameDetails('player', 'nonexistent')).rejects.toThrow(
        'Game details not found',
      );
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(QueryCommand, query);
    });
    it('should return an error if the player/connection is not found', async () => {
      const query = {
        ExpressionAttributeValues: {
          ':gameId': { S: 'game123' },
        },
      };
      mockDynamoDBClient.on(QueryCommand, query).resolves({
        Items: [
          {
            GSI2SK: { S: 'GAME' },
            Characters: {
              M: {
                Alice: { S: 'Warrior' },
                Bob: { S: 'Mage' },
              },
            },
          },
        ],
      });
      await expect(
        checkGameDetails('unknownConnection', 'game123'),
      ).rejects.toThrow('Game details not found');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(QueryCommand, query);
    });
    it('should return player and all players if found', async () => {
      const query = {
        ExpressionAttributeValues: {
          ':gameId': { S: 'game123' },
        },
      };
      mockDynamoDBClient.on(QueryCommand, query).resolves({
        Items: [
          {
            GSI2SK: { S: 'GAME' },
            Characters: {
              M: {
                Alice: { S: 'Warrior' },
                Bob: { S: 'Mage' },
              },
            },
          },
          {
            GSI2SK: { S: 'CONN#conn1' },
            Player: { S: 'Alice' },
          },
          {
            GSI2SK: { S: 'CONN#conn2' },
            Player: { S: 'Bob' },
          },
        ],
      });
      const result = await checkGameDetails('conn1', 'game123');
      expect(result).toEqual({
        player: 'Alice',
        allPlayers: [
          { name: 'Alice', character: 'Warrior' },
          { name: 'Bob', character: 'Mage' },
        ],
      });
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(QueryCommand, query);
    });
  });
  describe('startGameRound', () => {
    it("should return an error if the game id isn't found", async () => {
      const query = {
        Key: {
          PK: { S: 'GAME#nonexistent' },
        },
      };
      mockDynamoDBClient.on(UpdateItemCommand).rejects(
        new ConditionalCheckFailedException({
          $metadata: {},
          message: 'The conditional request failed',
        }),
      );
      await expect(() =>
        startGameRound('nonexistent', [
          { name: 'Alice', character: 'Warrior' },
          { name: 'Bob', character: 'Mage' },
        ]),
      ).rejects.toThrow('The conditional request failed');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(
        UpdateItemCommand,
        query,
      );
    });
    it('should choose a starting player', () => {
      vi.mocked(randomInt).mockImplementation(() => 1);
      startGameRound('game123', [
        { name: 'Alice', character: 'Warrior' },
        { name: 'Bob', character: 'Mage' },
        { name: 'Charlie', character: 'Rogue' },
      ]);
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(UpdateItemCommand, {
        Key: { PK: { S: 'GAME#game123' } },
        ExpressionAttributeValues: expect.objectContaining({
          ':nextPlayer': { S: 'Bob' },
        }),
      });
    });
    it('should set all of the players in the game record', () => {
      startGameRound('game123', [
        { name: 'Alice', character: 'Warrior' },
        { name: 'Bob', character: 'Mage' },
      ]);
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(UpdateItemCommand, {
        Key: { PK: { S: 'GAME#game123' } },
        ExpressionAttributeValues: expect.objectContaining({
          ':players': {
            L: [{ S: 'Alice' }, { S: 'Bob' }],
          },
        }),
      });
    });
  });
});
