import { Listbox } from '@headlessui/react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import axios from 'axios'

import {
  focusAreaOptions,
  requestRewrite,
  type FocusAreaValue,
  type SlpiaResponse,
} from './services/rewriteApi'

const questionCards = [
  {
    key: 'intent',
    index: '01',
    title: 'Intent',
    prompt: 'Why is this your area of focus?',
  },
  {
    key: 'learning',
    index: '02',
    title: 'Learning',
    prompt: 'What did you learn from the person involved?',
  },
  {
    key: 'reflection',
    index: '03',
    title: 'Reflection',
    prompt: 'What does this mean for you and what will you do differently?',
  },
  {
    key: 'safetyLeadershipPrinciples',
    index: '04',
    title: 'Safety Leadership Principles',
    prompt: 'Which principles were most visible during the interaction?',
  },
] as const

const draftingHints = [
  'Describe what you observed and discussed.',
  'Keep site-specific terms exactly as they are used.',
  'Include the actions you plan to take next.',
]

const defaultDraft =
  'I spoke with the team about keeping the forecourt clear during a busy shift. We discussed how vehicles can move unexpectedly near pumps and the Wildbean Cafe entry. I reminded the team to stay alert around customer movement, keep the Comms Board updated, and raise any Check-it alerts early so we can act before the risk builds up.'
const TOUR_STORAGE_KEY = 'nicks-project-onboarding-tour-v1'
const refreshTourStep = (_element: Element | undefined, _step: unknown, opts: { driver: ReturnType<typeof driver> }) => {
  window.requestAnimationFrame(() => {
    opts.driver.refresh()
  })

  window.setTimeout(() => {
    opts.driver.refresh()
  }, 80)
}

