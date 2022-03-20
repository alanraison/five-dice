import logger from '../logger';

export async function handler(event: any) {
  logger.info(event);
}
