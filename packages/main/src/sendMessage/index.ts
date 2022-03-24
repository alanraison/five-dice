import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { z } from 'zod';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation error: WSAPI_URL not set');
}

const client = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

const event = z.object({
  connectionId: z.string(),
  message: z.any(),
});
type SendMessageEvent = z.infer<typeof event>;

export async function handler(event: SendMessageEvent) {
  return client.send(
    new PostToConnectionCommand({
      ConnectionId: event.connectionId,
      Data: Buffer.from(JSON.stringify(event.message)),
    })
  );
}
