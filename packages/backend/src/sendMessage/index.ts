import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation error: WSAPI_URL not set');
}

const client = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

type SendMessageEvent = {
  connectionId: string;
  message: unknown;
}

export async function handler(event: SendMessageEvent) {
  return client.send(
    new PostToConnectionCommand({
      ConnectionId: event.connectionId,
      Data: Buffer.from(JSON.stringify(event.message)),
    })
  );
}
