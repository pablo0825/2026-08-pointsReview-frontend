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
  onChange: (participants: ParticipantEditorValue[]) => void
  onDirty: () => void
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
  onChange,
  onDirty,
}: ParticipantsEditorProps) {
  function updateParticipant(
    index: number,
    patch: Partial<ParticipantEditorValue>,
  ) {
    onDirty()
    onChange(
      participants.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, ...patch } : participant,
      ),
    )
  }

  function selectApplicant(index: number) {
    if (participants[index].isApplicant) return
    if (!window.confirm('更換申請人後，Email 與電話需要重新輸入。確定更換嗎？')) {
      return
    }
    onDirty()
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
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
                data-field-path={`participants.${index}.studentName`}
                onChange={(event) =>
                  updateParticipant(index, { studentName: event.target.value })
                }
                value={participant.studentName}
              />
            </label>
            <label className="space-y-1 font-semibold">
              學號
              <input
                autoCapitalize="characters"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 uppercase"
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
            </label>
            <label className="space-y-1 font-semibold">
              年級
              <select
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
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
            </label>
            <label className="space-y-1 font-semibold">
              班級
              <select
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
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
            </label>
            <label className="space-y-1 font-semibold">
              申請點數
              <input
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 disabled:bg-slate-100"
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
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              aria-pressed={participant.isApplicant}
              className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800"
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
