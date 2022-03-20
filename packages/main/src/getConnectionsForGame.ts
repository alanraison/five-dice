import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import logger from './logger';

export enum Attributes {
  cid = '#cid',
  gid = '#gid',
  player = '#player',
  // character = '#character',
  diceCount = '#diceCount',
}

export default function (ddb: DynamoDBClient, table: string) {
  return async function getConnectionsForGame(
    gameId: string,
    attributes: Array<Attributes>
  ) {
    const expressionAttributes = getAttributes(attributes);
    const result = await ddb.send(
      new QueryCommand({
        TableName: table,
        IndexName: 'GSI1',
        KeyConditionExpression: '#pk = :gameId AND begins_with(#sk, :conn)',
        ExpressionAttributeNames: {
          '#pk': 'GSI1PK',
          '#sk': 'GSI1SK',
          ...expressionAttributes,
        },
        ExpressionAttributeValues: {
          ':gameId': { S: gameId },
          ':conn': { S: 'CONN#' },
        },
        ProjectionExpression: attributes.join(','),
      })
    );
    logger.info(result);
    return result;
  };
}

function getAttributes(attributes: Array<Attributes>) {
  return {
    ...(attributes.includes(Attributes.cid) ? { '#cid': 'CID' } : undefined),
    ...(attributes.includes(Attributes.gid) ? { '#gid': 'GID' } : undefined),
    ...(attributes.includes(Attributes.player)
      ? { '#player': 'Player' }
      : undefined),
    // ...(attributes.includes(Attributes.character)
    //   ? { '#character': 'Character' }
    //   : undefined),
    ...(attributes.includes(Attributes.diceCount)
      ? { '#diceCount': 'DiceCount' }
      : undefined),
  };
}
