import { z } from 'zod'

import { focusAreas } from '../config/slpia.js'

const focusAreaValues = focusAreas.map((item) => item.value)

export const rewriteSchema = z
  .object({
    focusArea: z.enum(focusAreaValues),
    customFocusArea: z
      .string()
      .trim()
      .max(120, 'Custom focus area is too long.')
      .optional(),
    draft: z
      .string()
      .trim()
      .min(1, 'Draft text is required.')
      .max(12000, 'Draft text is too long.'),
  })
  .superRefine((value, context) => {
    if (value.focusArea === 'others' && !value.customFocusArea?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customFocusArea'],
        message: 'Enter the focus area when Others is selected.',
      })
    }
  })
