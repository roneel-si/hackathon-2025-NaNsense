import { AwilixContainer } from 'awilix'
import { UserService } from '../services/UserService'
import { UserRepository } from '../repositories/UserRepository'
import { HealthController } from '../controllers/HealthController'
import { UserController } from '../controllers/UserController'

export interface Dependencies {
  // Services
  userService: UserService
  
  // Repositories
  userRepository: UserRepository
  
  // Controllers
  healthController: HealthController
  userController: UserController
}

// TypeScript declarations for @fastify/awilix
declare module 'fastify' {
  interface FastifyInstance {
    diContainer: AwilixContainer<Dependencies>
  }
}
