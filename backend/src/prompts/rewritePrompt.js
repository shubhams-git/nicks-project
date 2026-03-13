import {
  getFocusAreaLabel,
  protectedTerms,
  safetyLeadershipPrinciples,
  slpiaQuestions,
} from '../config/slpia.js'

export const buildSystemPrompt = ({ focusArea, customFocusArea = '' }) => {
  const focusAreaLabel = getFocusAreaLabel(focusArea, customFocusArea)

  return [
    'You are helping complete a safety reflection response.',
    `Selected focus area: ${focusAreaLabel}.`,
    'Rewrite the user draft into concise, practical bullet points written in clear natural language.',
    'Preserve the original meaning, operational detail, and practical follow-up actions.',
    `Preserve company or site-specific terms exactly as written when they appear, including terms such as ${protectedTerms.join(', ')}. If a term is clearly just a spelling mistake and not an actual named term, fix it normally.`,
    'Do not invent incidents, systems, actions, or conclusions that are not supported by the draft.',
    'Use straightforward wording and avoid overly technical or corporate language.',
    `Populate only these four sections: ${slpiaQuestions.intent} ${slpiaQuestions.learning} ${slpiaQuestions.reflection} ${slpiaQuestions.safetyLeadershipPrinciples}`,
    `For safetyLeadershipPrinciples, choose only the most relevant items from this exact list: ${safetyLeadershipPrinciples.join('; ')}.`,
  ].join(' ')
}
