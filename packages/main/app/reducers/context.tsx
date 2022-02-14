import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
} from 'react';
import { Action } from './actions';
import { reducer } from './reducer';
import { State } from './state';

const initialState: State = {
  state: 'pending',
  allPlayers: [],
};

const Context = createContext({
  state: initialState,
  dispatch: (a: Action) => {},
});

function ReducerProvider({ children }: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}

const useGameReducer = () => useContext(Context);

export { ReducerProvider, useGameReducer };
