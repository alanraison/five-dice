import { useState } from 'react';
import { bid } from '~/reducers/commands';
import { useAppDispatch } from '~/reducers/hooks';

export function Bid() {
  const dispatch = useAppDispatch();
  const [q, setQuantity] = useState(1);
  const [v, setValue] = useState(2);
  return (
    <div>
      <label htmlFor="q">
        Quantity
        <input
          name="q"
          type="number"
          min={1}
          value={q}
          onChange={(e) => setQuantity(e.target.valueAsNumber)}
        />
      </label>
      <label>
        Value
        <input
          name="v"
          type="number"
          min={2}
          max={7}
          onChange={(e) => setValue(e.target.valueAsNumber)}
        />
      </label>
      <button onClick={() => dispatch(bid(q, v))}>Bid!</button>
    </div>
  );
}
