import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const loggerConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
}

export const logger = pino(loggerConfig)
