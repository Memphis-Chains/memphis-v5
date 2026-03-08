import pino, { type LoggerOptions } from 'pino';

export function createLogger(level: LoggerOptions['level'] = 'info') {
  return pino({
    level,
    base: {
      service: 'memphis-v4',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
