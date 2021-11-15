import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { EventBridgeEvent } from 'aws-lambda';
import { GetConnectionsForGameDAO } from './dao';

// type eventTypes = 'player-joined' | 'player-left';

interface PlayerJoinedEvent {
  gameId: string;
  newPlayer: string;
  allPlayers: Array<string>;
}

export default function handlerFactory(
  dao: GetConnectionsForGameDAO,
  apiGwClient: ApiGatewayManagementApiClient
) {
  return async function handler(
    event: EventBridgeEvent<'player-joined', PlayerJoinedEvent>
  ) {
    try {
      const connections = await dao(event.detail.gameId);
      const results = await Promise.all(
        connections.map((c) =>
          apiGwClient.send(
            new PostToConnectionCommand({
              ConnectionId: c,
              Data: Buffer.from(
                JSON.stringify({
                  type: event['detail-type'],
                  ...event.detail,
                  gameId: undefined,
                })
              ),
            })
          )
        )
      );
      console.log(JSON.stringify(results));
    } catch (e) {
      console.error(JSON.stringify(e));
      throw e;
    }
  };
}
