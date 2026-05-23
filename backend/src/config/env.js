import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const envPath = path.resolve(currentDir, '../../.env')

dotenv.config({
  path: envPath,
  override: true,
})

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite',
}

env.geminiModels = Array.from(
  new Set([env.geminiModel, env.geminiFallbackModel].filter(Boolean)),
)
