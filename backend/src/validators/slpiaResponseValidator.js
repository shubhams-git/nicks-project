import { z } from 'zod'

import { safetyLeadershipPrinciples } from '../config/slpia.js'

export const slpiaResponseSchema = z
  .object({
    intent: z.array(z.string().trim().min(1)).min(1).max(5),
    learning: z.array(z.string().trim().min(1)).min(1).max(5),
    reflection: z.array(z.string().trim().min(1)).min(1).max(5),
    safetyLeadershipPrinciples: z
      .array(z.enum(safetyLeadershipPrinciples))
      .min(1)
      .max(safetyLeadershipPrinciples.length),
  })
  .strict()

export const slpiaResponseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intent: {
      type: 'array',
      description:
        'Bullet points that answer why this is the manager focus area. Mention the custom focus area if Other was selected.',
      items: {
        type: 'string',
        description: 'A concise bullet point written like a fuel station manager.',
      },
      minItems: 1,
      maxItems: 5,
    },
    learning: {
      type: 'array',
      description:
        'Bullet points describing what the manager learned from the conversation, treating the worker as the expert.',
      items: {
        type: 'string',
        description: 'A concise bullet point written like a fuel station manager.',
      },
      minItems: 1,
      maxItems: 5,
    },
    reflection: {
      type: 'array',
      description:
        'Bullet points describing leadership reflection and the actions the manager will take away.',
      items: {
        type: 'string',
        description: 'A concise bullet point written like a fuel station manager.',
      },
      minItems: 1,
      maxItems: 5,
    },
    safetyLeadershipPrinciples: {
      type: 'array',
      description:
        'One or more Safety Leadership Principles demonstrated during the interaction. Use only the allowed values.',
      items: {
        type: 'string',
        enum: safetyLeadershipPrinciples,
      },
      minItems: 1,
      maxItems: safetyLeadershipPrinciples.length,
    },
  },
  required: ['intent', 'learning', 'reflection', 'safetyLeadershipPrinciples'],
}
