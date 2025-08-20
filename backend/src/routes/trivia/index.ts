import { FastifyPluginAsync } from 'fastify'
import '../../types/container' // Import type declarations

const triviaRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /generate-sports-trivia (will be accessible at /trivia/generate-sports-trivia)
  fastify.post('/generate-sports-trivia', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            minLength: 1,
            description: 'Text prompt to generate 5 factual sports trivia questions'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  Question: { type: 'string' },
                  Options: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  Answer: { 
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['Question', 'Options', 'Answer']
              }
            }
          },
          required: ['success', 'data']
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { triviaController } = fastify.diContainer.cradle
    return triviaController.generateSportsTrivia(request, reply)
  })
}

export default triviaRoutes