function App() {
  const [focusArea, setFocusArea] = useState<FocusAreaValue>('preventing_forecourt_fires')
  const [customFocusArea, setCustomFocusArea] = useState('')
  const [draft, setDraft] = useState(defaultDraft)
  const [result, setResult] = useState<SlpiaResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompactTour, setIsCompactTour] = useState(false)
  const tourRef = useRef<ReturnType<typeof driver> | null>(null)

  const selectedFocus =
    focusAreaOptions.find((item) => item.value === focusArea) || focusAreaOptions[0]

  const resetCopyMessage = () => {
    window.setTimeout(() => {
      setCopyMessage('')
    }, 1800)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedDraft = draft.trim()
    const trimmedCustomFocus = customFocusArea.trim()

    if (!trimmedDraft) {
      setErrorMessage('Write the draft before sending it.')
      return
    }

    if (focusArea === 'others' && !trimmedCustomFocus) {
      setErrorMessage('Enter the focus area when Others is selected.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setCopyMessage('')

    try {
      const data = await requestRewrite({
        focusArea,
        customFocusArea: trimmedCustomFocus,
        draft: trimmedDraft,
      })

      setResult(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          (error.response?.data as { error?: { message?: string } } | undefined)?.error
            ?.message || 'Unable to generate the response right now.'

        setErrorMessage(apiMessage)
      } else {
        setErrorMessage('Unable to generate the response right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyResponse = async () => {
    if (!result) {
      return
    }

    const copyText = buildCopyText(result)

    try {
      await navigator.clipboard.writeText(copyText)
      setCopyMessage('Copied')
      resetCopyMessage()
    } catch {
      setCopyMessage('Copy failed')
      resetCopyMessage()
    }
  }

  const startTour = (markAsSeen = true) => {
    tourRef.current?.destroy()

    const compactSteps = [
      {
        popover: {
          title: 'Quick tour',
          description: 'Pick the focus area, write the draft, then generate the response.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="focus-area"]',
        popover: {
          title: 'Focus area',
          description: 'Choose the topic that fits this entry.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="draft"]',
        onHighlighted: refreshTourStep,
        popover: {
          title: 'Draft',
          description: 'Write what happened, what was discussed, and the action to take.',
          side: 'top' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="generate"]',
        popover: {
          title: 'Generate',
          description: 'Create the four final sections.',
          side: 'top' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="response"]',
        onHighlighted: refreshTourStep,
        popover: {
          title: 'Review',
          description: 'Check the response here, then copy it when ready.',
          side: 'top' as const,
          align: 'center' as const,
        },
      },
    ]

    const fullSteps = [
      {
        popover: {
          title: 'A quick tour',
          description:
            'This takes a few seconds. You only need three things here: choose the focus area, write the draft, and generate the response.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="focus-area"]',
        popover: {
          title: 'Choose the focus area',
          description:
            'Start here. Pick the focus area that best matches the situation you are writing about.',
          side: 'bottom' as const,
          align: 'start' as const,
        },
      },
      {
        element: '[data-tour="draft"]',
        onHighlighted: refreshTourStep,
        popover: {
          title: 'Write the draft naturally',
          description:
            'Use rough notes if needed. Include what happened, what was discussed, and what actions should come out of it.',
          side: 'top' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="generate"]',
        popover: {
          title: 'Generate the response',
          description:
            'When the draft is ready, generate the final response. The result will be arranged into the four required sections.',
          side: 'top' as const,
          align: 'center' as const,
        },
      },
      {
        element: '[data-tour="response"]',
        onHighlighted: refreshTourStep,
        popover: {
          title: 'Review and copy',
          description:
            'The completed response appears here. Review it, then copy the full text when it is ready.',
          side: 'bottom' as const,
          align: 'start' as const,
        },
      },
    ]

    const tour = driver({
      animate: true,
      allowClose: true,
      overlayOpacity: isCompactTour ? 0.74 : 0.68,
      overlayColor: '#0f1720',
      popoverClass: 'app-tour-popover',
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: isCompactTour ? 'Done' : 'Start writing',
      smoothScroll: false,
      stagePadding: isCompactTour ? 4 : 6,
      stageRadius: isCompactTour ? 12 : 14,
      onDestroyed: () => {
        if (markAsSeen) {
          window.localStorage.setItem(TOUR_STORAGE_KEY, 'seen')
        }

        tourRef.current = null
      },
      steps: isCompactTour ? compactSteps : fullSteps,
    })

    tourRef.current = tour
    tour.drive()
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 430px)')
    const syncCompactTour = () => {
      setIsCompactTour(mediaQuery.matches)
    }

    syncCompactTour()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncCompactTour)
    } else {
      mediaQuery.addListener(syncCompactTour)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncCompactTour)
      } else {
        mediaQuery.removeListener(syncCompactTour)
      }
    }
  }, [])

  useEffect(() => {
    if (window.localStorage.getItem(TOUR_STORAGE_KEY) === 'seen') {
      return
    }

    const timer = window.setTimeout(() => {
      startTour(true)
    }, 450)

    return () => {
      window.clearTimeout(timer)
      tourRef.current?.destroy()
    }
  }, [isCompactTour])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(169,205,110,0.18),_transparent_22%),linear-gradient(180deg,_#eef4e7_0%,_#e6ece0_34%,_#dde4dc_100%)] px-3 py-3 text-slate-950 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-3 rounded-[1.8rem] border border-slate-900/8 bg-white/82 px-4 py-5 shadow-[0_18px_40px_rgba(22,37,17,0.08)] backdrop-blur sm:mb-4 sm:px-6 sm:py-6 lg:rounded-[2rem] lg:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-500">
                Weekly Reflection
              </p>
              <h1 className="mt-3 text-[clamp(1.85rem,6vw,3.75rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950">
                Turn rough notes into clear, structured answers.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Choose the focus area, write the draft naturally, and generate four concise
                sections that are ready to review and paste.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-300 bg-lime-50 px-4 py-1.5 text-[0.75rem] font-semibold text-lime-700 shadow-sm transition hover:border-lime-400 hover:bg-lime-100 hover:text-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2"
                onClick={() => startTour(false)}
              >
                <TourCompassIcon />
                Quick tour
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 self-start sm:grid-cols-4 lg:self-auto">
              {questionCards.map((question) => (
                <div
                  key={question.key}
                  className="rounded-[1.2rem] border border-slate-900/8 bg-slate-50 px-3 py-3"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    {question.index}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{question.title}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start">
          <form
            className="rounded-[1.8rem] border border-slate-900/8 bg-[#132227] p-4 text-white shadow-[0_22px_54px_rgba(16,24,18,0.18)] sm:p-5 lg:sticky lg:top-6 lg:rounded-[2rem] lg:p-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-lime-200/80">
                  Draft
                </p>
                <h2 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.03em] sm:text-[1.8rem]">
                  Start with the focus area, then write the situation clearly.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Keep the wording natural. Include the observation, the conversation, and
                  the action you want reflected in the final response.
                </p>
              </div>

              <div className="space-y-4">
                <div data-tour="focus-area">
                  <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-lime-200/60">
                    Focus Area
                  </span>
                  <Listbox value={focusArea} onChange={setFocusArea}>
                    <div className="relative">
                      <Listbox.Button className="flex w-full items-start justify-between gap-3 rounded-[1.15rem] border border-white/12 bg-white/7 px-4 py-3 text-left text-[0.97rem] text-white outline-none transition hover:bg-white/10 focus-visible:border-lime-300/55 focus-visible:bg-white/10 focus-visible:shadow-[0_0_0_3px_rgba(163,228,78,0.14)] focus-visible:ring-0">
                        <span className="min-w-0 flex-1 pr-2 leading-6 whitespace-normal">
                          {selectedFocus.label}
                        </span>
                        <svg
                          aria-hidden="true"
                          className="mt-1 h-4 w-4 shrink-0 text-slate-300"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Listbox.Button>

                      <Listbox.Options className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[1.35rem] border border-slate-200 bg-white p-2 text-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.14)] outline-none">
                        {focusAreaOptions.map((option) => (
                          <Listbox.Option
                            key={option.value}
                            value={option.value}
                            className={({ focus, selected }) =>
                              [
                                'cursor-pointer rounded-[1rem] px-3 py-3 text-sm leading-6 transition',
                                selected
                                  ? 'bg-slate-950 text-white'
                                  : focus
                                    ? 'bg-slate-100 text-slate-950'
                                    : 'text-slate-700',
                              ].join(' ')
                            }
                          >
                            {option.label}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                {focusArea === 'others' ? (
                  <label className="block">
                    <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-lime-200/60">
                      Custom Focus Area
                    </span>
                    <input
                      className="min-h-[3.5rem] w-full rounded-[1.15rem] border border-white/12 bg-white/7 px-4 py-3 text-[0.97rem] text-white outline-none transition placeholder:text-slate-500 focus:border-lime-300/55 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(163,228,78,0.14)] focus:ring-0"
                      placeholder="Type the focus area"
                      value={customFocusArea}
                      onChange={(event) => setCustomFocusArea(event.target.value)}
                    />
                  </label>
                ) : null}

                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Questions covered in the result</p>
                  <div className="mt-3 space-y-3">
                    {questionCards.map((question) => (
                      <div key={question.key} className="flex gap-3">
                        <span className="mt-[0.15rem] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-[0.72rem] font-semibold text-slate-950">
                          {question.index}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{question.title}</p>
                          <p className="text-sm leading-6 text-slate-300">{question.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2.5 block text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-lime-200/60">
                    Draft
                  </span>
                  <textarea
                    data-tour="draft"
                    className="min-h-[18rem] w-full resize-y rounded-[1.2rem] border border-[#b9cca2] bg-[#f5f3eb] px-5 py-4 text-[0.97rem] leading-[1.8] text-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.06),_inset_0_1.5px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-slate-400/60 focus:border-[#7db83e] focus:bg-[#f3f1e7] focus:shadow-[0_0_0_3.5px_rgba(125,184,62,0.18),_0_1px_3px_rgba(15,23,42,0.05)] focus:ring-0 sm:min-h-[22rem] sm:px-5 sm:py-5 lg:min-h-[27rem]"
                    placeholder="Write what happened, what was discussed, and what actions should come out of it."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                </label>

                <div className="rounded-[1.3rem] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-slate-300">
                  {draftingHints.map((hint) => (
                    <p key={hint}>{hint}</p>
                  ))}
                </div>

                {errorMessage ? (
                  <div className="rounded-[1.3rem] border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-tour="generate"
                    className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-full bg-lime-300 px-6 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(164,197,89,0.28)] transition hover:bg-lime-200 focus:outline-none focus:ring-4 focus:ring-lime-200/40 disabled:cursor-not-allowed disabled:bg-lime-100 sm:w-auto sm:min-w-56"
                  >
                    {isSubmitting ? 'Generating...' : 'Generate response'}
                  </button>
                  <p className="text-sm text-slate-400">
                    {focusArea === 'others' && customFocusArea.trim()
                      ? customFocusArea.trim()
                      : selectedFocus.label}
                  </p>
                </div>
              </div>
            </div>
          </form>

          <section
            className="rounded-[1.8rem] border border-slate-900/8 bg-white p-4 shadow-[0_22px_54px_rgba(16,24,18,0.1)] sm:p-5 lg:rounded-[2rem] lg:p-6"
          >
            <div
              className="flex flex-col gap-4 border-b border-slate-900/8 pb-4 sm:flex-row sm:items-start sm:justify-between"
              data-tour="response"
            >
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Response
                </p>
                <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.8rem]">
                  Four sections, clean bullets, ready to use.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Review the wording, make any edits you want, then copy the full text.
                </p>
              </div>

              <button
                type="button"
                className={[
                  'inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition focus:outline-none focus:ring-4',
                  result
                    ? 'border border-slate-900/10 bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] hover:bg-slate-800 focus:ring-slate-300'
                    : 'border border-slate-200 bg-slate-100 text-slate-400',
                ].join(' ')}
                onClick={handleCopyResponse}
                disabled={!result}
              >
                <CopyIcon />
                {copyMessage || 'Copy full text'}
              </button>
            </div>

            <div className="mt-4">
              {result ? (
                <div className="space-y-5">
                  <div className="rounded-[1.35rem] border border-slate-900/8 bg-slate-50 px-4 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Focus Area
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-lime-200 px-3 py-1 text-sm font-semibold text-lime-950">
                        {result.focusAreaLabel}
                      </span>
                    </div>
                  </div>

                  {questionCards.map((question) => {
                    const items = result.answers[question.key]

                    return (
                      <section key={question.key} className="border-b border-slate-900/8 pb-5 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[0.75rem] font-semibold text-white">
                            {question.index}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                              {question.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {question.prompt}
                            </p>
                          </div>
                        </div>

                        <ul className="mt-4 space-y-3 pl-1">
                          {items.map((item, index) => (
                            <li key={`${question.key}-${index}`} className="flex items-start gap-3">
                              <span className="mt-[0.6rem] h-2.5 w-2.5 shrink-0 rounded-full bg-lime-500" />
                              <span className="text-sm leading-7 text-slate-800">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[1.45rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-7 text-slate-600">
                    Generate a response to see the final wording arranged into the four required sections.
                  </div>
                  {questionCards.map((question) => (
                    <div
                      key={question.key}
                      className="rounded-[1.3rem] border border-slate-900/8 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[0.75rem] font-semibold text-slate-700">
                          {question.index}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{question.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {question.prompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="4" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 13V6.5C4 5.67157 4.67157 5 5.5 5H11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TourCompassIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M9.4 4.6L7.65 7.65L4.6 9.4L6.35 6.35L9.4 4.6Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  )
}

const buildCopyText = (result: SlpiaResponse) => {
  return [
    `Focus Area: ${result.focusAreaLabel}`,
    '',
    '1. Intent - why is this your area of focus?',
    ...result.answers.intent.map((item) => `- ${item}`),
    '',
    '2. Learning - what did you learn?',
    ...result.answers.learning.map((item) => `- ${item}`),
    '',
    '3. Reflection - what does this mean for you and what will you do differently?',
    ...result.answers.reflection.map((item) => `- ${item}`),
    '',
    '4. Safety Leadership Principles demonstrated',
    ...result.answers.safetyLeadershipPrinciples.map((item) => `- ${item}`),
  ].join('\n')
}

export default App
