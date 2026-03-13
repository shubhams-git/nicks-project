const rewriteOptions = [
  'Make it clearer',
  'Make it more professional',
  'Make it concise',
  'Make it friendlier',
  'Turn it into bullet points',
  'Others',
]

function App() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f1e3_0%,_#efe6d6_45%,_#e7dbc9_100%)] px-3 py-3 text-stone-900 sm:px-5 sm:py-5">
      <form className="mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-4xl flex-col rounded-[2rem] border border-stone-900/10 bg-white/88 p-4 shadow-[0_24px_60px_rgba(52,38,22,0.14)] backdrop-blur sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[2.25rem] sm:p-6">
        <header className="border-b border-stone-900/8 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-stone-500">
                Rewrite Draft
              </p>
              <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-stone-950">
                Write first. Send when ready.
              </h1>
            </div>
            <span className="hidden rounded-full border border-stone-900/10 bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 sm:inline-flex">
              Personal workspace
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Choose one preset, draft the text, and send it. The backend rewrite flow
            will plug into this next.
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-end">
            <label className="block">
              <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-stone-500">
                Preset
              </span>
              <div className="relative">
                <select className="h-12 w-full appearance-none rounded-2xl border border-stone-900/10 bg-stone-50 px-4 pr-11 text-[0.95rem] text-stone-800 outline-none transition focus:border-stone-900/30 focus:bg-white focus:ring-4 focus:ring-amber-200/70">
                  {rewriteOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-stone-400">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
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
                </span>
              </div>
            </label>

            <p className="text-sm leading-6 text-stone-500 sm:pb-1">
              Keep the draft rough. The rewrite step will handle cleanup and tone.
            </p>
          </div>

          <label className="flex min-h-0 flex-1 flex-col">
            <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-stone-500">
              Draft
            </span>
            <textarea
              className="min-h-[58vh] flex-1 resize-none rounded-[1.75rem] border border-stone-900/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(248,245,238,0.96)_100%)] px-4 py-4 text-[1rem] leading-7 text-stone-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-stone-400 focus:border-stone-900/25 focus:ring-4 focus:ring-amber-200/70 sm:min-h-[64vh] sm:px-5 sm:py-5"
              placeholder="Start writing here. Keep it loose and fast."
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-900/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">One preset, one draft, one send.</p>
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(28,25,23,0.22)] transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-300 sm:w-auto"
          >
            Send draft
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
