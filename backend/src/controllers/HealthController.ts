import { FastifyRequest, FastifyReply } from 'fastify'

export interface HealthController {
  getHealth(request: FastifyRequest, reply: FastifyReply): Promise<void>
  getReadiness(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

export function createHealthController(): HealthController {
  return {
    async getHealth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }

      reply.code(200).send(health)
    },

    async getReadiness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      // In a real application, you might check database connections, external services, etc.
      const readiness = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          redis: 'ok'
        }
      }

      reply.code(200).send(readiness)
    }
  }
}
