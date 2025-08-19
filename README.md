# Sports Trivia API

A Node.js API built with Fastify that provides sports trivia questions.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Navigate to the project directory:

```bash
cd backend/backend
```

3. Install dependencies:

```bash
npm install
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

## API Endpoints

### Fetch Sports Trivia

Retrieves a list of sports trivia questions with multiple-choice options.

- **URL**: `/fetch-sports-trivia`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**: Empty object `{}`

#### Example Request

```bash
curl -X POST http://127.0.0.1:3001/fetch-sports-trivia -H "Content-Type: application/json" -d '{}'
```

#### Example Response

```json
{
  "data": [
    {
      "Question": "who was the last captain to win all cricket tournaments?",
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
      "Question": "Mumbai indians won the IPL in 2013, 2015, 2017, 2019, 2020, 2021, 2022, 2023, 2024, 2025",
      "Options": [
        "True",
        "False"
      ],
      "multipleChoice": false,
      "Answer": ["True"]
    },
    {
      "Question": "Captains that have won the IPL",
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

## Other Available Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /readiness` - Readiness check
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Project Structure

- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/repositories/` - Data access
- `src/routes/` - API routes
- `src/config/` - Configuration files
- `src/shared/` - Shared utilities
- `src/types/` - TypeScript type definitions