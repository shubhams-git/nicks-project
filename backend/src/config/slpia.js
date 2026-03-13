export const focusAreas = [
  {
    label: 'Preventing Forecourt Fires',
    value: 'preventing_forecourt_fires',
  },
  {
    label: 'Thinking of the Forecourt as a road',
    value: 'thinking_of_the_forecourt_as_a_road',
  },
  {
    label: 'Leading Contractor Management',
    value: 'leading_contractor_management',
  },
  {
    label: 'Managing Security',
    value: 'managing_security',
  },
  {
    label: 'Responding in an emergency',
    value: 'responding_in_an_emergency',
  },
  {
    label: 'Looking after my wellbeing',
    value: 'looking_after_my_wellbeing',
  },
  {
    label: 'Maintaining a strong Food Safety Culture',
    value: 'maintaining_a_strong_food_safety_culture',
  },
  {
    label: 'Others',
    value: 'others',
  },
]

export const safetyLeadershipPrinciples = [
  'Genuinely care about each other',
  'Will not compromise our focus on safety',
  'Encourage and recognize speak up',
  'Understand how work actually happens',
  'Learn why mistakes occur and respond supportively',
]

export const slpiaQuestions = {
  intent:
    'Intent - why is this your area of focus? For Other selected above, document the focus area.',
  learning: 'Learning - what did you learn, assuming the worker is the expert?',
  reflection:
    'Reflection - how does that reflect on me as a leader or broader business, and what actions will I take away?',
  safetyLeadershipPrinciples:
    'During the interaction, what were the main Safety Leadership Principles you demonstrated?',
}

export const protectedTerms = [
  'Wild Bean Cafe',
  'Comms Board',
  'Check-it alerts',
  'Auror',
  'ESO',
  'Control of Work (CoP)',
]

export const getFocusAreaLabel = (focusArea, customFocusArea = '') => {
  if (focusArea === 'others' && customFocusArea.trim()) {
    return customFocusArea.trim()
  }

  return focusAreas.find((item) => item.value === focusArea)?.label || 'Others'
}
