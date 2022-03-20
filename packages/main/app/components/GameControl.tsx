import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch } from '~/reducers/hooks';
import { RootState } from '~/reducers/store';
import { open } from '~/reducers/commands';
import { Lobby } from './Lobby';
import { PendingState, InProgressState } from '~/reducers/state';
import { Round } from './Round';

interface GameControlProps {
  wsUrl: string;
  gameId: string;
  name: string;
  character: string;
}

export default function GameControl({
  wsUrl,
  gameId,
  name,
  character,
}: GameControlProps) {
  const state = useSelector((state: RootState) => state.state);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(open(wsUrl, gameId, name, character));
  }, [useDispatch, wsUrl, gameId, name, character]);
  switch (state) {
    case PendingState:
      return <Lobby />;
    case InProgressState:
      return <Round />;
    default:
      return <div>other state</div>;
  }
}
