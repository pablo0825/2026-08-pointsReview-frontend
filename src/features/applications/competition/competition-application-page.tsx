import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type FieldErrors, type FieldPath } from 'react-hook-form'
import { useBlocker } from 'react-router-dom'

import { ApiClientError } from '../../../shared/api/api-client'
import { getTaipeiDateString } from '../../../shared/lib/academic-year'
import { AdvisorSelector } from '../common/components/advisor-selector'
import { ApplicationWizard } from '../common/components/application-wizard'
import {
  AttachmentEditor,
  type AttachmentEditorValue,
} from '../common/components/attachment-editor'
import { LeaveConfirmationDialog } from '../common/components/leave-confirmation-dialog'
import {
  ParticipantsEditor,
  type ParticipantEditorValue,
} from '../common/components/participants-editor'
import { isPointsIncrement, parsePoints } from '../common/lib/points'
import {
  fetchCompetitionPointOptions,
  fetchPublicAdvisors,
  competitionPointOptionsQueryKey,
  publicAdvisorsQueryKey,
} from './api/competition-application.query'
import {
  createCompetitionSubmissionSnapshot,
  submitCompetitionApplication,
  type CompetitionSubmissionSnapshot,
} from './api/competition-application.submit'
import { CompetitionConfirmationStep } from './components/competition-confirmation-step'
import { CompetitionDetailsStep } from './components/competition-details-step'
import {
  CompetitionSuccessPage,
  CompetitionUncertainState,
} from './components/competition-submission-state'
import {
  mapCompetitionApplicationPayload,
  normalizeApiFieldErrors,
} from './model/competition-application.mapper'
import {
  createCompetitionApplicationFormSchema,
  createDefaultCompetitionApplicationForm,
  type CompetitionApplicationForm,
} from './model/competition-application.schema'
import {
  buildPointOptionLookup,
  getCompetitionParticipantLimit,
  getSharedAllocation,
  pointOptionKey,
  resetParticipantPoints,
} from './model/competition-points'

const steps = [
  { label: '競賽內容' },
  { label: '參與者資料' },
  { label: '指導老師' },
  { label: '附件' },
  { label: '確認送出' },
] as const

type DisplayError = { path: string; message: string }
type FormErrorPath = FieldPath<CompetitionApplicationForm> | `root.${string}`

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9+()\- ]+$/

function focusField(path: string) {
  const exact = document.querySelector<HTMLElement>(
    `[data-field-path="${path}"]`,
  )
  const group = document.querySelector<HTMLElement>(
    `[data-field-path^="${path}."]`,
  )
  ;(exact ?? group ?? document.getElementById('wizard-heading'))?.focus()
}

function errorPath(path: string): FormErrorPath {
  if (path === 'participants.applicant') return 'root.applicantSelection'
  if (path === 'participants') return 'root.participants'
  if (path === 'attachments') return 'root.attachments'
  if (path === 'typeDetails') return 'root.typeDetails'
  if (path === 'form' || path === 'payload') return 'root.form'
  if (path === 'applicant.email') return 'applicantEmail'
  if (path === 'applicant.phone') return 'applicantPhone'
  if (path.startsWith('typeDetails.')) {
    return path.slice('typeDetails.'.length) as FieldPath<CompetitionApplicationForm>
  }
  return path as FieldPath<CompetitionApplicationForm>
}

function displayPath(path: FormErrorPath) {
  if (path === 'root.applicantSelection') return 'participants.applicant'
  if (path.startsWith('root.')) return path.slice('root.'.length)
  return path
}

function collectErrorMessages(
  errors: FieldErrors<CompetitionApplicationForm>,
) {
  const messages: Record<string, string> = {}
  function visit(value: unknown, path: string) {
    if (!value || typeof value !== 'object') return
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') {
      messages[displayPath(path as FormErrorPath)] = record.message
      return
    }
    Object.entries(record).forEach(([key, child]) =>
      visit(child, path ? `${path}.${key}` : key),
    )
  }
  visit(errors, '')
  return messages
}

