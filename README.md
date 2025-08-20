# Sports Trivia API

A Node.js API built with Fastify that provides sports trivia questions with advanced vector search capabilities powered by LanceDB and OpenAI embeddings.

## Features

- 🏏 **Sports Trivia API** - Generate cricket-focused trivia questions
- 🔍 **Vector Search** - Semantic search through sports data using embeddings
- 🤖 **LanceDB Integration** - High-performance vector database with automatic embeddings
- 📊 **Smart Data Ingestion** - Automated processing of multiple data types
- 🚀 **RESTful API** - Built with Fastify for high performance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- OpenAI API Key (optional, for vector embeddings)

### Installation

1. Clone the repository
2. Navigate to the project directory:

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables (optional for basic functionality):

```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-ada-002
LLM_API_KEY=your_openrouter_api_key_here
LLM_MODEL=gpt-4o-mini
```

### Running the Server

#### Development Mode

To start the server in development mode with hot reloading:

```bash
npm run dev
```

The server will start on http://127.0.0.1:3001

#### Production Mode

To build and run the server in production mode:

```bash
npm run build
npm start
```

## Vector Data Ingestion

### Initial Data Setup

Before using the trivia API, ingest your sports data into the vector database:

```bash
npm run ingest
```

This will process and store data from:
- Team profiles (IPL teams)
- Player biographies and statistics  
- Match information and commentary
- Team statistics

### VectorIngestionService

The `VectorIngestionService` handles intelligent data ingestion with the following features:

- ✅ **Smart Merge**: Only adds new records, prevents duplicates
- ✅ **Multiple Data Types**: Team profiles, player bios, commentary, match info, stats
- ✅ **Automatic Rendering**: Converts raw data into searchable text
- ✅ **LanceDB Integration**: Automatic embedding generation with OpenAI
- ✅ **Error Handling**: Graceful error handling with detailed results

#### Usage in Code

```typescript
import { VectorIngestionService } from "./src/services/VectorIngestionService.js";

// Basic usage
const service = new VectorIngestionService();
const result = await service.ingestData();

// With configuration
const service = new VectorIngestionService({
  dataDir: "./custom/data/path",
  verbose: true
});

// Get table statistics
const stats = await service.getTableStats();
console.log(`Total records: ${stats.recordCount}`);
```

#### Data Structure

The system processes the following data types:

| Type | Directory | Description |
|------|-----------|-------------|
| `team_profile` | `team_profile/` | IPL team information, ownership, home grounds |
| `player_bio` | `player_bios/` | Player biographies and career highlights |
| `player_stats` | `player_stats/` | Player statistics and performance data |
| `commentary` | `commentary/` | Ball-by-ball match commentary |
| `match_info` | `match_info/` | Match details, venues, results |
| `team_stats` | `team_stats/` | Team performance statistics |

## API Endpoints

### Sports Trivia

#### Fetch Sports Trivia

Retrieves AI-generated sports trivia questions using vector search to find relevant context.

- **URL**: `/fetch-sports-trivia`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**: Empty object `{}`

##### Example Request

```bash
curl -X POST http://127.0.0.1:3001/fetch-sports-trivia \
  -H "Content-Type: application/json" \
  -d '{}'
```

##### Example Response

```json
{
  "data": [
    {
      "Question": "Who was the last captain to win all cricket tournaments?",
      "Options": [
        "MS Dhoni",
        "Virat Kohli", 
        "Rohit Sharma",
        "AB de Villiers"
      ],
      "multipleChoice": false,
      "Answer": ["MS Dhoni"]
    },
    {
      "Question": "Which IPL captains have won the tournament?",
      "Options": [
        "MS Dhoni",
        "Virat Kohli",
        "Rohit Sharma", 
        "AB de Villiers"
      ],
      "multipleChoice": true,
      "Answer": ["MS Dhoni", "Rohit Sharma"]
    }
  ]
}
```

### Vector Search

The API leverages vector search to:
- Find relevant context for trivia generation
- Ensure accurate and factual questions
- Draw from comprehensive sports database
- Support semantic similarity matching

### Other Available Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /readiness` - Readiness check
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Data Management

### Updating Data

To add new data or update existing records:

1. Add JSON files to appropriate directories in `src/data/chunks/`
2. Run the ingestion script:

```bash
npm run ingest
```

The system will automatically:
- Detect new records
- Skip existing duplicates
- Generate embeddings for new content
- Update the vector database

### Data Format

Each data type follows a specific JSON structure. Example for player bio:

```json
{
  "id": "pbio_player_name",
  "type": "player_bio",
  "player": "Player Name",
  "full_name": "Full Player Name",
  "dob": "1990-01-01",
  "batting_style": "Right-hand bat",
  "bowling_style": "Right-arm fast",
  "role": "Batsman",
  "teams": ["Team1", "Team2"],
  "highlights": [
    "Achievement 1",
    "Achievement 2"
  ],
  "source_url": "https://example.com"
}
```

## Architecture

### Vector Database (LanceDB)

- **Storage**: High-performance vector database
- **Embeddings**: Automatic generation using OpenAI API
- **Search**: Semantic similarity search capabilities
- **Scalability**: Handles large datasets efficiently

### Embedding Strategy

1. **With OpenAI API Key**:
   - Automatic embedding generation
   - Semantic search capabilities
   - High accuracy results

2. **Without API Key**:
   - Basic text storage
   - Limited to exact text matching
   - Fallback functionality

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic (including VectorIngestionService)
│   ├── repositories/    # Data access
│   ├── routes/         # API routes
│   ├── config/         # Configuration files
│   ├── shared/         # Shared utilities
│   ├── types/          # TypeScript type definitions
│   ├── lib/            # Core libraries (vectordb, openai)
│   ├── ingest/         # Data ingestion utilities
│   └── data/           # JSON data files
├── vectordb/           # LanceDB database files
└── package.json
```

## Performance

- **Fast Ingestion**: Smart duplicate detection prevents reprocessing
- **Efficient Search**: Vector similarity search for relevant context
- **Scalable Storage**: LanceDB handles large datasets efficiently  
- **Memory Optimized**: Streaming processing for large files

## Troubleshooting

### Common Issues

1. **No records found**: Ensure JSON files exist in `src/data/chunks/` subdirectories
2. **Embedding errors**: Check `OPENAI_API_KEY` environment variable
3. **Schema conflicts**: Delete `vectordb/` directory and re-run ingestion
4. **Performance issues**: Consider upgrading to paid OpenAI plan for higher rate limits

### Debug Mode

Run ingestion with verbose logging:

```typescript
const service = new VectorIngestionService({ verbose: true });
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request