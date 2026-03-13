import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { env } from './config/env.js'
import { requestLogger } from './middlewares/requestLogger.js'
import { notFoundHandler } from './middlewares/notFoundHandler.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { apiRouter } from './routes/index.js'

const app = express()

app.use(
  cors({
    origin: env.frontendUrl,
  }),
)
app.use(helmet())
app.use(requestLogger)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Rewrite backend is running.',
  })
})

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
