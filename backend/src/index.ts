import Fastify, { FastifyInstance } from 'fastify'
import autoload from '@fastify/autoload'
import path from 'path'
import { containerConfig } from './config/container'
import { handleApiError } from './shared/utils/error-handler'
import { loggerConfig } from './shared/utils/logger-config'
import './types/container' // Import type declarations

// Create Fastify instance with Pino logger
const fastify: FastifyInstance = Fastify({
  logger: loggerConfig,
})

const start = async (): Promise<void> => {
  try {
    // Register Awilix plugin for dependency injection
    const { fastifyAwilixPlugin } = require('@fastify/awilix')
    await fastify.register(fastifyAwilixPlugin, {
      disposeOnClose: true,
      disposeOnResponse: false
    })
    
    // Register dependencies
    fastify.diContainer.register(containerConfig)
    
    // Global error handler
    fastify.setErrorHandler(handleApiError)
    
    // Auto-load routes from routes directory
    await fastify.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      options: {}
    })
    
    // Start server
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    fastify.log.info('🚀 Fastify API with @fastify/awilix DI and Autoload running!')
    fastify.log.info('Available endpoints:')
    fastify.log.info('  GET  / - Root endpoint')
    fastify.log.info('  GET  /health - Health check')
    fastify.log.info('  GET  /readiness - Readiness check')
    fastify.log.info('  GET  /users - Get all users')
    fastify.log.info('  GET  /users/:id - Get user by ID')
    fastify.log.info('  POST /users - Create new user')
    fastify.log.info('  PUT  /users/:id - Update user')
    fastify.log.info('  DELETE /users/:id - Delete user')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
