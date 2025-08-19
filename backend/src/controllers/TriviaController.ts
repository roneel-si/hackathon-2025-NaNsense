import { FastifyRequest, FastifyReply } from 'fastify'
import { TriviaService } from '../services/TriviaService'

export interface TriviaController {
  getSportsTrivia(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  triviaService: TriviaService
}

export function createTriviaController({ triviaService }: Dependencies): TriviaController {
  return {
    async getSportsTrivia(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const triviaData = await triviaService.getSportsTrivia()
        
        reply.code(200).send(triviaData)
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        })
      }
    }
  }
}
