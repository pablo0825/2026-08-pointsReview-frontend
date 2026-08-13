import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  fetchPublishedInstructions,
  publishedInstructionsQueryKey,
} from './api/published-instructions.query'
import { type ApplicationType } from './api/published-instructions.schema'
import { InstructionsArticle } from './components/instructions-article'
import { getTaiwanAcademicYear } from '../../shared/lib/academic-year'

const applicationTypes = [
  { value: 'competition', label: '競賽申請' },
  { value: 'project_participation', label: '參與計畫申請' },
  { value: 'certificate', label: '證照申請' },
  { value: 'exhibition', label: '展覽申請' },
] as const satisfies ReadonlyArray<{
  value: ApplicationType
  label: string
}>

type Selection = {
  applicationType: ApplicationType
  academicYear: string
}

function uniqueAcademicYears(
  years: string[],
  selectedAcademicYear: string,
) {
  return [...new Set([...years, selectedAcademicYear])].sort(
    (left, right) => Number(right) - Number(left),
  )
}

export function PublishedInstructionsPage() {
  const currentAcademicYear = getTaiwanAcademicYear()
  const [selection, setSelection] = useState<Selection | null>(null)
  const queryApplicationType = selection?.applicationType ?? 'competition'
  const queryAcademicYear = selection?.academicYear ?? currentAcademicYear

  const instructionsQuery = useQuery({
    enabled: selection !== null,
    queryKey: publishedInstructionsQueryKey({
      applicationType: queryApplicationType,
    }),
    queryFn: ({ signal }) =>
      fetchPublishedInstructions(
        { applicationType: queryApplicationType },
        signal,
      ),
  })

  const availableYears = uniqueAcademicYears(
    (instructionsQuery.data ?? []).map(({ academicYear }) => academicYear),
    queryAcademicYear,
  )
  const selectedSections = (instructionsQuery.data ?? []).filter(
    ({ academicYear }) => academicYear === queryAcademicYear,
  )

  function selectApplicationType(applicationType: ApplicationType) {
    setSelection({ applicationType, academicYear: currentAcademicYear })
  }

  function retry() {
    if (instructionsQuery.isError) {
      void instructionsQuery.refetch()
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-blue-700">
          公開申請辦法
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          請選擇申請類型
        </h1>
      </header>

      <div
        aria-label="申請類型"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
      >
        {applicationTypes.map(({ value, label }) => {
          const isSelected = selection?.applicationType === value

          return (
            <button
              aria-pressed={isSelected}
              className={[
                'min-h-14 rounded-xl border px-4 py-3 text-base font-bold shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-blue-800 bg-blue-800 text-white'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-800',
              ].join(' ')}
              key={value}
              onClick={() => selectApplicationType(value)}
              type="button"
            >
              {label}
            </button>
          )
        })}
      </div>

      {selection ? (
        <section aria-label="申請辦法內容" className="space-y-6">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:max-w-xs">
            <label
              className="text-sm font-bold text-slate-800"
              htmlFor="academic-year"
            >
              學年度
            </label>
            <select
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              disabled={instructionsQuery.isPending}
              id="academic-year"
              onChange={(event) => {
                const academicYear = event.target.value
                setSelection((current) =>
                  current ? { ...current, academicYear } : current,
                )
              }}
              value={selection.academicYear}
            >
              {availableYears.map((academicYear) => (
                <option key={academicYear} value={academicYear}>
                  {academicYear} 學年度
                  {academicYear === currentAcademicYear ? '（目前）' : ''}
                </option>
              ))}
            </select>
          </div>

          {instructionsQuery.isError ? (
            <div
              aria-live="polite"
              className="rounded-2xl border border-red-200 bg-red-50 p-6"
              role="alert"
            >
              <h2 className="text-xl font-bold text-red-950">
                暫時無法載入申請辦法
              </h2>
              <p className="mt-2 text-red-900">請稍後再試一次。</p>
              <button
                className="mt-4 min-h-11 rounded-lg bg-red-900 px-4 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
                onClick={retry}
                type="button"
              >
                重新載入
              </button>
            </div>
          ) : instructionsQuery.isPending ? (
            <div
              aria-live="polite"
              className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700"
              role="status"
            >
              正在載入申請辦法…
            </div>
          ) : selectedSections.length === 0 ? (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-6"
              role="status"
            >
              <h2 className="text-xl font-bold text-slate-950">
                此學年度目前沒有公開辦法
              </h2>
              <p className="mt-2 text-slate-600">
                請選擇其他學年度，或稍後再回來查看。
              </p>
            </div>
          ) : (
            <InstructionsArticle sections={selectedSections} />
          )}
        </section>
      ) : (
        <p className="rounded-xl bg-blue-50 p-4 text-blue-950" role="status">
          選擇申請類型後，即可查看適用的公開辦法。
        </p>
      )}
    </div>
  )
}
