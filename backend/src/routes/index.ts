import { FastifyPluginAsync } from 'fastify'

const rootRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /
  fastify.get('/', async (request, reply) => {
    return {
      hello: 'world',
      message: 'Fastify with Functional Awilix DI and Autoload is running!',
      endpoints: {
        health: '/health',
        readiness: '/readiness', 
        users: '/users',
        trivia: '/fetch-sports-trivia'
      }
    }
  })
  
  // POST /fetch-sports-trivia
  fastify.post('/fetch-sports-trivia', async (request, reply) => {
    const { triviaController } = fastify.diContainer.cradle
    return triviaController.getSportsTrivia(request, reply)
  })
}

export default rootRoutes
