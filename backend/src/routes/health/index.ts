import { FastifyPluginAsync } from 'fastify'
import '../../types/container' // Import type declarations

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /health
  fastify.get('/', async (request, reply) => {
    const { healthController } = fastify.diContainer.cradle
    return healthController.getHealth(request, reply)
  })
}

export default healthRoutes
