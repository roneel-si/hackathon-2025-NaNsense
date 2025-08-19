// Example service to demonstrate how to add new services to the DI container
// This service shows how dependencies can be injected in functional style

import { UserService } from './UserService'

export interface ExampleService {
  getWelcomeMessage(userId?: string): Promise<string>
  getUserStats(): Promise<{ totalUsers: number; message: string }>
}

interface Dependencies {
  userService: UserService
}

export function createExampleService({ userService }: Dependencies): ExampleService {
  return {
    async getWelcomeMessage(userId?: string): Promise<string> {
      if (userId) {
        const user = await userService.getUserById(userId)
        if (user) {
          return `Welcome back, ${user.name}!`
        }
      }
      
      return 'Welcome to our application!'
    },

    async getUserStats(): Promise<{ totalUsers: number; message: string }> {
      const users = await userService.getAllUsers()
      return {
        totalUsers: users.length,
        message: `We have ${users.length} registered users`
      }
    }
  }
}

// To add this service to the DI container, you would:
// 1. Add it to the Dependencies interface in types/container.ts
// 2. Register it in config/container.ts using asFunction(createExampleService).singleton()
// 3. Use it in controllers by accessing it from the container
