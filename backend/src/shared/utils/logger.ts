import { FastifyRequest } from 'fastify'
import { logger as pinoLogger } from './logger-config'

export interface LogContext {
  requestId?: string
  userId?: string
  method?: string
  url?: string
  [key: string]: any
}

export function createLogger(request?: FastifyRequest) {
  const context: LogContext = request ? {
    requestId: request.id,
    method: request.method,
    url: request.url,
    userId: (request.headers['x-user-id'] as string) || undefined
  } : {}

  return {
    info: (message: string, extra?: any) => {
      pinoLogger.info({ ...context, ...extra }, message)
    },
    
    error: (message: string, error?: Error, extra?: any) => {
      pinoLogger.error({ 
        ...context, 
        ...extra,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }, message)
    },
    
    warn: (message: string, extra?: any) => {
      pinoLogger.warn({ ...context, ...extra }, message)
    },
    
    debug: (message: string, extra?: any) => {
      pinoLogger.debug({ ...context, ...extra }, message)
    }
  }
}

export const logger = createLogger()
