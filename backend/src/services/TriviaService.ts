import { GoogleGenerativeAI } from '@google/generative-ai';

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
}

interface Dependencies {
  // Add any dependencies here if needed
}

export function createTriviaService(dependencies: Dependencies): TriviaService {
  // Initialize Gemini AI with API key
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBs2mo8LPzi_cCQVYLSlx4VHGzxzvPXwzM';
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  return {
    async generateSportsTrivia(prompt: string): Promise<TriviaResponse> {
      try {
        const systemPrompt = `You are a SPORTS TRIVIA EXPERT ONLY. Generate 5 SPORTS trivia questions based on the user's prompt. 
        
        CRITICAL RULES:
        - ONLY generate questions about SPORTS, ATHLETES, SPORTS TEAMS, SPORTS EVENTS, SPORTS RECORDS
        - NEVER generate questions about actors, movies, music, politics, business, or any non-sports topics
        - If the user prompt is not sports-related, convert it to sports questions about the most relevant sport
        - IMPORTANT: If the prompt contains a nickname or reference to an athlete, focus questions on that specific athlete
        - IMPORTANT: If the prompt contains a specific date, event, or episode, focus questions on that specific occurrence
        - Focus on: Cricket, Football, Tennis, Basketball, Formula 1, Olympics, World Cups, WWE.
        - DO NOT generate questions about non-sports topics.
        - CRITICAL: Generate ONLY FACTUAL questions with verifiable answers
        - NEVER generate subjective questions, opinion-based questions, or questions about personal preferences
        - Cross check answers with multiple sources. If the answer or question is non factual then replace the question with a new one.
        
        Return the response in this exact JSON format:
        {
          "data": [
            {
              "Question": "question text here",
              "Options": ["option1", "option2", "option3", "option4"],
              "multipleChoice": false,
              "Answer": ["correct_answer"]
            }
          ]
        }
        
        Technical Rules:
        - Generate exactly 5 questions
        - Each question should have 4 options
        - CRITICAL: ALL questions must have exactly ONE correct answer (no multiple choice)
        - CRITICAL: Every Answer array must contain exactly ONE answer string
        - Make sure the questions are engaging and varied
        - Ensure all options are plausible but only ONE correct answer is marked as true
        - Use single quotes (') instead of double quotes (") in question text to avoid escaping issues
        - Return ONLY the JSON, no additional text or explanations
        
        User prompt: ${prompt}`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        
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
    }
  };
}
