import { challenge } from '~/reducers/commands';
import { useAppDispatch } from '~/reducers/hooks';

export function Challenge() {
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch(challenge())}>Challenge!</button>;
}
