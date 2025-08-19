import { FastifyRequest } from 'fastify'
import { Dependencies } from '../../types/container'

export interface RequestContext {
  requestId: string
  userId?: string
  userAgent?: string
  ip: string
  timestamp: Date
}

export interface RequestWithContext extends FastifyRequest {
  context: RequestContext
}

export function createRequestContext(request: FastifyRequest): RequestContext {
  return {
    requestId: request.id,
    userId: (request.headers['x-user-id'] as string) || undefined,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    timestamp: new Date()
  }
}

export function getRequestContext(request: FastifyRequest): RequestContext {
  return (request as RequestWithContext).context
}

export function setRequestContext(request: FastifyRequest, context: RequestContext): void {
  (request as RequestWithContext).context = context
}

// Helper to get dependencies from request context (using @fastify/awilix)
export function getDependencies(request: FastifyRequest): Dependencies {
  // This function is now deprecated since we use fastify.diContainer.cradle directly
  // Keeping for backwards compatibility but should use fastify.diContainer.cradle in routes
  throw new Error('Use fastify.diContainer.cradle directly in routes instead of getDependencies')
}
