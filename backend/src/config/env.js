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

const defaultGeminiModel = 'gemini-3.5-flash'
const defaultGeminiFallbackModel = 'gemini-3.1-flash-lite'
const allowCustomGeminiModels = process.env.ALLOW_CUSTOM_GEMINI_MODELS === 'true'

const resolveGeminiModel = (envName, expectedModel) => {
  const configuredModel = process.env[envName]?.trim()

  if (!configuredModel || configuredModel === expectedModel) {
    return expectedModel
  }

  if (allowCustomGeminiModels) {
    return configuredModel
  }

  console.warn(
    `[config] Ignoring ${envName}=${configuredModel}; using ${expectedModel}. Set ALLOW_CUSTOM_GEMINI_MODELS=true only when intentionally testing another Gemini model.`,
  )

  return expectedModel
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: resolveGeminiModel('GEMINI_MODEL', defaultGeminiModel),
  geminiFallbackModel: resolveGeminiModel(
    'GEMINI_FALLBACK_MODEL',
    defaultGeminiFallbackModel,
  ),
}

env.geminiModels = Array.from(
  new Set([env.geminiModel, env.geminiFallbackModel].filter(Boolean)),
)
