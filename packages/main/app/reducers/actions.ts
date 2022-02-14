import { Player } from '~/types';

export interface Action {
  event: string;
}

export interface PlayerJoinedAction extends Action {
  event: 'player-joined';
  newPlayer: Player;
  allPlayers: Array<Player>;
}

export interface PlayerLeftAction extends Action {
  event: 'player-left';
  player: string;
  allPlayers: Array<string>;
}
