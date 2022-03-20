import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { players } from './reducer';
import { state } from './state';
import { rootSaga } from './saga';
import { round } from './round';
import { player } from './player';

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
  combineReducers({
    state,
    player,
    players,
    round,
  }),
  applyMiddleware(sagaMiddleware)
);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);
