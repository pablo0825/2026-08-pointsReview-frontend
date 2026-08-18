import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type FieldErrors, type FieldPath } from 'react-hook-form'
import { useBlocker } from 'react-router-dom'

import { ApiClientError } from '../../../shared/api/api-client'
import { fetchPublicAdvisors, publicAdvisorsQueryKey } from '../common/api/public-advisors.query'
import { AdvisorSelector } from '../common/components/advisor-selector'
import { ApplicationWizard } from '../common/components/application-wizard'
import { ApplicationSuccessPage, ApplicationUncertainState } from '../common/components/application-submission-state'
import { AttachmentEditor, type AttachmentEditorValue } from '../common/components/attachment-editor'
import { LeaveConfirmationDialog } from '../common/components/leave-confirmation-dialog'
import { ParticipantsEditor, type ParticipantEditorValue } from '../common/components/participants-editor'
import { fetchExhibitionPointOptions, exhibitionPointOptionsQueryKey } from './api/exhibition-application.query'
import type { ExhibitionAttachmentType, ExhibitionType } from './api/exhibition-application.schema'
import { createExhibitionSubmissionSnapshot, submitExhibitionApplication, type ExhibitionSubmissionSnapshot } from './api/exhibition-application.submit'
import { ExhibitionConfirmationStep } from './components/exhibition-confirmation-step'
import { ExhibitionDetailsStep } from './components/exhibition-details-step'
import { exhibitionAttachmentTypes } from './components/exhibition-options'
import { ExhibitionParticipantPoints } from './components/exhibition-participant-points'
import { mapExhibitionApplicationPayload, normalizeExhibitionApiFieldErrors } from './model/exhibition-application.mapper'
import { createDefaultExhibitionApplicationForm, createExhibitionApplicationFormSchema, type ExhibitionApplicationForm } from './model/exhibition-application.schema'
import { buildExhibitionPointOptionLookup, clearExhibitionParticipantPoints, isAllowedExhibitionPoint } from './model/exhibition-points'

const steps = [
  { label: '參與者資料' },
  { label: '展覽內容與點數' },
  { label: '指導老師' },
  { label: '附件' },
  { label: '確認送出' },
] as const

const stepFields: Record<number, FieldPath<ExhibitionApplicationForm>[]> = {
  0: ['participants', 'applicantEmail', 'applicantPhone'],
  1: ['exhibitionType', 'workName', 'exhibitionName', 'exhibitionNameOther', 'organizer', 'venue', 'startDate', 'endDate'],
  2: ['advisorId'],
  3: ['attachments'],
  4: [],
}

type FormErrorPath = FieldPath<ExhibitionApplicationForm> | `root.${string}`
type DisplayError = { path: string; message: string }

function formErrorPath(path: string): FormErrorPath {
  if (path === 'participants.applicant') return path as FormErrorPath
  if (path === 'participants') return 'root.participants'
  if (path === 'attachments') return 'root.attachments'
  if (path === 'form' || path === 'payload') return 'root.form'
  if (path === 'applicant.email') return 'applicantEmail'
  if (path === 'applicant.phone') return 'applicantPhone'
  if (path.startsWith('typeDetails.')) return formErrorPath(path.slice('typeDetails.'.length))
  const directFields = new Set([
    'applicantEmail', 'applicantPhone',
    'exhibitionType', 'workName', 'exhibitionName', 'exhibitionNameOther',
    'organizer', 'venue', 'startDate', 'endDate', 'advisorId',
  ])
  if (directFields.has(path)) return path as FieldPath<ExhibitionApplicationForm>
  if (/^participants\.\d+\.(studentName|studentNumber|grade|classNumber|requestedPoints)$/.test(path)) return path as FieldPath<ExhibitionApplicationForm>
  if (/^attachments\.\d+\.(attachmentType|attachmentTypeOther|description)$/.test(path)) return path as FieldPath<ExhibitionApplicationForm>
  return 'root.form'
}

