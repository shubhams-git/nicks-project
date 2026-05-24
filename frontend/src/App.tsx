import { Listbox } from '@headlessui/react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
  {
    title: 'Observation',
    detail: 'The situation or risk is visible in the draft.',
    pattern: /\b(observed|noticed|saw|checked|spoke|discussed|reviewed|found|identified)\b/i,
  },
  {
    title: 'Conversation',
    detail: 'The team or person involved is part of the story.',
    pattern: /\b(team|person|worker|contractor|customer|staff|manager|leader|colleague)\b/i,
  },
  {
    title: 'Follow-through',
    detail: 'A next action or commitment is included.',
    pattern: /\b(action|follow|next|will|plan|remind|raise|update|coach|check|review|improve)\b/i,
  },
]

const defaultDraft =
  'I spoke with the team about keeping the forecourt clear during a busy shift. We discussed how vehicles can move unexpectedly near pumps and the Wildbean Cafe entry. I reminded the team to stay alert around customer movement, keep the Comms Board updated, and raise any Check-it alerts early so we can act before the risk builds up.'
const TOUR_STORAGE_KEY = 'nicks-project-onboarding-tour-v1'
const MAX_DRAFT_LENGTH = 12000

const refreshTourStep = (
  _element: Element | undefined,
  _step: unknown,
  opts: { driver: ReturnType<typeof driver> },
) => {
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
  const trimmedDraft = draft.trim()
  const activeFocusLabel =
    focusArea === 'others' && customFocusArea.trim()
      ? customFocusArea.trim()
      : selectedFocus.label

  const draftSignals = useMemo(
    () =>
      draftingHints.map((hint) => ({
        ...hint,
        isActive: hint.pattern.test(draft),
      })),
    [draft],
  )
  const readyChecks = [
    Boolean(activeFocusLabel),
    Boolean(trimmedDraft),
    focusArea !== 'others' || Boolean(customFocusArea.trim()),
    draftSignals.some((hint) => hint.isActive),
  ]
  const readinessScore = Math.round(
    (readyChecks.filter(Boolean).length / readyChecks.length) * 100,
  )
  const draftUsage = Math.min(100, Math.round((draft.length / MAX_DRAFT_LENGTH) * 100))
  const workflowSteps = [
    { label: 'Focus', status: activeFocusLabel ? 'complete' : 'idle' },
    { label: 'Draft', status: trimmedDraft ? 'complete' : 'idle' },
    { label: 'Generate', status: isSubmitting ? 'active' : result ? 'complete' : 'idle' },
    { label: 'Review', status: result ? 'active' : 'idle' },
  ]

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
      overlayOpacity: isCompactTour ? 0.78 : 0.72,
      overlayColor: '#05070a',
      popoverClass: 'app-tour-popover',
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: isCompactTour ? 'Done' : 'Start writing',
      smoothScroll: false,
      stagePadding: isCompactTour ? 4 : 6,
      stageRadius: isCompactTour ? 8 : 10,
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
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),transparent_32%),linear-gradient(215deg,rgba(132,204,22,0.08),transparent_38%),linear-gradient(180deg,#080b10_0%,#0b0f14_46%,#06070a_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1540px] flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
        <header className="mb-4 border-b border-white/10 bg-[#07090d]/80 pb-4 backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                <SparkIcon />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                  SLPIA Workbench
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                  Safety reflection composer
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
                {workflowSteps.map((step) => (
                  <span
                    key={step.label}
                    className={[
                      'flex min-h-9 items-center justify-center gap-1.5 rounded-md px-2 text-[0.72rem] font-semibold transition sm:px-3 sm:text-xs',
                      step.status === 'active'
                        ? 'bg-cyan-300 text-slate-950'
                        : step.status === 'complete'
                          ? 'bg-lime-300/16 text-lime-100'
                          : 'text-slate-400',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'h-1.5 w-1.5 rounded-full',
                        step.status === 'active'
                          ? 'bg-slate-950'
                          : step.status === 'complete'
                            ? 'bg-lime-300'
                            : 'bg-slate-600',
                      ].join(' ')}
                    />
                    {step.label}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/35 hover:bg-cyan-200/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/35"
                onClick={() => startTour(false)}
              >
                <TourCompassIcon />
                Tour
              </button>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_minmax(24rem,0.95fr)] xl:items-start">
          <aside className="rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_22px_60px_rgba(0,0,0,0.25)] backdrop-blur xl:sticky xl:top-4">
            <div className="border-b border-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Context
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">
                {activeFocusLabel}
              </h2>
            </div>

            <div className="space-y-5 p-4">
              <div data-tour="focus-area">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Focus area
                </span>
                <Listbox value={focusArea} onChange={setFocusArea}>
                  <div className="relative">
                    <Listbox.Button className="flex min-h-[3.6rem] w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0d141a] px-3 text-left text-sm text-white outline-none transition hover:border-cyan-300/35 hover:bg-[#111b22] focus-visible:border-cyan-300/65 focus-visible:shadow-[0_0_0_3px_rgba(34,211,238,0.13)]">
                      <span className="min-w-0 flex-1 leading-5">{selectedFocus.label}</span>
                      <ChevronIcon />
                    </Listbox.Button>

                    <Listbox.Options className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-white/12 bg-[#0c1117] p-1.5 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.45)] outline-none">
                      {focusAreaOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
                          className={({ focus, selected }) =>
                            [
                              'flex cursor-pointer items-start justify-between gap-3 rounded-md px-3 py-2.5 text-sm leading-5 transition',
                              selected
                                ? 'bg-cyan-300 text-slate-950'
                                : focus
                                  ? 'bg-white/[0.08] text-white'
                                  : 'text-slate-300',
                            ].join(' ')
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span>{option.label}</span>
                              {selected ? <CheckIcon /> : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              {focusArea === 'others' ? (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Custom focus
                  </span>
                  <input
                    className="min-h-12 w-full rounded-lg border border-white/10 bg-[#0d141a] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-cyan-300/30 focus:border-cyan-300/65 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.13)]"
                    placeholder="Type the focus area"
                    value={customFocusArea}
                    onChange={(event) => setCustomFocusArea(event.target.value)}
                  />
                </label>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Readiness
                  </span>
                  <span className="text-sm font-semibold text-cyan-100">{readinessScore}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#a3e635,#facc15)] transition-all duration-500"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {draftSignals.map((hint) => (
                  <div key={hint.title} className="flex gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                    <span
                      className={[
                        'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border',
                        hint.isActive
                          ? 'border-lime-300/40 bg-lime-300/15 text-lime-200'
                          : 'border-white/10 bg-white/[0.04] text-slate-500',
                      ].join(' ')}
                    >
                      {hint.isActive ? <CheckIcon /> : <DashIcon />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{hint.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{hint.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Required sections
                </p>
                <div className="mt-3 space-y-2">
                  {questionCards.map((question) => (
                    <div key={question.key} className="grid grid-cols-[2rem_1fr] items-start gap-2">
                      <span className="text-xs font-semibold text-cyan-200/70">
                        {question.index}
                      </span>
                      <span className="text-sm text-slate-300">{question.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <form
            className="rounded-lg border border-white/10 bg-[#0a0f14]/90 shadow-[0_28px_80px_rgba(0,0,0,0.33)] backdrop-blur"
            onSubmit={handleSubmit}
          >
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Draft composer
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Shape the source notes.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
                    {draft.length.toLocaleString()} chars
                  </span>
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                    {Math.max(0, MAX_DRAFT_LENGTH - draft.length).toLocaleString()} left
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <span>Draft</span>
                  <span>{draftUsage}% of limit</span>
                </span>
                <textarea
                  data-tour="draft"
                  className="min-h-[25rem] w-full resize-y rounded-lg border border-white/10 bg-[#101820] px-4 py-4 text-[0.98rem] leading-7 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-slate-600 hover:border-white/16 focus:border-cyan-300/65 focus:bg-[#111b23] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.13)] sm:min-h-[32rem] lg:min-h-[36rem]"
                  placeholder="Write what happened, what was discussed, and what actions should come out of it."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </label>

              {errorMessage ? (
                <div className="flex items-start gap-3 rounded-lg border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
                  <AlertIcon />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 text-sm leading-6 text-slate-400">
                  <span className="font-semibold text-slate-200">Focus:</span> {activeFocusLabel}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-tour="generate"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/25 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300 md:w-auto md:min-w-56"
                >
                  {isSubmitting ? <SpinnerIcon /> : <GenerateIcon />}
                  {isSubmitting ? 'Generating...' : 'Generate response'}
                </button>
              </div>
            </div>
          </form>

          <section
            className="rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_22px_60px_rgba(0,0,0,0.25)] backdrop-blur xl:sticky xl:top-4"
            data-tour="response"
          >
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Response
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    Final answer set
                  </h2>
                </div>

                <button
                  type="button"
                  className={[
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus:outline-none focus:ring-4',
                    result
                      ? 'border border-lime-300/30 bg-lime-300/15 text-lime-100 hover:bg-lime-300/22 focus:ring-lime-300/20'
                      : 'border border-white/10 bg-white/[0.04] text-slate-500',
                  ].join(' ')}
                  onClick={handleCopyResponse}
                  disabled={!result}
                >
                  <CopyIcon />
                  {copyMessage || 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {result ? (
                <div className="space-y-5">
                  <div className="grid gap-3 border-b border-white/10 pb-5 sm:grid-cols-2">
                    <ResultMeta label="Focus" value={result.focusAreaLabel} tone="cyan" />
                    <ResultMeta label="Model" value={result.model} tone="lime" />
                  </div>

                  <div className="space-y-5">
                    {questionCards.map((question) => {
                      const items = result.answers[question.key]

                      return (
                        <section
                          key={question.key}
                          className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#0d141a] text-xs font-semibold text-cyan-200">
                              {question.index}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-white">{question.title}</h3>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {question.prompt}
                              </p>
                            </div>
                          </div>

                          <ul className="mt-4 space-y-3">
                            {items.map((item, index) => (
                              <li key={`${question.key}-${index}`} className="flex gap-3">
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-lime-300" />
                                <span className="text-sm leading-7 text-slate-200">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-lg border border-dashed border-white/14 bg-[#0d141a] p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                        <ResultIcon />
                      </span>
                      <div>
                        <p className="font-semibold text-white">No response generated yet</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          The four-section response will appear here.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {questionCards.map((question) => (
                      <div key={question.key} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/[0.06] text-xs font-semibold text-slate-500">
                            {question.index}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-300">{question.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {question.prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function ResultMeta({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'lime' }) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
      : 'border-lime-300/25 bg-lime-300/10 text-lime-100'

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 rounded-lg border px-3 py-2 text-sm font-semibold ${toneClass}`}>
        {value}
      </p>
    </div>
  )
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4.25L17 16H3L10 4.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 8.3V11.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.2L6.5 11.1L12.6 4.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="none">
      <path
        d="M5.5 7.5L10 12L14.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
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

function DashIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GenerateIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3.5V6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 13.5V16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.5 10H6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 10H16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.4 5.4L7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.5 12.5L14.6 14.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.6 5.4L12.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7.5 12.5L5.4 14.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ResultIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
      <path d="M5 5.5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 10H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 14.5H10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-cyan-100" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2.8L12 8L17.2 10L12 12L10 17.2L8 12L2.8 10L8 8L10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M17 10C17 6.13401 13.866 3 10 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TourCompassIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12.8 7.2L10.8 10.8L7.2 12.8L9.2 9.2L12.8 7.2Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
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
