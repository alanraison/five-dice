import { string, z } from 'zod';
import Ajv from 'ajv/dist/jtd';

const WebsocketEvent = z.object({
  event: z.string(),
});

const PlayerJoinedEvent = WebsocketEvent.extend({
  event: z.literal('player-joined'),
  newPlayer: z.object({
    name: z.string(),
    character: z.string(),
  }),
  allPlayers: z.array(
    z.object({
      name: z.string(),
      character: z.string(),
    })
  ),
});

const PlayerLeftEvent = WebsocketEvent.extend({
  event: z.literal('player-left'),
  player: z.string(),
  allPlayers: z.array(z.string()),
});

const GameStartedEvent = WebsocketEvent.extend({
  startedBy: z.string(),
});

export interface GameData {
  gameId: string;
  name: string;
  character: string;
}

export default class LobbyManager {
  #websocket: WebSocket;
  static #startMessage = JSON.stringify({ action: 'start' });
  constructor(
    wsUrl: string,
    { gameId, name, character }: GameData,
    dispatch: (a: any) => void
  ) {
    const url = new URL(wsUrl);
    url.searchParams.set('gameId', gameId);
    url.searchParams.set('name', name);
    url.searchParams.set('character', character);
    this.#websocket = new WebSocket(url);
    this.#websocket.onmessage = (messageEvent: MessageEvent) => {
      const data = JSON.parse(messageEvent.data);
      switch (data.event) {
        default:
          dispatch(data);
      }
    };
  }
  start() {
    this.#websocket.send(LobbyManager.#startMessage);
  }
}
