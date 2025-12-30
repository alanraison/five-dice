import { Outlet, useLoaderData } from "@remix-run/react";
import { WebSocketProvider } from '~/websocket';

export function loader() {
  return {
    wsUrl: process.env.WS_URL,
  };
}

export default function Game() {
  const loaderData = useLoaderData();
  console.log('ran gameId/index loader');
  console.log(loaderData);
  return (
    <WebSocketProvider
      wsUrl={loaderData.wsUrl}
      gameId="aaaaa"
      name="alan"
      character="alien1"
    >
      <div id="represents-websocket">
        <Outlet />
      </div>
    </WebSocketProvider>
  );
}
