import { pino } from 'pino';

const logger = pino({
  enabled: process.env.NODE_ENV !== 'test',
  level: 'debug',
});

export default logger;
