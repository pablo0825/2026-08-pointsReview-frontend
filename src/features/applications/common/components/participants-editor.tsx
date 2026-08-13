export type ParticipantEditorValue = {
  clientKey: string
  studentName: string
  studentNumber: string
  grade: number
  classNumber: number
  requestedPoints: string
  isApplicant: boolean
}

type ParticipantsEditorProps = {
  participants: readonly ParticipantEditorValue[]
  academicYear: string
  pointsEditable: boolean
  maximumParticipants: number
  applicantEmail: string
  applicantPhone: string
  applicantSelectionError?: string
  errors?: Readonly<Record<string, string | undefined>>
  onChange: (participants: ParticipantEditorValue[]) => void
  onApplicantEmailChange: (email: string) => void
  onApplicantPhoneChange: (phone: string) => void
  onDirty: () => void
  onFieldChange?: (path: string) => void
}

const grades = [
  [1, '大一'],
  [2, '大二'],
  [3, '大三'],
  [4, '大四'],
  [5, '碩一'],
  [6, '碩二'],
] as const

const classes = [
  [1, '甲班'],
  [2, '乙班'],
  [3, '丙班'],
  [4, '丁班'],
  [5, '戊班'],
] as const

export function ParticipantsEditor({
  participants,
  academicYear,
  pointsEditable,
  maximumParticipants,
  applicantEmail,
  applicantPhone,
  applicantSelectionError,
  errors = {},
  onChange,
  onApplicantEmailChange,
  onApplicantPhoneChange,
  onDirty,
  onFieldChange,
}: ParticipantsEditorProps) {
  const hasApplicant = participants.some(({ isApplicant }) => isApplicant)

  function updateParticipant(
    index: number,
    patch: Partial<ParticipantEditorValue>,
  ) {
    onDirty()
    Object.keys(patch).forEach((key) =>
      onFieldChange?.(`participants.${index}.${key}`),
    )
    onChange(
      participants.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, ...patch } : participant,
      ),
    )
  }

  function selectApplicant(index: number) {
    if (participants[index].isApplicant) return
    if (
      hasApplicant &&
      !window.confirm('更換申請人後，Email 與電話需要重新輸入。確定更換嗎？')
    ) {
      return
    }
    onDirty()
    onFieldChange?.('participants.applicant')
    onChange(
      participants.map((participant, participantIndex) => ({
        ...participant,
        isApplicant: participantIndex === index,
      })),
    )
  }

  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-slate-100 p-3 font-semibold">
        學年度：{academicYear}（系統自動設定）
      </p>
      {applicantSelectionError ? (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">
          {applicantSelectionError}
        </p>
      ) : null}
      {errors.participants ? (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">
          {errors.participants}
        </p>
      ) : null}
      {participants.map((participant, index) => (
        <fieldset
          className="space-y-4 rounded-xl border border-slate-200 p-4"
          key={participant.clientKey}
        >
          <legend className="px-2 font-bold">參與者 {index + 1}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 font-semibold">
              姓名
              <input
                aria-label="姓名"
                aria-describedby={errors[`participants.${index}.studentName`] ? `participants-${index}-studentName-error` : undefined}
                aria-invalid={Boolean(errors[`participants.${index}.studentName`])}
                className={`min-h-11 w-full rounded-lg border px-3 ${errors[`participants.${index}.studentName`] ? invalidFieldClassName : 'border-slate-300'}`}
                data-field-path={`participants.${index}.studentName`}
                onChange={(event) =>
                  updateParticipant(index, { studentName: event.target.value })
                }
                value={participant.studentName}
              />
              <FieldErrorMessage id={`participants-${index}-studentName-error`} message={errors[`participants.${index}.studentName`]} />
            </label>
            <label className="space-y-1 font-semibold">
              學號
              <input
                aria-label="學號"
                autoCapitalize="characters"
                aria-describedby={errors[`participants.${index}.studentNumber`] ? `participants-${index}-studentNumber-error` : undefined}
                aria-invalid={Boolean(errors[`participants.${index}.studentNumber`])}
                className={`min-h-11 w-full rounded-lg border px-3 uppercase ${errors[`participants.${index}.studentNumber`] ? invalidFieldClassName : 'border-slate-300'}`}
                data-field-path={`participants.${index}.studentNumber`}
                onBlur={(event) =>
                  updateParticipant(index, {
                    studentNumber: event.target.value.trim().toUpperCase(),
                  })
                }
                onChange={(event) =>
                  updateParticipant(index, { studentNumber: event.target.value })
                }
                value={participant.studentNumber}
              />
              <FieldErrorMessage id={`participants-${index}-studentNumber-error`} message={errors[`participants.${index}.studentNumber`]} />
            </label>
            <label className="space-y-1 font-semibold">
              年級
              <select
                aria-label="年級"
                aria-describedby={errors[`participants.${index}.grade`] ? `participants-${index}-grade-error` : undefined}
                aria-invalid={Boolean(errors[`participants.${index}.grade`])}
                className={`min-h-11 w-full rounded-lg border px-3 ${errors[`participants.${index}.grade`] ? invalidFieldClassName : 'border-slate-300'}`}
                data-field-path={`participants.${index}.grade`}
                onChange={(event) =>
                  updateParticipant(index, { grade: Number(event.target.value) })
                }
                value={participant.grade}
              >
                {grades.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <FieldErrorMessage id={`participants-${index}-grade-error`} message={errors[`participants.${index}.grade`]} />
            </label>
            <label className="space-y-1 font-semibold">
              班級
              <select
                aria-label="班級"
                aria-describedby={errors[`participants.${index}.classNumber`] ? `participants-${index}-classNumber-error` : undefined}
                aria-invalid={Boolean(errors[`participants.${index}.classNumber`])}
                className={`min-h-11 w-full rounded-lg border px-3 ${errors[`participants.${index}.classNumber`] ? invalidFieldClassName : 'border-slate-300'}`}
                data-field-path={`participants.${index}.classNumber`}
                onChange={(event) =>
                  updateParticipant(index, {
                    classNumber: Number(event.target.value),
                  })
                }
                value={participant.classNumber}
              >
                {classes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <FieldErrorMessage id={`participants-${index}-classNumber-error`} message={errors[`participants.${index}.classNumber`]} />
            </label>
            <label className="space-y-1 font-semibold">
              申請點數
              <input
                aria-label="申請點數"
                aria-describedby={errors[`participants.${index}.requestedPoints`] ? `participants-${index}-requestedPoints-error` : undefined}
                aria-invalid={Boolean(errors[`participants.${index}.requestedPoints`])}
                className={`min-h-11 w-full rounded-lg border px-3 disabled:bg-slate-100 ${errors[`participants.${index}.requestedPoints`] ? invalidFieldClassName : 'border-slate-300'}`}
                data-field-path={`participants.${index}.requestedPoints`}
                disabled={!pointsEditable}
                inputMode="decimal"
                min="0.50"
                onChange={(event) =>
                  updateParticipant(index, { requestedPoints: event.target.value })
                }
                step="0.50"
                value={participant.requestedPoints}
              />
              <FieldErrorMessage id={`participants-${index}-requestedPoints-error`} message={errors[`participants.${index}.requestedPoints`]} />
            </label>
          </div>
          {participant.isApplicant ? (
            <section
              aria-labelledby={`applicant-contact-${participant.clientKey}`}
              className="space-y-4 rounded-xl bg-blue-50 p-4"
            >
              <h3 className="font-bold text-blue-950" id={`applicant-contact-${participant.clientKey}`}>
                申請人聯絡資料
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 font-semibold">
                  申請人 Email
                  <input
                    aria-label="申請人 Email"
                    aria-describedby={errors.applicantEmail ? 'applicantEmail-error' : undefined}
                    aria-invalid={Boolean(errors.applicantEmail)}
                    className={`min-h-11 w-full rounded-lg border px-3 ${errors.applicantEmail ? invalidFieldClassName : 'border-slate-300'}`}
                    data-field-path="applicantEmail"
                    onChange={(event) => {
                      onFieldChange?.('applicantEmail')
                      onApplicantEmailChange(event.target.value)
                    }}
                    type="email"
                    value={applicantEmail}
                  />
                  <FieldErrorMessage id="applicantEmail-error" message={errors.applicantEmail} />
                </label>
                <label className="space-y-1 font-semibold">
                  申請人電話
                  <input
                    aria-label="申請人電話"
                    aria-describedby={errors.applicantPhone ? 'applicantPhone-error' : undefined}
                    aria-invalid={Boolean(errors.applicantPhone)}
                    className={`min-h-11 w-full rounded-lg border px-3 ${errors.applicantPhone ? invalidFieldClassName : 'border-slate-300'}`}
                    data-field-path="applicantPhone"
                    onChange={(event) => {
                      onFieldChange?.('applicantPhone')
                      onApplicantPhoneChange(event.target.value)
                    }}
                    value={applicantPhone}
                  />
                  <FieldErrorMessage id="applicantPhone-error" message={errors.applicantPhone} />
                </label>
              </div>
            </section>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              aria-pressed={participant.isApplicant}
              className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800"
              data-field-path={participant.isApplicant ? undefined : 'participants.applicant'}
              onClick={() => selectApplicant(index)}
              type="button"
            >
              {participant.isApplicant ? '目前申請人' : '設為申請人'}
            </button>
            <button
              className="min-h-11 rounded-lg border border-red-300 px-4 py-2 font-bold text-red-800 disabled:text-slate-400"
              disabled={participants.length === 1 || participant.isApplicant}
              onClick={() => {
                onDirty()
                onFieldChange?.('participants.*')
                onChange(participants.filter((_, current) => current !== index))
              }}
              type="button"
            >
              移除參與者
            </button>
          </div>
        </fieldset>
      ))}
      <button
        className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800 disabled:border-slate-300 disabled:text-slate-400"
        disabled={participants.length >= maximumParticipants}
        onClick={() => {
          onDirty()
          onFieldChange?.('participants.*')
          onChange([
            ...participants,
            {
              clientKey: crypto.randomUUID(),
              studentName: '',
              studentNumber: '',
              grade: 1,
              classNumber: 1,
              requestedPoints: '0.50',
              isApplicant: false,
            },
          ])
        }}
        type="button"
      >
        新增參與者
      </button>
    </div>
  )
}
import { FieldErrorMessage, invalidFieldClassName } from './error-summary'
