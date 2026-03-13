import { GoogleGenAI } from '@google/genai'

import { env } from '../config/env.js'
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

export const rewriteDraft = async ({ draft, focusArea, customFocusArea = '' }) => {
  if (!env.geminiApiKey) {
    throw new ApiError(503, 'GEMINI_API_KEY is not configured yet.')
  }

  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: draft,
      config: {
        systemInstruction: buildSystemPrompt({ focusArea, customFocusArea }),
        responseMimeType: 'application/json',
        responseJsonSchema: slpiaResponseJsonSchema,
      },
    })

    const rawContent = response.text

    if (!rawContent) {
      throw new ApiError(502, 'Gemini returned an empty response.')
    }

    const parsedResponse = slpiaResponseSchema.safeParse(parseStructuredContent(rawContent))

    if (!parsedResponse.success) {
      throw new ApiError(502, 'Gemini returned an invalid SLPIA response shape.')
    }

    return {
      model: env.geminiModel,
      focusAreaLabel: getFocusAreaLabel(focusArea, customFocusArea),
      answers: parsedResponse.data,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(502, error.message || 'Gemini request failed.')
  }
}
