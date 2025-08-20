import { FastifyPluginAsync } from 'fastify'
import '../../types/container' // Import type declarations

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users
  fastify.get('/', async (request, reply) => {
    const { userController } = fastify.diContainer.cradle
    return userController.getAllUsers(request, reply)
  })

  // GET /users/:id
  fastify.get('/:id', async (request, reply) => {
    const { userController } = fastify.diContainer.cradle
    return userController.getUserById(request, reply)
  })

  // POST /users
  fastify.post('/', async (request, reply) => {
    const { userController } = fastify.diContainer.cradle
    return userController.createUser(request, reply)
  })

  // PUT /users/:id
  fastify.put('/:id', async (request, reply) => {
    const { userController } = fastify.diContainer.cradle
    return userController.updateUser(request, reply)
  })

  // DELETE /users/:id
  fastify.delete('/:id', async (request, reply) => {
    const { userController } = fastify.diContainer.cradle
    return userController.deleteUser(request, reply)
  })
}

export default userRoutes
