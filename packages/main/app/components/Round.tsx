import { startMyTurn } from '~/reducers/actions';
import { useAppDispatch, useAppSelector } from '~/reducers/hooks';
import { Bid } from './Bid';
import { Die } from './Die';
import { Players } from './Players';

export function Round() {
  const round = useAppSelector((state) => state.round);
  const player = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();
  if (player.name === round.player) {
    dispatch(startMyTurn());
  }
  return (
    <div>
      <Players />
      <div id="dice">
        <p>Your Dice:</p>
        <ul>
          {round.dice.map((die) => (
            <Die value={die} />
          ))}
        </ul>
      </div>
      <Bid />
    </div>
  );
}
