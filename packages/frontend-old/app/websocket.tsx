import { createContext, PropsWithChildren, useContext, useRef } from 'react';

export function useEventListener(
  events: Array<string>,
  eventHandler: (event: any) => void
) {}

interface WebSocketProps {
  gameId: string;
  name: string;
  character: string;
  wsUrl: string;
}

interface WebSocketHook {
  sendMessage: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView
  ) => void;
  addMessageListener: (
    handler: (ev: MessageEvent<any>) => any,
    options?: boolean | EventListenerOptions
  ) => void;
  close: () => void;
}

const WebSocketContext = createContext<WebSocketHook>({
  sendMessage: () => {},
  addMessageListener: () => {},
  close: () => {},
});

export function WebSocketProvider({
  wsUrl,
  gameId,
  name,
  character,
  children,
}: PropsWithChildren<WebSocketProps>) {
  const url = new URL(wsUrl);
  url.searchParams.set('gameId', gameId);
  url.searchParams.set('name', name);
  url.searchParams.set('character', character);
  // const [webSocket, setWebSocket] = useState<WebSocket>();
  const webSocket = useRef<WebSocket>(new WebSocket(url));

  webSocket.current.addEventListener('error', (ev: Event) => {
    console.error(ev);
  });
  webSocket.current.addEventListener('close', (ev: CloseEvent) => {
    console.info('Closing websocket', ev);
  });
  webSocket.current.addEventListener('open', () => {
    console.info('WebSocket open');
  });
  return (
    <WebSocketContext.Provider
      value={{
        sendMessage: webSocket.current.send,
        addMessageListener: (handler, options) =>
          webSocket.current.addEventListener('message', handler, options),
        close: () => {
          webSocket.current.close();
        },
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
