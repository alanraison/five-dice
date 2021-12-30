import { Player } from '~/types';

export interface PendingState {
  state: 'pending';
  allPlayers: Array<Player>;
}

export type State = PendingState;
