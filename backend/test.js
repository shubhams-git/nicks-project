import { GoogleGenAI } from '@google/genai'

import { env } from './src/config/env.js'

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
})

async function run() {
  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: 'Explain how APIs work in one paragraph.',
  })

  console.log(response.text)
}

run()
