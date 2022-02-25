import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { players, state } from './reducer';
import { rootSaga } from './saga';

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
  combineReducers({
    state,
    players,
  }),
  applyMiddleware(sagaMiddleware)
);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);
