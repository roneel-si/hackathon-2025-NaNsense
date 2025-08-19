import { FastifyRequest, FastifyReply } from 'fastify'
import { TriviaService } from '../services/TriviaService'

export interface TriviaController {
  generateSportsTrivia(request: FastifyRequest, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  triviaService: TriviaService
}

export function createTriviaController({ triviaService }: Dependencies): TriviaController {
  return {
    async generateSportsTrivia(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const body = request.body as any;
        const prompt = body?.prompt;
        
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
          reply.code(400).send({
            success: false,
            error: 'Prompt is required and must be a non-empty string'
          });
          return;
        }

        const triviaData = await triviaService.generateSportsTrivia(prompt.trim());
        
        reply.code(200).send({
          success: true,
          ...triviaData
        });
      } catch (error) {
        console.error('Controller error:', error);
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    }
  }
}
