import { getClassNumberLabel, getGradeLabel } from '../../common/lib/student-profile-options'
import type { ExhibitionApplicationForm } from '../model/exhibition-application.schema'

type Props = {
  participants: ExhibitionApplicationForm['participants']
  allowedPoints: readonly string[]
  errors: Readonly<Record<string, string | undefined>>
  onChange: (index: number, points: string) => void
}

export function ExhibitionParticipantPoints({ participants, allowedPoints, errors, onChange }: Props) {
  return (
    <section aria-labelledby="participant-points-heading" className="space-y-4">
      <div>
        <h2 className="text-xl font-bold" id="participant-points-heading">參與者點數</h2>
        <p className="mt-1 text-sm text-slate-600">參與者資料請返回第一步修改；此處只選擇目前規則提供的點數。</p>
      </div>
      {errors.participants ? <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">{errors.participants}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {participants.map((participant, index) => {
          const error = errors[`participants.${index}.requestedPoints`]
          return (
            <article className="space-y-3 rounded-xl border border-slate-200 p-4" key={participant.clientKey}>
              <div>
                <h3 className="font-bold">{participant.studentName}{participant.isApplicant ? '（申請人）' : ''}</h3>
                <p className="text-sm text-slate-600">{participant.studentNumber}｜{getGradeLabel(participant.grade)} {getClassNumberLabel(participant.classNumber)}</p>
              </div>
              <label className="space-y-1 font-semibold">
                參與者 {index + 1} 申請點數
                <select aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 aria-[invalid=true]:border-red-700" data-field-path={`participants.${index}.requestedPoints`} onChange={(event) => onChange(index, event.target.value)} value={participant.requestedPoints}>
                  <option value="">請選擇點數</option>
                  {allowedPoints.map((points) => <option key={points} value={points}>{points} 點</option>)}
                </select>
                {error ? <span className="block text-sm font-semibold text-red-800">{error}</span> : null}
              </label>
            </article>
          )
        })}
      </div>
    </section>
  )
}
