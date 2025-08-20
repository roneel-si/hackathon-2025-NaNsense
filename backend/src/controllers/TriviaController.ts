import { FastifyRequest, FastifyReply } from 'fastify'
import { TriviaService } from '../services/TriviaService'
import { searchTable } from '../lib/vectordb'
import { ContextParser } from '../lib/contextParser'

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
        // Check the env file for rag= true or false
        const rag = process.env.RAG === 'true';
        let triviaData = {};
        if (true || rag) {
            try {
              // Clean and validate the query first
              const cleanedQuery = await triviaService.cleanAndValidateQuery(prompt.trim());
              
              // Search LanceDB for relevant data based on the cleaned prompt
              console.log('Searching LanceDB for relevant data based on the cleaned prompt',cleanedQuery);
              const searchResults = await searchTable(cleanedQuery, 5);
              console.log("🔍 Search results:", searchResults);
              if (searchResults && searchResults.length > 0) {
                console.log(`Found ${searchResults.length} relevant results in database`);
                
                // Create an enhanced prompt with context from the database using type-specific parsers
                const contextData = ContextParser.createContext(searchResults);
                const enhancedPrompt = `
                  Based on the following sports information:
                  ${contextData}
                  
                  Generate sports trivia questions about: ${prompt.trim()}
                `;
                console.log("🔍 Enhanced prompt:", enhancedPrompt);
                
                // Generate trivia with the enhanced context using better LLM
                triviaData = await triviaService.generateEnhancedSportsTrivia(contextData, prompt.trim());
                
              } else {
                console.log('No relevant data found in database, returning insufficient data response',prompt);
                triviaData = await triviaService.generateSportsTrivia(prompt.trim());
                console.log("🔍 Trivia data:", triviaData);
                // reply.code(400).send({
                //   success: false,
                //   error: 'Insufficient data available for the requested topic. Please try a different sports topic or team.',
                //   message: 'No relevant information found in our sports database for this query.'
                // });
                // return;
              }
            } catch (error) {
              console.error('Error accessing vector database:', error);
              // Fallback to standard trivia generation
              triviaData = await triviaService.generateSportsTrivia(prompt.trim());
            }
        } else {
           triviaData = await triviaService.generateSportsTrivia(prompt.trim());
        }

        // const triviaData = await triviaService.generateSportsTrivia(prompt.trim());
        
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