function resolveApiErrorPath(path: string, value: ExhibitionApplicationForm) {
  if (path === 'applicant.name') {
    const applicantIndex = value.participants.findIndex(({ isApplicant }) => isApplicant)
    return applicantIndex >= 0 ? `participants.${applicantIndex}.studentName` : 'participants'
  }
  const attachmentPath = /^attachments\.([^.]+)(?:\.(.+))?$/.exec(path)
  if (attachmentPath && !/^\d+$/.test(attachmentPath[1])) {
    const attachmentIndex = value.attachments.findIndex(({ clientFileKey }) => clientFileKey === attachmentPath[1])
    return attachmentIndex >= 0
      ? `attachments.${attachmentIndex}${attachmentPath[2] ? `.${attachmentPath[2]}` : ''}`
      : 'form'
  }
  const participantPath = /^participants\.(\d+)\./.exec(path)
  if (participantPath && Number(participantPath[1]) >= value.participants.length) return 'form'
  if (/^participants\.\d+\.isApplicant$/.test(path)) return 'participants.applicant'
  const numericAttachmentPath = /^attachments\.(\d+)\./.exec(path)
  if (numericAttachmentPath && Number(numericAttachmentPath[1]) >= value.attachments.length) return 'form'
  return path
}

function displayPath(path: string) {
  return path.startsWith('root.') ? path.slice('root.'.length) : path
}

function collectErrorMessages(errors: FieldErrors<ExhibitionApplicationForm>) {
  const messages: Record<string, string> = {}
  function visit(value: unknown, path: string) {
    if (!value || typeof value !== 'object') return
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') {
      messages[displayPath(path)] = record.message
      return
    }
    Object.entries(record).forEach(([key, child]) => visit(child, path ? `${path}.${key}` : key))
  }
  visit(errors, '')
  return messages
}

function stepForPath(path: string) {
  if (path.match(/^participants\.\d+\.requestedPoints$/) || path.startsWith('typeDetails.') || ['exhibitionType', 'workName', 'exhibitionName', 'exhibitionNameOther', 'organizer', 'venue', 'startDate', 'endDate'].includes(path)) return 1
  if (path === 'participants' || path.startsWith('participants.') || path.startsWith('applicant.')) return 0
  if (path === 'advisorId') return 2
  if (path === 'attachments' || path.startsWith('attachments.')) return 3
  return 4
}

function focusError(path?: string) {
  requestAnimationFrame(() => {
    const target = path
      ? document.querySelector<HTMLElement>(`[data-field-path="${path}"]`)
      : document.querySelector<HTMLElement>('[aria-invalid="true"]')
    ;(target ?? document.getElementById('wizard-heading'))?.focus()
  })
}

function QueryState({ title, empty, retry }: { title: string; empty?: boolean; retry: () => void }) {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6" role={empty ? 'status' : 'alert'}>
      <h1 className="text-xl font-bold text-red-950">{title}</h1>
      <button className="mt-4 min-h-11 rounded-lg bg-red-900 px-4 py-2 font-bold text-white" onClick={retry} type="button">重新載入</button>
    </section>
  )
}

