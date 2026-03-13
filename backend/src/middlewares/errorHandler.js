import { logger } from '../config/logger.js'

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  if (statusCode >= 500) {
    logger.error(message, error)
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  })
}
