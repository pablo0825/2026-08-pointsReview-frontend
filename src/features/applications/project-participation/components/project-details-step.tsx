import type { ProjectEstimateState } from '../model/project-estimate-state'
import type { ProjectParticipationForm } from '../model/project-participation.schema'
import { FieldErrorMessage, invalidFieldClassName } from '../../common/components/error-summary'

type ProjectDetailsStepProps = {
  value: ProjectParticipationForm
  errors: Readonly<Record<string, string | undefined>>
  estimateState: ProjectEstimateState
  estimatePending: boolean
  onFieldChange: (
    field: 'projectName' | 'principalInvestigator' | 'workDescription',
    value: string,
  ) => void
  onSalaryChange: (
    index: number,
    field: 'salaryMonth' | 'salaryAmount',
    value: string,
  ) => void
  onAddSalary: () => void
  onRemoveSalary: (index: number) => void
  onEstimate: () => void
}

function fieldClass(error?: string) {
  return `min-h-11 w-full rounded-lg border px-3 ${error ? invalidFieldClassName : 'border-slate-300'}`
}

export function ProjectDetailsStep({
  value,
  errors,
  estimateState,
  estimatePending,
  onFieldChange,
  onSalaryChange,
  onAddSalary,
  onRemoveSalary,
  onEstimate,
}: ProjectDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 font-semibold">
          計畫名稱
          <input
            aria-describedby={errors.projectName ? 'projectName-error' : undefined}
            aria-invalid={Boolean(errors.projectName)}
            className={fieldClass(errors.projectName)}
            data-field-path="projectName"
            maxLength={255}
            onChange={(event) => onFieldChange('projectName', event.target.value)}
            value={value.projectName}
          />
          <FieldErrorMessage id="projectName-error" message={errors.projectName} />
        </label>
        <label className="block space-y-1 font-semibold">
          計畫主持人
          <input
            aria-describedby={errors.principalInvestigator ? 'principalInvestigator-error' : undefined}
            aria-invalid={Boolean(errors.principalInvestigator)}
            className={fieldClass(errors.principalInvestigator)}
            data-field-path="principalInvestigator"
            maxLength={100}
            onChange={(event) => onFieldChange('principalInvestigator', event.target.value)}
            value={value.principalInvestigator}
          />
          <FieldErrorMessage id="principalInvestigator-error" message={errors.principalInvestigator} />
        </label>
      </div>
      <div className="space-y-1">
        <label className="block font-semibold" htmlFor="workDescription">
          工作內容
        </label>
        <textarea
          aria-describedby={errors.workDescription ? 'workDescription-error' : 'workDescription-count'}
          aria-invalid={Boolean(errors.workDescription)}
          className={`min-h-36 w-full rounded-lg border p-3 ${errors.workDescription ? invalidFieldClassName : 'border-slate-300'}`}
          data-field-path="workDescription"
          id="workDescription"
          maxLength={1_000}
          onChange={(event) => onFieldChange('workDescription', event.target.value)}
          value={value.workDescription}
        />
        <span className="text-sm text-slate-600" id="workDescription-count">
          {value.workDescription.length}／1,000 字
        </span>
        <FieldErrorMessage id="workDescription-error" message={errors.workDescription} />
      </div>

      <section aria-labelledby="salary-heading" className="space-y-4 rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold" id="salary-heading">薪資明細</h2>
            <p className="text-sm text-slate-600">每月 1～50,000 元，最多 12 個不同月份。</p>
          </div>
          <button
            className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800 disabled:border-slate-300 disabled:text-slate-400"
            disabled={value.salaryItems.length >= 12}
            onClick={onAddSalary}
            type="button"
          >
            新增薪資月份
          </button>
        </div>
        <FieldErrorMessage id="salaryItems-error" message={errors.salaryItems} />
        <div className="space-y-4">
          {value.salaryItems.map((item, index) => {
            const monthError = errors[`salaryItems.${index}.salaryMonth`]
            const amountError = errors[`salaryItems.${index}.salaryAmount`]
            return (
              <fieldset className="rounded-lg bg-slate-50 p-4" key={item.clientKey}>
                <legend className="px-2 font-bold">薪資 {index + 1}</legend>
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                  <div className="space-y-1">
                    <label className="block font-semibold" htmlFor={`salaryItems-${index}-month`}>
                      薪資月份
                    </label>
                    <input
                      aria-describedby={monthError ? `salaryItems-${index}-month-error` : undefined}
                      aria-invalid={Boolean(monthError)}
                      className={fieldClass(monthError)}
                      data-field-path={`salaryItems.${index}.salaryMonth`}
                      id={`salaryItems-${index}-month`}
                      onChange={(event) => onSalaryChange(index, 'salaryMonth', event.target.value)}
                      type="month"
                      value={item.salaryMonth}
                    />
                    <FieldErrorMessage id={`salaryItems-${index}-month-error`} message={monthError} />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold" htmlFor={`salaryItems-${index}-amount`}>
                      單月薪資
                    </label>
                    <input
                      aria-describedby={amountError ? `salaryItems-${index}-amount-error` : undefined}
                      aria-invalid={Boolean(amountError)}
                      className={fieldClass(amountError)}
                      data-field-path={`salaryItems.${index}.salaryAmount`}
                      id={`salaryItems-${index}-amount`}
                      inputMode="numeric"
                      max="50000"
                      min="1"
                      onChange={(event) => onSalaryChange(index, 'salaryAmount', event.target.value)}
                      step="1"
                      type="number"
                      value={item.salaryAmount}
                    />
                    <FieldErrorMessage id={`salaryItems-${index}-amount-error`} message={amountError} />
                  </div>
                  <button
                    className="min-h-11 rounded-lg border border-red-300 px-4 py-2 font-bold text-red-800 disabled:border-slate-200 disabled:text-slate-400 sm:mt-6"
                    disabled={value.salaryItems.length === 1}
                    onClick={() => onRemoveSalary(index)}
                    type="button"
                  >
                    移除
                  </button>
                </div>
              </fieldset>
            )
          })}
        </div>
        <button
          className="min-h-11 rounded-lg bg-blue-800 px-5 py-2 font-bold text-white disabled:bg-slate-400"
          disabled={estimatePending}
          onClick={onEstimate}
          type="button"
        >
          {estimatePending ? '試算中…' : estimateState.status === 'error' ? '重新試算' : '試算點數'}
        </button>
        {estimateState.status === 'success' ? (
          <div
            className={`rounded-lg p-4 ${estimateState.result.isEligible ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`}
            role="status"
          >
            <p>總薪資：{estimateState.result.totalSalary.toLocaleString('zh-TW')} 元</p>
            <p className="font-bold">預估點數：{estimateState.result.estimatedPoints} 點</p>
            <p>{estimateState.result.isEligible ? '已達申請門檻' : '尚未達最低申請門檻'}</p>
          </div>
        ) : estimateState.status === 'error' ? (
          <p className="rounded-lg bg-red-50 p-4 font-semibold text-red-900" role="alert">
            暫時無法試算點數，請稍後再試
          </p>
        ) : null}
      </section>
    </div>
  )
}