export function ExhibitionApplicationPage() {
  const formSchema = useMemo(() => createExhibitionApplicationFormSchema(), [])
  const form = useForm<ExhibitionApplicationForm>({
    defaultValues: createDefaultExhibitionApplicationForm(),
    resolver: zodResolver(formSchema),
  })
  const value = useWatch({ control: form.control }) as ExhibitionApplicationForm
  const [currentStep, setCurrentStep] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({})
  const [mustReloadRules, setMustReloadRules] = useState(false)
  const [snapshot, setSnapshot] = useState<ExhibitionSubmissionSnapshot | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitExhibitionApplication>>['data'] | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState(0)
  const [clock, setClock] = useState(0)

  const rulesQuery = useQuery({
    queryKey: exhibitionPointOptionsQueryKey,
    queryFn: () => fetchExhibitionPointOptions(),
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
    mutationFn: (activeSnapshot: ExhibitionSubmissionSnapshot) =>
      submitExhibitionApplication(activeSnapshot),
  })
  const optionLookup = useMemo(() => buildExhibitionPointOptionLookup(rulesQuery.data ?? []), [rulesQuery.data])
  const allowedPoints = value.exhibitionType ? optionLookup.get(value.exhibitionType) ?? [] : []
  const selectedAdvisor = (advisorsQuery.data ?? []).find(({ id }) => id === value.advisorId) ?? null
  const blocker = useBlocker(dirty && !result)
  const fieldErrors = { ...collectErrorMessages(form.formState.errors), ...apiFieldErrors }
  const isRateLimited = rateLimitUntil > clock
  const rateLimitSeconds = isRateLimited ? Math.max(1, Math.ceil((rateLimitUntil - clock) / 1000)) : 0

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
    if (value.advisorId !== null && advisorsQuery.isSuccess && !advisorsQuery.data.some(({ id }) => id === value.advisorId)) form.setValue('advisorId', null)
  }, [advisorsQuery.data, advisorsQuery.isSuccess, form, value.advisorId])

  function markChanged() {
    setDirty(true)
    setSnapshot(null)
    setUncertain(false)
    setApiFieldErrors((current) => {
      if (!current.form) return current
      const next = { ...current }
      delete next.form
      return next
    })
  }

  function clearApiErrors(path: string) {
    setApiFieldErrors((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== path && !key.startsWith(`${path}.`)),
      )
      return Object.keys(next).length === Object.keys(current).length ? current : next
    })
  }

  function setField<K extends keyof ExhibitionApplicationForm>(key: K, next: ExhibitionApplicationForm[K]) {
    markChanged()
    form.setValue(key, next as never, { shouldDirty: true })
    form.clearErrors(key as FieldPath<ExhibitionApplicationForm>)
    clearApiErrors(key)
  }

  function setStep(step: number, clearErrors = true) {
    if (clearErrors) form.clearErrors()
    setMessage(null)
    setCurrentStep(step)
    requestAnimationFrame(() => document.getElementById('wizard-heading')?.focus())
  }

  function updateParticipants(participants: ParticipantEditorValue[]) {
    const oldApplicant = value.participants.find(({ isApplicant }) => isApplicant)?.clientKey
    const newApplicant = participants.find(({ isApplicant }) => isApplicant)?.clientKey
    setField('participants', participants)
    if (oldApplicant !== newApplicant) {
      form.setValue('applicantEmail', '')
      form.setValue('applicantPhone', '')
    }
  }

  function changeType(nextType: ExhibitionType) {
    if (nextType === value.exhibitionType) return
    if (value.participants.some(({ requestedPoints }) => requestedPoints) && !window.confirm('更換展覽類型後，所有參與者點數都需要重新選擇。確定更換嗎？')) return
    markChanged()
    form.setValue('exhibitionType', nextType, { shouldDirty: true })
    form.setValue('participants', clearExhibitionParticipantPoints(value.participants), { shouldDirty: true })
    form.clearErrors('exhibitionType')
    form.clearErrors('participants')
    clearApiErrors('exhibitionType')
    clearApiErrors('participants')
  }

  function pointErrors() {
    if (!value.exhibitionType) return []
    return value.participants.flatMap((participant, index) =>
      isAllowedExhibitionPoint(optionLookup, value.exhibitionType as ExhibitionType, participant.requestedPoints)
        ? []
        : [{ path: `participants.${index}.requestedPoints`, message: `請為參與者 ${index + 1} 選擇目前允許的點數` }],
    )
  }

  function applyErrors(errors: readonly DisplayError[]) {
    errors.forEach(({ path, message: errorMessage }) => form.setError(formErrorPath(path), { type: 'validate', message: errorMessage }))
  }

  async function next() {
    form.clearErrors(stepFields[currentStep])
    const schemaValid = await form.trigger(stepFields[currentStep])
    const domainErrors = currentStep === 1 ? pointErrors() : []
    applyErrors(domainErrors)
    if (!schemaValid || domainErrors.length > 0) {
      focusError(domainErrors[0]?.path)
      return
    }
    if (currentStep === 2 && !selectedAdvisor) {
      form.setError('advisorId', { type: 'validate', message: '選擇的指導老師目前無效' })
      focusError('advisorId')
      return
    }
    setStep(Math.min(currentStep + 1, 4))
  }

  async function reloadRules() {
    const refreshed = await rulesQuery.refetch()
    if (refreshed.isSuccess && refreshed.data) {
      setField('participants', clearExhibitionParticipantPoints(value.participants))
      if (value.exhibitionType && !refreshed.data.some(({ exhibitionType }) => exhibitionType === value.exhibitionType)) setField('exhibitionType', null)
      setMustReloadRules(false)
      setMessage(null)
    } else {
      setMessage('仍無法載入最新展覽點數規則，請稍後再試。')
    }
  }

  function handleApiError(error: unknown) {
    if (!(error instanceof ApiClientError) || error.status === null || error.status >= 500) {
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
      const normalized = normalizeExhibitionApiFieldErrors(error.fields).map(({ path, message: errorMessage }) => ({
        originalPath: path,
        path: resolveApiErrorPath(path, value),
        message: errorMessage,
      }))
      const firstStep = Math.min(...normalized.map(({ path }) => stepForPath(path)))
      const firstPath = normalized.find(({ path }) => stepForPath(path) === firstStep)?.path ?? 'form'
      setStep(firstStep, false)
      setApiFieldErrors(Object.fromEntries(normalized.map(({ path, message: errorMessage }) => [displayPath(formErrorPath(path)), errorMessage])))
      normalized.forEach(({ path, message: errorMessage }) => form.setError(formErrorPath(path), { type: 'server', message: errorMessage }))
      if (normalized.some(({ originalPath }) => originalPath === 'typeDetails.exhibitionType' || originalPath.endsWith('.requestedPoints'))) {
        setMustReloadRules(true)
        setMessage('展覽點數規則可能已更新，請重新載入並重選所有參與者點數。')
      }
      focusError(firstPath.startsWith('typeDetails.') ? firstPath.slice('typeDetails.'.length) : firstPath)
      return
    }
    if (error.status === 400 && ['file_too_large', 'too_many_files', 'file_type_not_allowed'].includes(error.apiCode ?? '')) {
      const messages: Record<string, string> = { file_too_large: '每個附件不得超過 5 MB。', too_many_files: '每份申請最多 10 個附件。', file_type_not_allowed: '只接受 PDF、JPEG 或 PNG 檔案。' }
      setStep(3)
      setMessage(messages[error.apiCode ?? ''])
      return
    }
    setStep(4)
    setMessage(error.message || '送件資料無法處理，請返回表單確認後再試。')
  }

  async function send(activeSnapshot: ExhibitionSubmissionSnapshot) {
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
    await form.handleSubmit(async (parsedValue) => {
      const domainErrors = pointErrors()
      if (domainErrors.length > 0 || !selectedAdvisor) {
        applyErrors(domainErrors)
        setStep(domainErrors.length > 0 ? 1 : 2, false)
        focusError(domainErrors[0]?.path ?? 'advisorId')
        return
      }
      const nextSnapshot = createExhibitionSubmissionSnapshot(
        mapExhibitionApplicationPayload(parsedValue),
        parsedValue.attachments.map(({ clientFileKey, file }) => ({ clientFileKey, file })),
      )
      setSnapshot(nextSnapshot)
      await send(nextSnapshot)
    }, (errors) => {
      const firstPath = Object.keys(collectErrorMessages(errors))[0]
      setStep(stepForPath(firstPath), false)
      focusError(firstPath)
    })()
  }

  if (result) return <ApplicationSuccessPage result={result} />
  if (rulesQuery.isPending) return <p role="status">正在載入展覽點數規則…</p>
  if (rulesQuery.isError && !rulesQuery.data) return <QueryState retry={() => void rulesQuery.refetch()} title="暫時無法載入展覽點數規則" />
  if (rulesQuery.data.length === 0) return <QueryState empty retry={() => void rulesQuery.refetch()} title="目前沒有可申請的展覽點數規則" />

  return (
    <>
      <ApplicationWizard currentStep={currentStep} nextDisabled={submission.isPending || mustReloadRules || (currentStep === 4 && isRateLimited)} nextLabel={currentStep === 4 ? (submission.isPending ? '送件中…' : '確認送出申請') : '下一步'} onBack={!submission.isPending && !uncertain && currentStep > 0 ? () => setStep(currentStep - 1) : undefined} onNext={uncertain ? undefined : currentStep === 4 ? () => void submit() : () => void next()} onStepSelect={submission.isPending || uncertain ? undefined : setStep} steps={steps}>
        <div className="space-y-5">
          {message ? <p className="rounded-lg bg-amber-50 p-3 font-semibold text-amber-950" role="alert">{message}</p> : null}
          {fieldErrors.form ? <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">{fieldErrors.form}</p> : null}
          {mustReloadRules ? <button className="min-h-11 rounded-lg border border-blue-700 px-4 py-2 font-bold text-blue-800" onClick={() => void reloadRules()} type="button">重新載入規則</button> : null}
          {uncertain && snapshot ? (
            <ApplicationUncertainState onEdit={() => { setSnapshot(null); setUncertain(false); setStep(4) }} onRetry={() => void send(snapshot)} pending={submission.isPending} />
          ) : currentStep === 0 ? (
            <ParticipantsEditor applicantEmail={value.applicantEmail} applicantPhone={value.applicantPhone} applicantSelectionError={fieldErrors['participants.applicant']} errors={fieldErrors} initialRequestedPoints="" maximumParticipants={15} onApplicantEmailChange={(email) => setField('applicantEmail', email)} onApplicantPhoneChange={(phone) => setField('applicantPhone', phone)} onChange={updateParticipants} onDirty={markChanged} onFieldChange={(path) => { form.clearErrors(formErrorPath(path)); clearApiErrors(path) }} participants={value.participants as ParticipantEditorValue[]} pointsEditable={false} showPoints={false} />
          ) : currentStep === 1 ? (
            <div className="space-y-8">
              <ExhibitionDetailsStep errors={fieldErrors} onChange={setField} onTypeChange={changeType} options={rulesQuery.data} value={value} />
              <ExhibitionParticipantPoints allowedPoints={allowedPoints} errors={fieldErrors} onChange={(index, points) => {
                markChanged()
                const participants = value.participants.map((participant, participantIndex) => participantIndex === index ? { ...participant, requestedPoints: points } : participant)
                form.setValue('participants', participants, { shouldDirty: true })
                form.clearErrors(`participants.${index}.requestedPoints`)
                clearApiErrors(`participants.${index}.requestedPoints`)
              }} participants={value.participants} />
            </div>
          ) : currentStep === 2 ? (
            advisorsQuery.isPending ? <p role="status">正在載入指導老師名單…</p> : advisorsQuery.isError ? <QueryState retry={() => void advisorsQuery.refetch()} title="暫時無法載入指導老師名單" /> : advisorsQuery.data.length === 0 ? <QueryState empty retry={() => void advisorsQuery.refetch()} title="目前沒有可選擇的指導老師" /> : <AdvisorSelector advisors={advisorsQuery.data} error={fieldErrors.advisorId} onSelect={(id) => setField('advisorId', id)} selectedId={value.advisorId} />
          ) : currentStep === 3 ? (
            <AttachmentEditor attachmentTypes={exhibitionAttachmentTypes} attachments={value.attachments as AttachmentEditorValue<ExhibitionAttachmentType>[]} defaultAttachmentType="exhibition_photo" errors={fieldErrors} inputId="exhibition-attachments" onChange={(attachments) => setField('attachments', attachments)} onError={setMessage} onFieldChange={(path) => { form.clearErrors(formErrorPath(path)); clearApiErrors(path) }} />
          ) : selectedAdvisor ? (
            <div className="space-y-6">
              <ExhibitionConfirmationStep advisor={selectedAdvisor} value={value} />
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
