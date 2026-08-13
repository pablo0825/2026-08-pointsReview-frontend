import type {
  CompetitionPointOption,
} from '../api/competition-application.schema'
import type { CompetitionApplicationForm } from '../model/competition-application.schema'
import { getSharedAllocation } from '../model/competition-points'
import { awardLabels, competitionLevelLabels } from './competition-options'
import type { Award, CompetitionLevel } from '../api/competition-application.schema'
import { FieldErrorMessage, invalidFieldClassName } from '../../common/components/error-summary'

type CompetitionDetailsStepProps = {
  value: CompetitionApplicationForm
  options: readonly CompetitionPointOption[]
  selectedOption: CompetitionPointOption | null
  onChange: (patch: Partial<CompetitionApplicationForm>) => void
  errors?: Readonly<Record<string, string | undefined>>
}

export function CompetitionDetailsStep({
  value,
  options,
  selectedOption,
  onChange,
  errors = {},
}: CompetitionDetailsStepProps) {
  const levels = [...new Set(options.map(({ competitionLevel }) => competitionLevel))]
  const awards = options
    .filter(({ competitionLevel }) => competitionLevel === value.competitionLevel)
    .map(({ award }) => award)
  const allocation =
    selectedOption?.allocationMethod === 'shared_total'
      ? getSharedAllocation(
          value.participants.map(({ requestedPoints }) => requestedPoints),
          selectedOption,
        )
      : null

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 font-semibold">
          競賽等級
          <select
            aria-label="競賽等級"
            aria-describedby={errors.competitionLevel ? 'competitionLevel-error' : undefined}
            aria-invalid={Boolean(errors.competitionLevel)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.competitionLevel ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="competitionLevel"
            onChange={(event) =>
              onChange({
                competitionLevel: event.target.value as CompetitionLevel,
                competitionLevelOther: null,
                award: null,
              })
            }
            value={value.competitionLevel ?? ''}
          >
            <option value="">請選擇</option>
            {levels.map((level) => (
              <option key={level} value={level}>{competitionLevelLabels[level]}</option>
            ))}
          </select>
          <FieldErrorMessage id="competitionLevel-error" message={errors.competitionLevel} />
        </label>
        <label className="space-y-1 font-semibold">
          獎項
          <select
            aria-label="獎項"
            aria-describedby={errors.award ? 'award-error' : undefined}
            aria-invalid={Boolean(errors.award)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.award ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="award"
            disabled={!value.competitionLevel}
            onChange={(event) =>
              onChange({ award: event.target.value as Award })
            }
            value={value.award ?? ''}
          >
            <option value="">請選擇</option>
            {awards.map((award) => (
              <option key={award} value={award}>{awardLabels[award]}</option>
            ))}
          </select>
          <FieldErrorMessage id="award-error" message={errors.award} />
        </label>
      </div>
      {value.competitionLevel === 'other' ? (
        <label className="block space-y-1 font-semibold">
          其他競賽等級
          <input
            aria-label="其他競賽等級"
            aria-describedby={errors.competitionLevelOther ? 'competitionLevelOther-error' : undefined}
            aria-invalid={Boolean(errors.competitionLevelOther)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.competitionLevelOther ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="competitionLevelOther"
            maxLength={100}
            onChange={(event) =>
              onChange({ competitionLevelOther: event.target.value })
            }
            value={value.competitionLevelOther ?? ''}
          />
          <FieldErrorMessage id="competitionLevelOther-error" message={errors.competitionLevelOther} />
        </label>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 font-semibold sm:col-span-2">
          競賽名稱
          <input
            aria-label="競賽名稱"
            aria-describedby={errors.competitionName ? 'competitionName-error' : undefined}
            aria-invalid={Boolean(errors.competitionName)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.competitionName ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="competitionName"
            maxLength={255}
            onChange={(event) => onChange({ competitionName: event.target.value })}
            value={value.competitionName}
          />
          <FieldErrorMessage id="competitionName-error" message={errors.competitionName} />
        </label>
        <label className="space-y-1 font-semibold">
          競賽類別
          <input
            aria-label="競賽類別"
            aria-describedby={errors.competitionCategory ? 'competitionCategory-error' : undefined}
            aria-invalid={Boolean(errors.competitionCategory)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.competitionCategory ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="competitionCategory"
            maxLength={100}
            onChange={(event) =>
              onChange({ competitionCategory: event.target.value })
            }
            value={value.competitionCategory}
          />
          <FieldErrorMessage id="competitionCategory-error" message={errors.competitionCategory} />
        </label>
        <label className="space-y-1 font-semibold">
          競賽日期
          <input
            aria-label="競賽日期"
            aria-describedby={errors.competitionDate ? 'competitionDate-error' : undefined}
            aria-invalid={Boolean(errors.competitionDate)}
            className={`min-h-11 w-full rounded-lg border px-3 ${errors.competitionDate ? invalidFieldClassName : 'border-slate-300'}`}
            data-field-path="competitionDate"
            onChange={(event) => onChange({ competitionDate: event.target.value })}
            type="date"
            value={value.competitionDate}
          />
          <FieldErrorMessage id="competitionDate-error" message={errors.competitionDate} />
        </label>
      </div>
      {selectedOption ? (
        <section className="rounded-xl bg-blue-50 p-4" aria-live="polite">
          <h2 className="font-bold text-blue-950">
            {selectedOption.allocationMethod === 'per_person'
              ? '每人固定點數'
              : '團隊總點數分配'}
          </h2>
          <p className="mt-1 text-blue-900">
            {selectedOption.allocationMethod === 'per_person'
              ? `每位參與者固定取得 ${selectedOption.points} 點，不可自行修改。`
              : `團隊共 ${selectedOption.points} 點；每人至少 ${selectedOption.minimumPointsPerParticipant} 點，並以 ${selectedOption.pointIncrement} 點為分配單位。`}
          </p>
          {allocation ? (
            <p className="mt-2 font-semibold text-blue-950">
              已分配 {allocation.allocated ?? '—'} 點；剩餘{' '}
              {allocation.remaining ?? '—'} 點。
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
