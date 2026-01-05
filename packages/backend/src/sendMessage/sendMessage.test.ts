import { mockClient } from 'aws-sdk-client-mock';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { handler } from './index.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('sendMessage handler', () => {
  const mockApiGatewayClient = mockClient(ApiGatewayManagementApiClient);

  beforeEach(() => {
    mockApiGatewayClient.reset();
    vi.resetAllMocks();
  });

  it('should send a message to the specified connection', async () => {
    await handler({
      connectionId: 'conn1',
      message: { foo: 'bar' },
    });
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn1',
        Data: Buffer.from(JSON.stringify({ foo: 'bar' })),
      },
    );
  });
});
