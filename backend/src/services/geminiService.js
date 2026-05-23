import { GoogleGenAI } from '@google/genai'

import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { getFocusAreaLabel } from '../config/slpia.js'
import { buildSystemPrompt } from '../prompts/rewritePrompt.js'
import {
  slpiaResponseJsonSchema,
  slpiaResponseSchema,
} from '../validators/slpiaResponseValidator.js'
import { ApiError } from '../utils/ApiError.js'

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey || undefined })

const parseStructuredContent = (content) => {
  if (typeof content === 'string') {
    return JSON.parse(content)
  }

  return content
}

const generateStructuredResponse = async ({ model, draft, focusArea, customFocusArea }) => {
  const response = await ai.models.generateContent({
    model,
    contents: draft,
    config: {
      systemInstruction: buildSystemPrompt({ focusArea, customFocusArea }),
      responseMimeType: 'application/json',
      responseJsonSchema: slpiaResponseJsonSchema,
    },
  })

  const rawContent = response.text

  if (!rawContent) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsedResponse = slpiaResponseSchema.safeParse(parseStructuredContent(rawContent))

  if (!parsedResponse.success) {
    throw new Error('Gemini returned an invalid SLPIA response shape.')
  }

  return parsedResponse.data
}

export const rewriteDraft = async ({ draft, focusArea, customFocusArea = '' }) => {
  if (!env.geminiApiKey) {
    throw new ApiError(503, 'GEMINI_API_KEY is not configured yet.')
  }

  let lastError

  for (const [index, model] of env.geminiModels.entries()) {
    try {
      const answers = await generateStructuredResponse({
        model,
        draft,
        focusArea,
        customFocusArea,
      })

      if (index > 0) {
        logger.warn(`Gemini fallback model succeeded: ${model}`)
      }

      return {
        model,
        focusAreaLabel: getFocusAreaLabel(focusArea, customFocusArea),
        answers,
      }
    } catch (error) {
      lastError = error

      if (index < env.geminiModels.length - 1) {
        logger.warn(
          `Gemini model failed: ${model}. Trying fallback model: ${env.geminiModels[index + 1]}. ${
            error.message || 'Unknown error'
          }`,
        )
      }
    }
  }

  throw new ApiError(
    502,
    lastError?.message || 'Gemini request failed for all configured models.',
  )
}
