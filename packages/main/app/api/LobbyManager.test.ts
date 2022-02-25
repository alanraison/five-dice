import LobbyManager from './LobbyManager';
import WS from 'jest-websocket-mock';

describe('LobbyManager', () => {
  let server: WS;
  beforeEach(() => {
    server = new WS('wss://localhost', { jsonProtocol: true });
  });
  afterEach(() => {
    server.close();
  });
  describe('in pending state', () => {
    it('should update the players list when a player joins', async () => {
      const dispatch = jest.fn();
      new LobbyManager(
        'wss://localhost',
        { gameId: 'game', name: 'player', character: 'character' },
        dispatch
      );
      await server.connected;
      server.send({
        event: 'player-joined',
        newPlayer: { name: 'player', character: 'character' },
        allPlayers: [{ name: 'player', character: 'character' }],
      });
      // await server.nextMessage;
      expect(dispatch).toHaveBeenCalledWith({
        event: 'player-joined',
        newPlayer: {
          name: 'player',
          character: 'character',
        },
        allPlayers: [{ name: 'player', character: 'character' }],
      });
    });
    it('should update the players list when a player leaves', async () => {
      const dispatch = jest.fn();
      new LobbyManager(
        'wss://localhost',
        {
          gameId: 'game',
          name: 'player1',
          character: 'char1',
        },
        dispatch
      );
      await server.connected;
      server.send({
        event: 'player-left',
        player: 'other-player',
        allPlayers: ['player1'],
      });
      // await server.nextMessage;
      expect(dispatch).toHaveBeenCalledWith({
        event: 'player-left',
        player: 'other-player',
        allPlayers: ['player1'],
      });
    });
  });
});
