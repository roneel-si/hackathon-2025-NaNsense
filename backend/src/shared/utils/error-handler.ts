import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export function createApiError(message: string, statusCode: number = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  return error
}

export function handleApiError(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'
  
  request.log.error(error)
  
  reply.status(statusCode).send({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode: number = 200) {
  reply.status(statusCode).send({
    success: true,
    data
  })
}

export function sendError(reply: FastifyReply, message: string, statusCode: number = 400) {
  reply.status(statusCode).send({
    success: false,
    error: message
  })
}
