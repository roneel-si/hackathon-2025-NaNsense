import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService, CreateUserRequest, UpdateUserRequest } from '../services/UserService'

interface GetUserParams {
  id: string
}

interface CreateUserBody extends CreateUserRequest {}

interface UpdateUserParams {
  id: string
}

interface UpdateUserBody extends UpdateUserRequest {}

export interface UserController {
  getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<void>
  getUserById(request: FastifyRequest<{ Params: GetUserParams }>, reply: FastifyReply): Promise<void>
  createUser(request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply): Promise<void>
  updateUser(request: FastifyRequest<{ Params: UpdateUserParams; Body: UpdateUserBody }>, reply: FastifyReply): Promise<void>
  deleteUser(request: FastifyRequest<{ Params: GetUserParams }>, reply: FastifyReply): Promise<void>
}

interface Dependencies {
  userService: UserService
}

export function createUserController({ userService }: Dependencies): UserController {
  return {
    async getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const users = await userService.getAllUsers()
        reply.code(200).send({
          success: true,
          data: users
        })
      } catch (error) {
        reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        })
      }
    },

    async getUserById(
      request: FastifyRequest<{ Params: GetUserParams }>, 
      reply: FastifyReply
    ): Promise<void> {
      try {
        const { id } = request.params
        const user = await userService.getUserById(id)
        
        if (!user) {
          reply.code(404).send({
            success: false,
            error: 'User not found'
          })
          return
        }

        reply.code(200).send({
          success: true,
          data: user
        })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    },

    async createUser(
      request: FastifyRequest<{ Body: CreateUserBody }>, 
      reply: FastifyReply
    ): Promise<void> {
      try {
        const userData = request.body
        const user = await userService.createUser(userData)
        
        reply.code(201).send({
          success: true,
          data: user
        })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    },

    async updateUser(
      request: FastifyRequest<{ Params: UpdateUserParams; Body: UpdateUserBody }>, 
      reply: FastifyReply
    ): Promise<void> {
      try {
        const { id } = request.params
        const userData = request.body
        const user = await userService.updateUser(id, userData)
        
        if (!user) {
          reply.code(404).send({
            success: false,
            error: 'User not found'
          })
          return
        }

        reply.code(200).send({
          success: true,
          data: user
        })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    },

    async deleteUser(
      request: FastifyRequest<{ Params: GetUserParams }>, 
      reply: FastifyReply
    ): Promise<void> {
      try {
        const { id } = request.params
        const deleted = await userService.deleteUser(id)
        
        if (!deleted) {
          reply.code(404).send({
            success: false,
            error: 'User not found'
          })
          return
        }

        reply.code(200).send({
          success: true,
          message: 'User deleted successfully'
        })
      } catch (error) {
        reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Bad request'
        })
      }
    }
  }
}
