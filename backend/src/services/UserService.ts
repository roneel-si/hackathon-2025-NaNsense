import { UserRepository, User } from '../repositories/UserRepository'

export interface CreateUserRequest {
  email: string
  name: string
}

export interface UpdateUserRequest {
  email?: string
  name?: string
}

export interface UserService {
  getAllUsers(): Promise<User[]>
  getUserById(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  createUser(userData: CreateUserRequest): Promise<User>
  updateUser(id: string, userData: UpdateUserRequest): Promise<User | null>
  deleteUser(id: string): Promise<boolean>
}

interface Dependencies {
  userRepository: UserRepository
}

export function createUserService({ userRepository }: Dependencies): UserService {
  return {
    async getAllUsers(): Promise<User[]> {
      return await userRepository.findAll()
    },

    async getUserById(id: string): Promise<User | null> {
      if (!id) {
        throw new Error('User ID is required')
      }
      
      return await userRepository.findById(id)
    },

    async getUserByEmail(email: string): Promise<User | null> {
      if (!email) {
        throw new Error('Email is required')
      }
      
      return await userRepository.findByEmail(email)
    },

    async createUser(userData: CreateUserRequest): Promise<User> {
      if (!userData.email || !userData.name) {
        throw new Error('Email and name are required')
      }

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      return await userRepository.create(userData)
    },

    async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
      if (!id) {
        throw new Error('User ID is required')
      }

      const existingUser = await userRepository.findById(id)
      if (!existingUser) {
        throw new Error('User not found')
      }

      // If email is being updated, check for conflicts
      if (userData.email && userData.email !== existingUser.email) {
        const emailConflict = await userRepository.findByEmail(userData.email)
        if (emailConflict) {
          throw new Error('Email already in use by another user')
        }
      }

      return await userRepository.update(id, userData)
    },

    async deleteUser(id: string): Promise<boolean> {
      if (!id) {
        throw new Error('User ID is required')
      }

      const existingUser = await userRepository.findById(id)
      if (!existingUser) {
        throw new Error('User not found')
      }

      return await userRepository.delete(id)
    }
  }
}
