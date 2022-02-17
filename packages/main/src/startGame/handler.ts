import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation error: TABLE_NAME not set');
}
if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation error: EVENTBUS_NAME not set');
}

const ddb = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME;

const eventBusClient = new EventBridgeClient({});
const eventBusName = process.env.EVENTBUS_NAME;

interface WebsocketActionEvent {
  requestContext: {
    connectionId: string;
  };
}

export async function handler(event: WebsocketActionEvent) {
  const connId = event.requestContext.connectionId;
  const gameIdResponse = await ddb.send(
    new GetItemCommand({
      TableName: tableName,
      Key: { PK: { S: `CONN#${connId}` } },
      ProjectionExpression: 'GID,Player',
    })
  );
  const gameId = gameIdResponse.Item?.GID?.S;
  const player = gameIdResponse.Item?.Player?.S;
  if (!gameId) {
    throw new Error(`Game not found from connection id ${connId}`);
  }
  await ddb.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: { PK: { S: `GAME#${gameId}` } },
      UpdateExpression: 'SET #status = :inprogress',
      ConditionExpression:
        'attribute_exists(#pk) AND #status = :pending AND size(#players) BETWEEN :min AND :max',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#status': 'Status',
        '#players': 'Players',
      },
      ExpressionAttributeValues: {
        ':inprogress': { S: 'InProgress' },
        ':pending': { S: 'Pending' },
        ':min': { N: '2' },
        ':max': { N: '6' },
      },
    })
  );

  eventBusClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          DetailType: 'game-started',
          Detail: JSON.stringify({
            gameId,
            startedBy: player,
          }),
          Resources: [gameId],
          Source: 'five-dice-wsapi',
        },
      ],
    })
  );
  return 'ok';
}
