import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveGameDAO, leaveGameDAOFactory } from './dao.js';
import {
  DeleteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('LeaveGameDAO', () => {
  const client = new DynamoDBClient();
  const mockDynamoDBClient = mockClient(client);
  const tableName = 'LeaveGameTable';
  const leaveGameDAO: LeaveGameDAO = leaveGameDAOFactory(client, tableName);

  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.resetAllMocks();
  });

  describe('deleteConnection', () => {
    it('should delete the connection from the database', async () => {
      mockDynamoDBClient
        .on(DeleteItemCommand, {
          Key: {
            PK: { S: 'CONN#conn1' },
          },
        })
        .resolves({
          Attributes: {
            GID: { S: 'game1' },
            Player: { S: 'player1' },
          },
        });
      await leaveGameDAO.deleteConnection('conn1');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(DeleteItemCommand, {
        Key: {
          PK: { S: 'CONN#conn1' },
        },
      });
    });
    it("should error if the connection isn't associated with a game", async () => {
      mockDynamoDBClient.on(DeleteItemCommand).resolves({
        Attributes: {
          PlayerName: { S: 'player1' },
        },
      });
      await expect(() =>
        leaveGameDAO.deleteConnection('conn2'),
      ).rejects.toThrow('Game ID not found');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(DeleteItemCommand, {
        Key: {
          PK: { S: 'CONN#conn2' },
        },
      });
    });
    it("should error if the connection isn't associated with a player", async () => {
      mockDynamoDBClient.on(DeleteItemCommand).resolves({
        Attributes: {
          GID: { S: 'game2' },
        },
      });
      await expect(() =>
        leaveGameDAO.deleteConnection('conn3'),
      ).rejects.toThrow('Player not found');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(DeleteItemCommand, {
        Key: {
          PK: { S: 'CONN#conn3' },
        },
      });
    });
  });
  describe('removePlayerFromGame', () => {
    it('should remove the player from the game and return the updated player list', async () => {
      mockDynamoDBClient
        .on(UpdateItemCommand, {
          Key: {
            PK: { S: 'GAME#game1' },
          },
        })
        .resolves({
          Attributes: {
            Characters: {
              M: {
                player2: { S: 'character2' },
                player3: { S: 'character3' },
              },
            },
          },
        });
      const players = await leaveGameDAO.removePlayerFromGame(
        'game1',
        'player1',
      );
      expect(players).toEqual(['player2', 'player3']);
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(UpdateItemCommand, {
        Key: {
          PK: { S: 'GAME#game1' },
        },
        UpdateExpression: 'Remove #characters.#player',
        ExpressionAttributeNames: expect.objectContaining({
          '#player': 'player1',
        }),
      });
    });
  });
});
