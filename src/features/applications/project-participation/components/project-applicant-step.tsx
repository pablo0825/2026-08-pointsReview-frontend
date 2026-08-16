import type { ProjectParticipationForm } from '../model/project-participation.schema'
import { FieldErrorMessage, invalidFieldClassName } from '../../common/components/error-summary'

type ApplicantField =
  | 'studentName'
  | 'studentNumber'
  | 'grade'
  | 'classNumber'
  | 'applicantEmail'
  | 'applicantPhone'

export function ProjectApplicantStep({
  value,
  errors,
  onChange,
}: {
  value: ProjectParticipationForm
  errors: Readonly<Record<string, string | undefined>>
  onChange: (field: ApplicantField, value: string | number) => void
}) {
  const inputClass = (error?: string) =>
    `min-h-11 w-full rounded-lg border px-3 ${error ? invalidFieldClassName : 'border-slate-300'}`

  return (
    <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
      <legend className="px-2 text-lg font-bold">申請人資料</legend>
      <label className="block space-y-1 font-semibold">
        姓名
        <input aria-describedby={errors.studentName ? 'studentName-error' : undefined} aria-invalid={Boolean(errors.studentName)} className={inputClass(errors.studentName)} data-field-path="studentName" maxLength={100} onChange={(event) => onChange('studentName', event.target.value)} value={value.studentName} />
        <FieldErrorMessage id="studentName-error" message={errors.studentName} />
      </label>
      <label className="block space-y-1 font-semibold">
        學號
        <input aria-describedby={errors.studentNumber ? 'studentNumber-error' : undefined} aria-invalid={Boolean(errors.studentNumber)} autoCapitalize="characters" className={inputClass(errors.studentNumber)} data-field-path="studentNumber" maxLength={50} onChange={(event) => onChange('studentNumber', event.target.value.toUpperCase())} value={value.studentNumber} />
        <FieldErrorMessage id="studentNumber-error" message={errors.studentNumber} />
      </label>
      <label className="block space-y-1 font-semibold">
        年級
        <select aria-describedby={errors.grade ? 'grade-error' : undefined} aria-invalid={Boolean(errors.grade)} className={inputClass(errors.grade)} data-field-path="grade" onChange={(event) => onChange('grade', Number(event.target.value))} value={value.grade}>
          {[1, 2, 3, 4, 5, 6].map((grade) => <option key={grade} value={grade}>{grade} 年級</option>)}
        </select>
        <FieldErrorMessage id="grade-error" message={errors.grade} />
      </label>
      <label className="block space-y-1 font-semibold">
        班級
        <select aria-describedby={errors.classNumber ? 'classNumber-error' : undefined} aria-invalid={Boolean(errors.classNumber)} className={inputClass(errors.classNumber)} data-field-path="classNumber" onChange={(event) => onChange('classNumber', Number(event.target.value))} value={value.classNumber}>
          {[1, 2, 3, 4, 5].map((classNumber) => <option key={classNumber} value={classNumber}>{classNumber} 班</option>)}
        </select>
        <FieldErrorMessage id="classNumber-error" message={errors.classNumber} />
      </label>
      <label className="block space-y-1 font-semibold">
        Email
        <input aria-describedby={errors.applicantEmail ? 'applicantEmail-error' : undefined} aria-invalid={Boolean(errors.applicantEmail)} className={inputClass(errors.applicantEmail)} data-field-path="applicantEmail" maxLength={320} onChange={(event) => onChange('applicantEmail', event.target.value)} type="email" value={value.applicantEmail} />
        <FieldErrorMessage id="applicantEmail-error" message={errors.applicantEmail} />
      </label>
      <label className="block space-y-1 font-semibold">
        電話
        <input aria-describedby={errors.applicantPhone ? 'applicantPhone-error' : undefined} aria-invalid={Boolean(errors.applicantPhone)} className={inputClass(errors.applicantPhone)} data-field-path="applicantPhone" maxLength={30} onChange={(event) => onChange('applicantPhone', event.target.value)} type="tel" value={value.applicantPhone} />
        <FieldErrorMessage id="applicantPhone-error" message={errors.applicantPhone} />
      </label>
    </fieldset>
  )
}