function QueryState({
  title,
  empty,
  retry,
}: {
  title: string
  empty?: boolean
  retry: () => void
}) {
  return (
    <section
      className="rounded-2xl border border-red-200 bg-red-50 p-6"
      role={empty ? 'status' : 'alert'}
    >
      <h1 className="text-xl font-bold text-red-950">{title}</h1>
      <button
        className="mt-4 min-h-11 rounded-lg bg-red-900 px-4 py-2 font-bold text-white"
        onClick={retry}
        type="button"
      >
        重新載入
      </button>
    </section>
  )
}

export function CompetitionApplicationPage() {
  const form = useForm<CompetitionApplicationForm>({
    defaultValues: createDefaultCompetitionApplicationForm(),
  })
  const value = useWatch({ control: form.control }) as CompetitionApplicationForm
  const [currentStep, setCurrentStep] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<CompetitionSubmissionSnapshot | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitCompetitionApplication>>['data'] | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState(0)
  const [clock, setClock] = useState(0)

  const rulesQuery = useQuery({
    queryKey: competitionPointOptionsQueryKey,
    queryFn: () => fetchCompetitionPointOptions(),
    staleTime: Infinity,
    refetchOnMount: false,
  })
  const advisorsQuery = useQuery({
    enabled: currentStep >= 2,
    queryKey: publicAdvisorsQueryKey,
    queryFn: () => fetchPublicAdvisors(),
    staleTime: Infinity,
    refetchOnMount: false,
  })
  const submission = useMutation({
    mutationFn: (activeSnapshot: CompetitionSubmissionSnapshot) =>
      submitCompetitionApplication(activeSnapshot),
  })

  const optionLookup = useMemo(
    () => buildPointOptionLookup(rulesQuery.data ?? []),
    [rulesQuery.data],
  )
  const selectedOption =
    value.competitionLevel && value.award
      ? optionLookup.get(
          pointOptionKey({
            competitionLevel: value.competitionLevel,
            award: value.award,
          }),
        ) ?? null
      : null
  const selectedAdvisor =
    (advisorsQuery.data ?? []).find(({ id }) => id === value.advisorId) ?? null
  const participantLimit = selectedOption
    ? getCompetitionParticipantLimit(selectedOption)
    : 10
  const sharedAllocation =
    selectedOption?.allocationMethod === 'shared_total'
      ? getSharedAllocation(
          value.participants.map(({ requestedPoints }) => requestedPoints),
          selectedOption,
        )
      : null
  const isRateLimited = rateLimitUntil > clock
  const rateLimitSeconds = isRateLimited
    ? Math.max(1, Math.ceil((rateLimitUntil - clock) / 1000))
    : 0
  const blocker = useBlocker(dirty && !result)
  const fieldErrors = collectErrorMessages(form.formState.errors)

  useEffect(() => {
    if (!dirty || result) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, result])

  useEffect(() => {
    if (!isRateLimited) return
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isRateLimited])

  useEffect(() => {
    if (
      value.advisorId !== null &&
      advisorsQuery.isSuccess &&
      !advisorsQuery.data.some(({ id }) => id === value.advisorId)
    ) {
      form.setValue('advisorId', null)
    }
  }, [advisorsQuery.data, advisorsQuery.isSuccess, form, value.advisorId])

  function updateValue<K extends keyof CompetitionApplicationForm>(
    key: K,
    next: CompetitionApplicationForm[K],
    clearError = true,
  ) {
    setDirty(true)
    setSnapshot(null)
    setUncertain(false)
    form.setValue(key, next as never, { shouldDirty: true })
    if (clearError) {
      form.clearErrors(key as FieldPath<CompetitionApplicationForm>)
    }
  }

  function setStep(step: number) {
    form.clearErrors()
    setMessage(null)
    setCurrentStep(step)
    requestAnimationFrame(() => document.getElementById('wizard-heading')?.focus())
  }

  function validateStep(step: number) {
    const nextErrors: DisplayError[] = []
    form.clearErrors()
    if (step === 0) {
      if (!value.competitionLevel) nextErrors.push({ path: 'competitionLevel', message: '請選擇競賽等級' })
      else if (!selectedOption) nextErrors.push({ path: 'award', message: '請選擇目前有效的獎項' })
      if (value.competitionLevel === 'other' && !value.competitionLevelOther?.trim()) nextErrors.push({ path: 'competitionLevelOther', message: '請輸入其他競賽等級' })
      if (!value.competitionName.trim()) nextErrors.push({ path: 'competitionName', message: '請輸入競賽名稱' })
      if (!value.competitionCategory.trim()) nextErrors.push({ path: 'competitionCategory', message: '請輸入競賽類別' })
      if (!value.competitionDate) nextErrors.push({ path: 'competitionDate', message: '請選擇競賽日期' })
      else if (value.competitionDate > getTaipeiDateString()) nextErrors.push({ path: 'competitionDate', message: '競賽日期不得晚於今天' })
    }
    if (step === 1) {
      const applicant = value.participants.find(({ isApplicant }) => isApplicant)
      if (!applicant) {
        nextErrors.push({
          path: 'participants.applicant',
          message: '請先選擇一位參與者作為申請人。',
        })
      }
      if (value.participants.length < 1 || value.participants.length > participantLimit) {
        nextErrors.push({ path: 'participants', message: `參與者人數須為 1 至 ${participantLimit} 人` })
      }
      const seen = new Set<string>()
      value.participants.forEach((participant, index) => {
        if (!participant.studentName.trim()) nextErrors.push({ path: `participants.${index}.studentName`, message: `請輸入參與者 ${index + 1} 姓名` })
        else if (participant.studentName.trim().length > 100) nextErrors.push({ path: `participants.${index}.studentName`, message: `參與者 ${index + 1} 姓名不可超過 100 字` })
        const studentNumber = participant.studentNumber.trim().toUpperCase()
        if (!studentNumber) nextErrors.push({ path: `participants.${index}.studentNumber`, message: `請輸入參與者 ${index + 1} 學號` })
        else if (studentNumber.length > 50) nextErrors.push({ path: `participants.${index}.studentNumber`, message: `參與者 ${index + 1} 學號不可超過 50 字` })
        else if (seen.has(studentNumber)) nextErrors.push({ path: `participants.${index}.studentNumber`, message: '學號不可重複' })
        seen.add(studentNumber)
      })
      if (applicant) {
        const email = value.applicantEmail.trim()
        const phone = value.applicantPhone.trim()
        if (!email) nextErrors.push({ path: 'applicantEmail', message: '請輸入申請人 Email' })
        else if (email.length > 320 || !emailPattern.test(email)) nextErrors.push({ path: 'applicantEmail', message: '請輸入有效的 Email' })
        if (!phone) nextErrors.push({ path: 'applicantPhone', message: '請輸入申請人電話' })
        else if (phone.length > 30 || !phonePattern.test(phone)) nextErrors.push({ path: 'applicantPhone', message: '電話格式不正確' })
      }
      if (selectedOption?.allocationMethod === 'shared_total') {
        const minimum = parsePoints(selectedOption.minimumPointsPerParticipant) ?? 50
        value.participants.forEach((participant, index) => {
          const points = parsePoints(participant.requestedPoints)
          if (points === null || points < minimum || !isPointsIncrement(participant.requestedPoints, selectedOption.pointIncrement)) {
            nextErrors.push({ path: `participants.${index}.requestedPoints`, message: `參與者 ${index + 1} 點數須至少 ${selectedOption.minimumPointsPerParticipant}，且為 ${selectedOption.pointIncrement} 的倍數` })
          }
        })
        if (!getSharedAllocation(value.participants.map(({ requestedPoints }) => requestedPoints), selectedOption).isBalanced) nextErrors.push({ path: 'participants', message: `參與者點數總和必須等於 ${selectedOption.points}` })
      }
    }
    if (step === 2 && value.advisorId === null) nextErrors.push({ path: 'advisorId', message: '請選擇指導老師' })
    if (step === 3) {
      if (!value.attachments.some(({ attachmentType }) => ['participation_proof', 'finalist_or_award_certificate'].includes(attachmentType))) nextErrors.push({ path: 'attachments', message: '請上傳參賽證明或入圍／獎狀' })
      value.attachments.forEach((attachment, index) => {
        if (attachment.attachmentType === 'other' && !attachment.attachmentTypeOther?.trim()) nextErrors.push({ path: `attachments.${index}.attachmentTypeOther`, message: `請輸入附件 ${index + 1} 的其他類型` })
      })
    }
    nextErrors.forEach(({ path, message }) =>
      form.setError(errorPath(path), { type: 'validate', message }),
    )
    if (nextErrors[0]) requestAnimationFrame(() => focusField(nextErrors[0].path))
    return nextErrors.length === 0
  }

  async function reloadRulesAfterInvalidation() {
    const refreshed = await rulesQuery.refetch()
    if (!refreshed.data) return
    const lookup = buildPointOptionLookup(refreshed.data)
    const option =
      value.competitionLevel && value.award
        ? lookup.get(
            pointOptionKey({
              competitionLevel: value.competitionLevel,
              award: value.award,
            }),
          )
        : null
    if (option) {
      updateValue('participants', resetParticipantPoints(value.participants, option))
    } else {
      updateValue('competitionLevel', null)
      updateValue('competitionLevelOther', null)
      updateValue('award', null)
      updateValue(
        'participants',
        value.participants.map((participant) => ({
          ...participant,
          requestedPoints: '0.00',
        })),
      )
    }
    setMessage(null)
  }

  function next() {
    if (!validateStep(currentStep)) return
    setStep(Math.min(currentStep + 1, 4))
  }

  function updateParticipants(participants: ParticipantEditorValue[]) {
    const oldApplicant = value.participants.find(({ isApplicant }) => isApplicant)?.clientKey
    const newApplicant = participants.find(({ isApplicant }) => isApplicant)?.clientKey
    let normalized = participants
    if (selectedOption?.allocationMethod === 'per_person') {
      normalized = resetParticipantPoints(participants, selectedOption)
    }
    updateValue('participants', normalized, false)
    if (oldApplicant !== newApplicant) {
      form.setValue('applicantEmail', '')
      form.setValue('applicantPhone', '')
    }
    if (newApplicant) {
      form.clearErrors('root.applicantSelection')
    }
  }

  function updateCompetition(patch: Partial<CompetitionApplicationForm>) {
    const next = { ...value, ...patch }
    Object.entries(patch).forEach(([key, nextValue]) =>
      updateValue(
        key as keyof CompetitionApplicationForm,
        nextValue as never,
      ),
    )
    if ('competitionLevel' in patch || 'award' in patch) {
      form.clearErrors('root.typeDetails')
      const option =
        next.competitionLevel && next.award
          ? optionLookup.get(pointOptionKey({ competitionLevel: next.competitionLevel, award: next.award }))
          : null
      updateValue(
        'participants',
        option
          ? resetParticipantPoints(value.participants, option)
          : value.participants.map((participant) => ({ ...participant, requestedPoints: '0.00' })),
      )
    }
  }

  function handleApiError(error: unknown) {
    if (!(error instanceof ApiClientError)) {
      setUncertain(true)
      return
    }
    if (error.status === null || error.status >= 500) {
      setUncertain(true)
      return
    }
    setSnapshot(null)
    if (error.status === 409 && error.apiCode === 'idempotency_key_conflict') {
      setStep(4)
      setMessage(error.message || '送件識別已用於不同資料，請確認後重新送出。')
      return
    }
    if (error.status === 429) {
      if (error.retryAfterSeconds) {
        const now = Date.now()
        setClock(now)
        setRateLimitUntil(now + error.retryAfterSeconds * 1000)
      }
      setStep(4)
      setMessage(error.message || '嘗試次數過多，請稍後再試。')
      return
    }
    if (error.status === 422 && error.fields.length > 0) {
      const normalized = normalizeApiFieldErrors(error.fields)
      const ruleInvalid = normalized.some(({ path }) => path.startsWith('typeDetails'))
      const participantInvalid = normalized.some(({ path }) =>
        path === 'participants' ||
        path.startsWith('participants.') ||
        path.startsWith('applicant.'),
      )
      setStep(ruleInvalid ? 0 : participantInvalid ? 1 : normalized.some(({ path }) => path.startsWith('attachments')) ? 3 : normalized.some(({ path }) => path === 'advisorId') ? 2 : 0)
      normalized.forEach(({ path, message }) =>
        form.setError(errorPath(path), { type: 'server', message }),
      )
      if (ruleInvalid) setMessage('競賽規則可能已更新，請重新載入後確認點數。')
      if (normalized[0]) requestAnimationFrame(() => focusField(normalized[0].path))
      return
    }
    if (
      error.status === 400 &&
      ['file_too_large', 'too_many_files', 'file_type_not_allowed'].includes(
        error.apiCode ?? '',
      )
    ) {
      const attachmentMessages: Record<string, string> = {
        file_too_large: '每個附件不得超過 5 MB。',
        too_many_files: '每份申請最多 10 個附件。',
        file_type_not_allowed: '只接受 PDF、JPEG 或 PNG 檔案。',
      }
      setStep(3)
      setMessage(attachmentMessages[error.apiCode ?? ''])
      return
    }
    setStep(4)
    setMessage(error.message || '送件資料無法處理，請返回表單確認後再試。')
  }

  async function send(activeSnapshot: CompetitionSubmissionSnapshot) {
    setMessage(null)
    setUncertain(false)
    try {
      const response = await submission.mutateAsync(activeSnapshot)
      setResult(response.data)
      setSnapshot(null)
      setDirty(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  async function submit() {
    if (isRateLimited) return
    const parsed = createCompetitionApplicationFormSchema().safeParse(value)
    if (!parsed.success || !selectedOption || !selectedAdvisor) {
      const validationErrors = parsed.success
        ? [{ path: 'form', message: '請確認所有步驟資料' }]
        : parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }))
      validationErrors.forEach(({ path, message: validationMessage }) =>
        form.setError(errorPath(path), {
          type: 'validate',
          message: validationMessage,
        }),
      )
      if (validationErrors[0]) {
        requestAnimationFrame(() => focusField(validationErrors[0].path))
      }
      return
    }
    const nextSnapshot = createCompetitionSubmissionSnapshot(
      mapCompetitionApplicationPayload(value),
      value.attachments.map(({ clientFileKey, file }) => ({ clientFileKey, file })),
    )
    setSnapshot(nextSnapshot)
    await send(nextSnapshot)
  }

  if (result) return <CompetitionSuccessPage result={result} />

  if (rulesQuery.isPending) return <p role="status">正在載入競賽點數規則…</p>
  if (rulesQuery.isError) return <QueryState retry={() => void rulesQuery.refetch()} title="暫時無法載入競賽點數規則" />
  if (rulesQuery.data.length === 0) return <QueryState empty retry={() => void rulesQuery.refetch()} title="目前沒有可申請的競賽點數規則" />

  return (
    <>
      <ApplicationWizard
        currentStep={currentStep}
        nextDisabled={submission.isPending || (currentStep === 4 && isRateLimited)}
        nextLabel={currentStep === 4 ? (submission.isPending ? '送件中…' : '確認送出申請') : '下一步'}
        onBack={currentStep > 0 ? () => setStep(currentStep - 1) : undefined}
        onNext={currentStep === 4 ? () => void submit() : next}
        steps={steps}
      >
        <div className="space-y-5">
          {message ? <p className="rounded-lg bg-amber-50 p-3 text-amber-950" role="alert">{message}</p> : null}
          {fieldErrors.form ? (
            <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">
              {fieldErrors.form}
            </p>
          ) : null}
          {uncertain && snapshot ? (
            <CompetitionUncertainState
              onEdit={() => { setSnapshot(null); setUncertain(false); setStep(4) }}
              onRetry={() => void send(snapshot)}
              pending={submission.isPending}
            />
          ) : currentStep === 0 ? (
            <div className="space-y-5">
              {message?.includes('重新載入') ? <button className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800" onClick={() => void reloadRulesAfterInvalidation()} type="button">重新載入規則</button> : null}
              {fieldErrors.typeDetails ? (
                <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">
                  {fieldErrors.typeDetails}
                </p>
              ) : null}
              <CompetitionDetailsStep errors={fieldErrors} onChange={updateCompetition} options={rulesQuery.data} selectedOption={selectedOption} value={value} />
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-6">
              <ParticipantsEditor
                academicYear={value.academicYear}
                applicantEmail={value.applicantEmail}
                applicantPhone={value.applicantPhone}
                applicantSelectionError={fieldErrors['participants.applicant']}
                errors={fieldErrors}
                maximumParticipants={participantLimit}
                onApplicantEmailChange={(email) => updateValue('applicantEmail', email)}
                onApplicantPhoneChange={(phone) => updateValue('applicantPhone', phone)}
                onChange={updateParticipants}
                onDirty={() => setDirty(true)}
                onFieldChange={(path) => {
                  if (path === 'participants.*') {
                    form.clearErrors('participants')
                    form.clearErrors('root.participants')
                    return
                  }
                  form.clearErrors(errorPath(path))
                }}
                participants={value.participants as ParticipantEditorValue[]}
                pointsEditable={selectedOption?.allocationMethod === 'shared_total'}
              />
              {sharedAllocation ? (
                <p className="rounded-lg bg-blue-50 p-4 font-semibold text-blue-950" aria-live="polite">
                  已分配 {sharedAllocation.allocated ?? '—'} 點；剩餘{' '}
                  {sharedAllocation.remaining ?? '—'} 點。
                </p>
              ) : null}
            </div>
          ) : currentStep === 2 ? (
            advisorsQuery.isPending ? <p role="status">正在載入指導老師名單…</p> : advisorsQuery.isError ? <QueryState retry={() => void advisorsQuery.refetch()} title="暫時無法載入指導老師名單" /> : advisorsQuery.data.length === 0 ? <QueryState empty retry={() => void advisorsQuery.refetch()} title="目前沒有可選擇的指導老師" /> : <AdvisorSelector advisors={advisorsQuery.data} error={fieldErrors.advisorId} onSelect={(id) => updateValue('advisorId', id)} selectedId={value.advisorId} />
          ) : currentStep === 3 ? (
            <AttachmentEditor attachments={value.attachments as AttachmentEditorValue[]} errors={fieldErrors} onChange={(attachments) => updateValue('attachments', attachments, false)} onError={setMessage} onFieldChange={(path) => {
              if (path === 'attachments.*') {
                form.clearErrors('attachments')
                form.clearErrors('root.attachments')
                return
              }
              form.clearErrors(errorPath(path))
            }} />
          ) : selectedAdvisor && selectedOption ? (
            <div className="space-y-6">
              <CompetitionConfirmationStep advisor={selectedAdvisor} allocationLabel={selectedOption.allocationMethod === 'per_person' ? '每人固定點數' : '團隊總點數分配'} onEdit={setStep} value={value} />
              <p className="rounded-lg bg-blue-50 p-4 font-semibold text-blue-950">資料與附件送出後，將交由所選指導老師簽核。</p>
              {isRateLimited ? <p className="font-semibold text-amber-900" role="status">請等待 {rateLimitSeconds} 秒後再試。</p> : null}
            </div>
          ) : null}
        </div>
      </ApplicationWizard>
      <LeaveConfirmationDialog open={blocker.state === 'blocked'} onLeave={() => blocker.proceed?.()} onStay={() => blocker.reset?.()} />
    </>
  )
}
