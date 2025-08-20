import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export interface TriviaQuestion {
  Question: string;
  Options: string[];
  Answer: string[];
}

export interface TriviaResponse {
  data: TriviaQuestion[];
}

export interface TriviaService {
  generateSportsTrivia(prompt: string): Promise<TriviaResponse>;
  generateEnhancedSportsTrivia(enhancedContext: string, originalPrompt: string): Promise<TriviaResponse>;
  cleanAndValidateQuery(rawQuery: string): Promise<string>;
}

interface Dependencies {
  // Add any dependencies here if needed
}

export function createTriviaService(dependencies: Dependencies): TriviaService {
  // Initialize Gemini AI with API key
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBs2mo8LPzi_cCQVYLSlx4VHGzxzvPXwzM';
  
  // Use Gemini for query cleaning only
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const genAI = new GoogleGenerativeAI(apiKey);
  // Initialize Groq AI for enhanced trivia generation
  console.log('🔍 GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
  console.log('🔍 GROQ_API_KEY length:', process.env.GROQ_API_KEY?.length || 0);
  
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  return {
    async generateSportsTrivia(prompt: string): Promise<TriviaResponse> {
      try {
        const systemPrompt = `You are an ELITE SPORTS TRIVIA GENERATOR specializing in creating challenging, fact-based questions.

        CONTENT FOCUS - CRICKET PRIORITY:
        - PRIMARY FOCUS: Cricket (IPL, Test matches, ODI, T20, World Cups, domestic leagues)
        - SECONDARY: Football, Tennis, Basketball, Formula 1, Olympics
        - Generate questions about: Teams, Players, Records, Statistics, Historical moments, Venues, Tournaments
        - NEVER create questions about: Entertainment, Politics, Business, Movies, Music, Non-sports topics

        QUESTION INTELLIGENCE LEVELS:
        - BEGINNER (20%): Basic facts everyone should know
        - INTERMEDIATE (60%): Detailed knowledge requiring sports following
        - EXPERT (20%): Deep insights, specific statistics, lesser-known facts

        FACTUAL ACCURACY REQUIREMENTS:
        - Use ONLY verifiable, documented sports facts
        - Include specific years, scores, player names, venue details
        - Cross-reference multiple sources mentally before including any fact
        - If uncertain about a fact, replace with a different verified question
        - Prioritize recent events (last 5 years) and classic historical moments

        QUESTION CONSTRUCTION RULES:
        - Create engaging, specific questions that test real sports knowledge
        - Use precise terminology and official names (teams, tournaments, venues)
        - Include context clues that make questions educational
        - Avoid trick questions or overly obscure trivia
        - Make incorrect options plausible but clearly wrong to knowledgeable fans

        TECHNICAL SPECIFICATIONS:
        - Generate exactly 5 questions
        - Each question: 4 options, 1 correct answer only
        - Remove "multipleChoice" field entirely
        - Answer array must contain exactly ONE string
        - Use proper grammar and clear, concise language
        - Avoid special characters that break JSON formatting

        OUTPUT FORMAT (STRICT JSON):
        {
          "data": [
            {
              "Question": "Which team won the IPL 2024 final?",
              "Options": ["Mumbai Indians", "Chennai Super Kings", "Kolkata Knight Riders", "Royal Challengers Bangalore"],
              "Answer": ["Kolkata Knight Riders"]
            }
          ]
        }

        QUALITY CHECKLIST:
        ✓ All questions are sports-related and factually accurate
        ✓ Questions vary in difficulty and cover different aspects
        ✓ Options are realistic and well-distributed
        ✓ JSON format is perfect with no syntax errors
        ✓ Each question teaches something valuable about sports

        Generate 5 cricket focused trivia questions about: ${prompt}`;
        console.log("🔍 System prompt:+++++", systemPrompt);

        // Use Groq Llama 3.1 8B for trivia generation
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPrompt
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 2048,
        });

        const text = completion.choices[0]?.message?.content || '';
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to generate valid JSON response from AI');
        }
        
        const triviaData = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!triviaData.data || !Array.isArray(triviaData.data)) {
          throw new Error('Invalid response structure from AI');
        }
        
        // Ensure we have exactly 5 questions
        if (triviaData.data.length !== 5) {
          throw new Error(`AI did not generate exactly 5 questions. Got ${triviaData.data.length} questions.`);
        }
        
        // Validate that all questions have exactly ONE answer
        for (let i = 0; i < triviaData.data.length; i++) {
          const question = triviaData.data[i];
          
          // Ensure exactly one answer
          if (question.Answer.length !== 1) {
            console.warn(`Question ${i + 1} has ${question.Answer.length} answers. Forcing to single answer.`);
            // Keep only the first answer
            question.Answer = [question.Answer[0]];
          }
          
          // Remove multipleChoice field entirely (not needed for single choice)
          delete question.multipleChoice;
        }
        
        // Clean up unwanted backslashes and formatting issues
        for (let i = 0; i < triviaData.data.length; i++) {
          const question = triviaData.data[i];
          
          // Remove unwanted backslashes before quotes
          question.Question = question.Question.replace(/\\"/g, '"');
          question.Question = question.Question.replace(/\\'/g, "'");
          
          // Clean up options as well
          question.Options = question.Options.map((option: string) => 
            option.replace(/\\"/g, '"').replace(/\\'/g, "'")
          );
          
          // Clean up answers
          question.Answer = question.Answer.map((answer: string) => 
            answer.replace(/\\"/g, '"').replace(/\\'/g, "'")
          );
        }
        
        // Validate that questions are sports-related
        const sportsKeywords = ['cricket', 'football', 'tennis', 'basketball', 'formula', 'olympics', 'world cup', 'championship', 'league', 'match', 'game', 'player', 'team', 'sport', 'athlete', 'coach', 'captain', 'tournament', 'series', 'race', 'goal', 'run', 'wicket', 'ball', 'field', 'court', 'track', 'stadium'];
        
        for (let i = 0; i < triviaData.data.length; i++) {
          const question = triviaData.data[i];
          const questionText = question.Question.toLowerCase();
          const hasSportsKeywords = sportsKeywords.some(keyword => questionText.includes(keyword));
          
          if (!hasSportsKeywords) {
            console.warn(`Question ${i + 1} may not be sports-related: "${question.Question}"`);
          }
        }
        
        return triviaData;
      } catch (error) {
        // Fallback to hardcoded response if AI fails
        return {
          "data": [
            {
              Question: "Who was the last captain to win all cricket tournaments?",
              Options: [
                "MS Dhoni",
                "Virat Kohli",
                "Rohit Sharma",
                "AB de Villiers"
              ],
              Answer: ["MS Dhoni"]
            },
            {
              Question: "Which country won the FIFA World Cup in 2018?",
              Options: [
                "France",
                "Croatia",
                "Belgium",
                "Brazil"
              ],
              Answer: ["France"]
            },
            {
              Question: "How many players are on a basketball team on the court at one time?",
              Options: [
                "5",
                "6",
                "7",
                "8"
              ],
              Answer: ["5"]
            },
            {
              Question: "Which tennis tournament is played on grass courts?",
              Options: [
                "Wimbledon",
                "US Open",
                "French Open",
                "Australian Open"
              ],
              Answer: ["Wimbledon"]
            },
            {
              Question: "In which year was the first Olympic Games held?",
              Options: [
                "1896",
                "1900",
                "1904",
                "1892"
              ],
              Answer: ["1896"]
            }
          ]
        };
      }
    },

    async generateEnhancedSportsTrivia(enhancedContext: string, originalPrompt: string): Promise<TriviaResponse> {
      try {
        // Use Groq Llama 3.1 8B for enhanced reasoning with context
        const enhancedSystemPrompt = `You are an EXPERT SPORTS TRIVIA GENERATOR with access to detailed sports data. 
        
        CONTEXT DATA PROVIDED:
        ${enhancedContext}
        
        CRITICAL INSTRUCTIONS:
        - Questions are based on the sport Cricket only.
        - Use the provided context data to generate HIGHLY SPECIFIC and ACCURATE trivia questions
        - Generate 5 challenging trivia questions about: ${originalPrompt}
        - Questions MUST be based on the factual information provided in the context
        - Make questions detailed and specific using the rich context data provided
        - Include specific dates, names, statistics, and details from the context
        - Ensure all answers are verifiable from the provided context data
        - Question are based on Cricket only.
        
        QUESTION QUALITY REQUIREMENTS:
        - Generate questions that test deep knowledge, not just basic facts
        - Use specific details like exact years, scores, player names, venues from the context
        - Create challenging but fair questions that require understanding of the context
        - Avoid generic questions - make them specific to the provided data
        
        TECHNICAL REQUIREMENTS:
        - Return exactly 5 questions
        - Each question must have exactly 4 options
        - Only ONE correct answer per question
        - Use factual information from the context only
        
        Return the response in this exact JSON format:
        {
          "data": [
            {
              "Question": "specific question based on context data",
              "Options": ["option1", "option2", "option3", "option4"],
              "Answer": ["correct_answer"]
            }
          ]
        }
        
        Generate questions about: ${originalPrompt}`;

        console.log("🔍 Enhanced system prompt:+++++", enhancedSystemPrompt);
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: enhancedSystemPrompt
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 2048,
        });

        const text = completion.choices[0]?.message?.content || '';
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to generate valid JSON response from enhanced AI');
        }
        
        const triviaData = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!triviaData.data || !Array.isArray(triviaData.data)) {
          throw new Error('Invalid response structure from enhanced AI');
        }
        
        // Ensure we have exactly 5 questions
        if (triviaData.data.length !== 5) {
          throw new Error(`Enhanced AI did not generate exactly 5 questions. Got ${triviaData.data.length} questions.`);
        }
        
        // Validate and clean up questions
        for (let i = 0; i < triviaData.data.length; i++) {
          const question = triviaData.data[i];
          
          // Ensure exactly one answer
          if (question.Answer.length !== 1) {
            console.warn(`Enhanced question ${i + 1} has ${question.Answer.length} answers. Forcing to single answer.`);
            question.Answer = [question.Answer[0]];
          }
          
          // Clean up formatting
          question.Question = question.Question.replace(/\\"/g, '"').replace(/\\'/g, "'");
          question.Options = question.Options.map((option: string) => 
            option.replace(/\\"/g, '"').replace(/\\'/g, "'")
          );
          question.Answer = question.Answer.map((answer: string) => 
            answer.replace(/\\"/g, '"').replace(/\\'/g, "'")
          );
        }
        
        return triviaData;
        
      } catch (error) {
        console.error('Enhanced trivia generation failed:', error);
        // Fallback to regular trivia generation
        return this.generateSportsTrivia(originalPrompt);
      }
    },

    async cleanAndValidateQuery(rawQuery: string): Promise<string> {
      try {
        const cleaningPrompt = `You are a CRICKET QUERY EXPERT with comprehensive knowledge of cricket history, players, teams, and terminology.

        Original Query: "${rawQuery}"
        
        INTELLIGENT CLEANING RULES:
        1. ANALYZE each term to determine if it's cricket-related:
           - Famous cricket nicknames (Little Master, Captain Cool, Hitman, etc.) → KEEP
           - Official player names → KEEP  
           - Team names and abbreviations → EXPAND (CSK → Chennai Super Kings)
           - Cricket terminology → KEEP (centuries, wickets, boundaries, etc.)
           - Tournament names → STANDARDIZE (World Cup, IPL, T20, etc.)
           - Non-cricket personal names → REMOVE
        
        2. Use your cricket knowledge to identify:
           - Player nicknames from any era of cricket
           - Team nicknames (Men in Blue, Proteas, etc.)
           - Cricket positions and roles
           - Cricket formats and tournaments
           - Cricket venues and grounds
        
        3. Fix spelling mistakes and standardize formats
        
        4. Remove only terms that are clearly NOT related to cricket
        
        DECISION PROCESS:
        - If unsure whether a term is cricket-related, KEEP it (better safe than sorry)
        - Focus on removing obviously non-cricket entities
        - Preserve cricket context and terminology
        
        EXAMPLES:
        - "little master highest score" → "Little Master highest score" (cricket nickname)
        - "captain cool IPL wins" → "Captain Cool IPL wins" (cricket nickname)  
        - "kolkota knight riders" → "Kolkata Knight Riders" (fix spelling)
        - "highest score by rinston" → "highest score" (remove non-cricket name)
        - "CSK vs MI 2023" → "Chennai Super Kings vs Mumbai Indians 2023"
        - "boom boom afridi sixes" → "Boom Boom Afridi sixes" (cricket nickname)
        
        Return ONLY the cleaned query, nothing else.`;

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: cleaningPrompt
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 2048,
        });
        const cleanedQuery = completion.choices[0]?.message?.content || '';
        
        console.log(`🧹 Query cleaned: "${rawQuery}" → "${cleanedQuery}"`);
        return cleanedQuery;
        
      } catch (error) {
        console.error('Query cleaning failed:', error);
        // Fallback to original query if cleaning fails
        return rawQuery.trim();
      }
    }
  };
}
