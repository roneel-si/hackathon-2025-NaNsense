import { FastifyPluginAsync } from 'fastify'
import '../../types/container' // Import type declarations

const triviaRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /fetch-sports-trivia
  fastify.post('/fetch-sports-trivia', async (request, reply) => {
    const { triviaController } = fastify.diContainer.cradle
    return triviaController.getSportsTrivia(request, reply)
  })
}

export default triviaRoutes
