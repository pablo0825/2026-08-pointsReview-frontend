import type { ReactNode } from 'react'

export type WizardStep = {
  label: string
}

type ApplicationWizardProps = {
  steps: readonly WizardStep[]
  currentStep: number
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  onStepSelect?: (step: number) => void
  nextDisabled?: boolean
  nextLabel?: string
}

export function ApplicationWizard({
  steps,
  currentStep,
  children,
  onBack,
  onNext,
  onStepSelect,
  nextDisabled = false,
  nextLabel = '下一步',
}: ApplicationWizardProps) {
  const step = steps[currentStep]

  return (
    <section aria-labelledby="wizard-heading" className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-700">
          步驟 {currentStep + 1}／{steps.length}
        </p>
        <h1
          className="text-3xl font-bold tracking-tight text-slate-950"
          id="wizard-heading"
          tabIndex={-1}
        >
          {step.label}
        </h1>
        <ol aria-label="申請步驟" className="grid gap-2 sm:grid-cols-5">
          {steps.map(({ label }, index) => {
            const isCurrent = index === currentStep
            const canNavigate = index < currentStep && Boolean(onStepSelect)

            return (
              <li key={label}>
                <button
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'min-h-11 w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2',
                    isCurrent
                      ? 'border-blue-700 bg-blue-50 text-blue-900'
                      : canNavigate
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-blue-700 hover:text-blue-900'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
                  ].join(' ')}
                  disabled={!canNavigate}
                  onClick={() => onStepSelect?.(index)}
                  type="button"
                >
                  {index + 1}. {label}
                </button>
              </li>
            )
          })}
        </ol>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onBack ? (
          <button
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2 font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            onClick={onBack}
            type="button"
          >
            上一步
          </button>
        ) : (
          <span />
        )}
        {onNext ? (
          <button
            className="min-h-11 rounded-lg bg-blue-800 px-5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            disabled={nextDisabled}
            onClick={onNext}
            type="button"
          >
            {nextLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}
