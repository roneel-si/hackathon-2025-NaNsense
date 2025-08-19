import { FastifyPluginAsync } from 'fastify'
import '../../types/container' // Import type declarations

const readinessRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /readiness
  fastify.get('/', async (request, reply) => {
    const { healthController } = fastify.diContainer.cradle
    return healthController.getReadiness(request, reply)
  })
}

export default readinessRoutes
