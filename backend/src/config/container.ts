import { asFunction } from 'awilix'

// Import factory functions
import { createUserService } from '../services/UserService'
import { createUserRepository } from '../repositories/UserRepository'
import { createHealthController } from '../controllers/HealthController'
import { createUserController } from '../controllers/UserController'
import { createTriviaService } from '../services/TriviaService'
import { createTriviaController } from '../controllers/TriviaController'

export const containerConfig = {
  // Manually register dependencies
  userRepository: asFunction(createUserRepository).singleton(),
  userService: asFunction(createUserService).singleton(),
  healthController: asFunction(createHealthController).singleton(),
  userController: asFunction(createUserController).singleton(),
  triviaService: asFunction(createTriviaService).singleton(),
  triviaController: asFunction(createTriviaController).singleton(),
}

// Alternative: Auto-discovery configuration (commented out for now)
// export const autoDiscoveryConfig = {
//   modules: [
//     ['repositories/*.ts', { register: asFunction, lifetime: 'SINGLETON' }],
//     ['services/*.ts', { register: asFunction, lifetime: 'SINGLETON' }],
//     ['controllers/*.ts', { register: asFunction, lifetime: 'SINGLETON' }]
//   ],
//   resolverOptions: {
//     injectionMode: 'CLASSIC'
//   }
// }
