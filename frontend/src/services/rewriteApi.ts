import { apiClient } from '../lib/api'

export const focusAreaOptions = [
  { label: 'Preventing Forecourt Fires', value: 'preventing_forecourt_fires' },
  {
    label: 'Thinking of the Forecourt as a road',
    value: 'thinking_of_the_forecourt_as_a_road',
  },
  { label: 'Leading Contractor Management', value: 'leading_contractor_management' },
  { label: 'Managing Security', value: 'managing_security' },
  { label: 'Responding in an emergency', value: 'responding_in_an_emergency' },
  { label: 'Looking after my wellbeing', value: 'looking_after_my_wellbeing' },
  {
    label: 'Maintaining a strong Food Safety Culture',
    value: 'maintaining_a_strong_food_safety_culture',
  },
  { label: 'Others', value: 'others' },
] as const

export const principleOptions = [
  'Genuinely care about each other',
  'Will not compromise our focus on safety',
  'Encourage and recognize speak up',
  'Understand how work actually happens',
  'Learn why mistakes occur and respond supportively',
] as const

export type FocusAreaValue = (typeof focusAreaOptions)[number]['value']

export type SlpiaResponse = {
  model: string
  focusAreaLabel: string
  answers: {
    intent: string[]
    learning: string[]
    reflection: string[]
    safetyLeadershipPrinciples: string[]
  }
}

export const requestRewrite = async (payload: {
  focusArea: FocusAreaValue
  customFocusArea?: string
  draft: string
}) => {
  const response = await apiClient.post<{ success: true; data: SlpiaResponse }>(
    '/rewrite',
    payload,
  )

  return response.data.data
}
