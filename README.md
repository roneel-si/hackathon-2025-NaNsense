# Backend Service

A TypeScript Node.js backend service with a clean architecture pattern.

## Project Structure

```
backend/
├── src/
│   ├── config/             # Application configuration
│   │   └── container.ts    # Dependency injection container
│   ├── controllers/        # Request handlers
│   │   ├── HealthController.ts
│   │   └── UserController.ts
│   ├── repositories/       # Data access layer
│   │   └── UserRepository.ts
│   ├── routes/             # API route definitions
│   │   ├── health/         # Health check endpoints
│   │   ├── readiness/      # Readiness check endpoints
│   │   ├── users/          # User-related endpoints
│   │   └── index.ts        # Route aggregation
│   ├── services/           # Business logic layer
│   │   ├── ExampleService.ts
│   │   └── UserService.ts
│   ├── shared/             # Shared utilities and helpers
│   │   ├── app/
│   │   │   └── request-context.ts
│   │   └── utils/
│   │       ├── error-handler.ts
│   │       ├── logger-config.ts
│   │       └── logger.ts
│   ├── types/              # TypeScript type definitions
│   │   └── container.ts
│   └── index.ts            # Application entry point
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Architecture

This backend follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Repositories**: Handle data access and persistence
- **Routes**: Define API endpoints and connect them to controllers
- **Config**: Application configuration and dependency injection
- **Shared**: Utilities and helpers shared across the application

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `/health` - Health check endpoint
- `/readiness` - Readiness check endpoint
- `/users` - User management endpoints

## Dependencies

The project uses:
- TypeScript for type-safe code
- Express.js for the web server
- Dependency injection for better testability
- Structured logging

## Development

This project follows standard TypeScript best practices with a focus on:
- Clean architecture principles
- Dependency injection
- Type safety
- Testability
