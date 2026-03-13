import app from './src/app.js'
import { env } from './src/config/env.js'
import { logger } from './src/config/logger.js'

const server = app.listen(env.port, () => {
  logger.info(`Backend listening on port ${env.port}`)
})

const shutdown = (signal) => {
  logger.warn(`${signal} received. Closing server.`)

  server.close(() => {
    logger.info('HTTP server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', error)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})
