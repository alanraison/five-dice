import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { open } from '~/reducers/commands';
import { useAppDispatch } from '~/reducers/hooks';
import { InProgressState, PendingState } from '~/reducers/state';
import { RootState } from '~/reducers/store';
import { Lobby } from './Lobby';
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
  }, [dispatch, wsUrl, gameId, name, character]);
  switch (state) {
    case PendingState:
      return <Lobby />;
    case InProgressState:
      return <Round />;
    default:
      return <div>other state</div>;
  }
}
