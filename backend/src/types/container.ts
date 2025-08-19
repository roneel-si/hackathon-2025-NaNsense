import { AwilixContainer } from 'awilix'
import { UserService } from '../services/UserService'
import { UserRepository } from '../repositories/UserRepository'
import { HealthController } from '../controllers/HealthController'
import { UserController } from '../controllers/UserController'
import { TriviaController } from '../controllers/TriviaController'
import { TriviaService } from '../services/TriviaService'

export interface Dependencies {
  // Services
  userService: UserService
  triviaService: TriviaService
  
  // Repositories
  userRepository: UserRepository
  
  // Controllers
  healthController: HealthController
  userController: UserController
  triviaController: TriviaController
}

// TypeScript declarations for @fastify/awilix
declare module 'fastify' {
  interface FastifyInstance {
    diContainer: AwilixContainer<Dependencies>
  }
}
