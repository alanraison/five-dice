import { END, eventChannel, EventChannel } from 'redux-saga';
import {
  call,
  CallEffect,
  ChannelTakeEffect,
  ForkEffect,
  put,
  PutEffect,
  take,
  TakeEffect,
  takeEvery,
} from 'redux-saga/effects';
import { BID, CHALLENGE, EXIT, OPEN, OpenCommand, START } from './commands';
// import { parseToAction } from '../events';

function createWebsocket(
  wsUrl: string,
  gameId: string,
  name: string,
  character: string
): WebSocket {
  const url = new URL(wsUrl);
  url.searchParams.set('gameId', gameId);
  url.searchParams.set('name', name);
  url.searchParams.set('character', character);
  return new WebSocket(url);
}

function wsChannel(ws: WebSocket): EventChannel<any> | Error {
  return eventChannel((emit) => {
    const messageListener = (ev: MessageEvent<string>) => {
      console.log(ev.data);
      emit(JSON.parse(ev.data));
    };
    ws.addEventListener('message', messageListener);
    const errorHandler = (ev: Event) => {
      console.error(ev);
      emit(ev);
    };
    ws.addEventListener('error', errorHandler);
    ws.addEventListener('close', () => {
      console.log('close handler');
      emit(END);
    });
    return () => {
      console.log('closing');
      ws.close();
    };
  });
}

function* processMessage(
  message: any
): Generator<ChannelTakeEffect<any> | PutEffect, void, any> {
  const action = null; //parseToAction(message);
  if (action) {
    yield put(action);
  }
}

function sendMessage<T extends { type: string }>(
  websocket: WebSocket,
  gameId: string,
  { type, ...rest }: T
) {
  websocket.send(
    JSON.stringify({
      action: type,
      gameId,
      ...rest,
    })
  );
}

function* connect(
  action: OpenCommand
): Generator<CallEffect<any> | ForkEffect<any> | TakeEffect, void, any> {
  const ws = (yield call(
    createWebsocket,
    action.wsUrl,
    action.gameId,
    action.name,
    action.character
  )) as WebSocket;
  const chan = (yield call(wsChannel, ws)) as EventChannel<any>;
  yield takeEvery(chan, processMessage);
  yield takeEvery([START, BID, CHALLENGE], sendMessage, ws, action.gameId);
  yield take(EXIT);
  chan.close();
}

export function* rootSaga(): Generator<
  TakeEffect | CallEffect<any>,
  void,
  any
> {
  while (true) {
    const open = yield take(OPEN);
    yield call(connect, open);
  }
}
