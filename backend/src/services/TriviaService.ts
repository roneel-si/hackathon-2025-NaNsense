export interface TriviaQuestion {
  Question: string;
  Options: string[];
  multipleChoice: boolean;
  Answer: string[];
}

export interface TriviaResponse {
  data: TriviaQuestion[];
}

export interface TriviaService {
  getSportsTrivia(): Promise<any>;
}

interface Dependencies {
  // Add any dependencies here if needed
}

export function createTriviaService(dependencies: Dependencies): TriviaService {
  return {
    async getSportsTrivia(): Promise<any> {
      // Hardcoded response as specified - using the exact format requested
      return {
        "data": [
          {
            Question: "who was the last captain to win all cricket tournaments?",
            Options: [
              "MS Dhoni",
              "Virat Kohli",
              "Rohit Sharma",
              "AB de Villiers"
            ],
            multipleChoice: false,
            Answer: ["MS Dhoni"]
          },
          {
            Question: "Mumbai indians won the IPL in 2013, 2015, 2017, 2019, 2020, 2021, 2022, 2023, 2024, 2025",
            Options: [
              "True",
              "False"
            ],
            multipleChoice: false,
            Answer: ["True"]
          },
          {
            Question: "Captains that have won the IPL",
            Options: [
              "MS Dhoni",
              "Virat Kohli",
              "Rohit Sharma",
              "AB de Villiers"
            ],
            multipleChoice: true,
            Answer: ["MS Dhoni", "Rohit Sharma"]
          }
        ]
      };
    }
  };
}
