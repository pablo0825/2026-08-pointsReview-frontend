import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form'
import { useBlocker } from 'react-router-dom'

import { ApiClientError } from '../../../shared/api/api-client'
import {
  fetchPublicAdvisors,
  publicAdvisorsQueryKey,
} from '../common/api/public-advisors.query'
import { AdvisorSelector } from '../common/components/advisor-selector'
import {
  ApplicationSuccessPage,
  ApplicationUncertainState,
} from '../common/components/application-submission-state'
import { ApplicationWizard } from '../common/components/application-wizard'
import {
  AttachmentEditor,
  type AttachmentEditorValue,
  type AttachmentTypeOption,
} from '../common/components/attachment-editor'
import { LeaveConfirmationDialog } from '../common/components/leave-confirmation-dialog'
import { estimateProjectParticipationPoints } from './api/project-participation.estimate'
import type { ProjectAttachmentType } from './api/project-participation.schema'
import {
  createProjectParticipationSubmissionSnapshot,
  submitProjectParticipationApplication,
  type ProjectParticipationSubmissionSnapshot,
} from './api/project-participation.submit'
import { ProjectApplicantStep } from './components/project-applicant-step'
import { ProjectConfirmationStep } from './components/project-confirmation-step'
import { ProjectDetailsStep } from './components/project-details-step'
import {
  createProjectEstimateRequest,
  initialProjectEstimateState,
  isCurrentEligibleEstimate,
  projectEstimateFingerprint,
  type ProjectEstimateState,
} from './model/project-estimate-state'
import {
  mapProjectParticipationApplicationPayload,
  normalizeProjectApiFieldErrors,
} from './model/project-participation.mapper'
import {
  createDefaultProjectParticipationForm,
  createProjectParticipationFormSchema,
  type ProjectParticipationForm,
} from './model/project-participation.schema'

const steps = [
  { label: '計畫內容與薪資試算' },
  { label: '申請人資料' },
  { label: '指導老師' },
  { label: '附件' },
  { label: '確認送出' },
] as const

const projectAttachmentTypes = [
  ['salary_proof', '薪資證明'],
  ['official_document', '公文'],
  ['other', '其他'],
] as const satisfies readonly AttachmentTypeOption<ProjectAttachmentType>[]

const stepFields: Record<number, FieldPath<ProjectParticipationForm>[]> = {
  0: ['projectName', 'principalInvestigator', 'workDescription', 'salaryItems'],
  1: [
    'studentName',
    'studentNumber',
    'grade',
    'classNumber',
    'applicantEmail',
    'applicantPhone',
  ],
  2: ['advisorId'],
  3: ['attachments'],
  4: [],
}

type FormErrorPath = FieldPath<ProjectParticipationForm> | `root.${string}`

function displayPath(path: string) {
  return path.startsWith('root.') ? path.slice('root.'.length) : path
}

function collectErrorMessages(errors: FieldErrors<ProjectParticipationForm>) {
  const messages: Record<string, string> = {}
  function visit(value: unknown, path: string) {
    if (!value || typeof value !== 'object') return
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') {
      messages[displayPath(path)] = record.message
      return
    }
    Object.entries(record).forEach(([key, child]) =>
      visit(child, path ? `${path}.${key}` : key),
    )
  }
  visit(errors, '')
  return messages
}

function formErrorPath(path: string): FormErrorPath {
  if (path === 'payload' || path === 'form' || path.startsWith('headers.')) {
    return 'root.form'
  }
  if (path === 'applicant.name') return 'studentName'
  if (path === 'applicant.email') return 'applicantEmail'
  if (path === 'applicant.phone') return 'applicantPhone'
  if (path === 'participants') return 'root.applicant'
  if (path.startsWith('participants.0.')) {
    const field = path.slice('participants.0.'.length)
    if (field === 'studentName' || field === 'studentNumber' || field === 'grade' || field === 'classNumber') {
      return field
    }
    return 'root.applicant'
  }
  if (path === 'typeDetails') return 'root.projectDetails'
  if (path.startsWith('typeDetails.')) {
    return path.slice('typeDetails.'.length) as FieldPath<ProjectParticipationForm>
  }
  if (path === 'attachments') return 'root.attachments'
  return path as FieldPath<ProjectParticipationForm>
}

function stepForPath(path: string) {
  if (path.startsWith('typeDetails.') || path.startsWith('salaryItems') || ['projectName', 'principalInvestigator', 'workDescription'].includes(path)) return 0
  if (path.startsWith('participants') || path.startsWith('applicant.') || ['studentName', 'studentNumber', 'grade', 'classNumber', 'applicantEmail', 'applicantPhone'].includes(path)) return 1
  if (path === 'advisorId') return 2
  if (path.startsWith('attachments')) return 3
  return 4
}

function focusRenderedError() {
  requestAnimationFrame(() => {
    ;(
      document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      document.getElementById('wizard-heading')
    )?.focus()
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

export function ProjectParticipationApplicationPage() {
  const formSchema = useMemo(() => createProjectParticipationFormSchema(), [])
  const form = useForm<ProjectParticipationForm>({
    defaultValues: createDefaultProjectParticipationForm(),
    resolver: zodResolver(formSchema),
  })
  const value = useWatch({ control: form.control }) as ProjectParticipationForm
  const salaryArray = useFieldArray({ control: form.control, name: 'salaryItems' })
  const [currentStep, setCurrentStep] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [estimateState, setEstimateState] = useState<ProjectEstimateState>(initialProjectEstimateState)
  const [snapshot, setSnapshot] = useState<ProjectParticipationSubmissionSnapshot | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitProjectParticipationApplication>>['data'] | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState(0)
  const [clock, setClock] = useState(0)

  const advisorsQuery = useQuery({
    enabled: currentStep >= 2,
    queryKey: publicAdvisorsQueryKey,
    queryFn: () => fetchPublicAdvisors(),
    staleTime: Infinity,
    refetchOnMount: false,
  })
  const estimateMutation = useMutation({
    mutationFn: (request: ReturnType<typeof createProjectEstimateRequest>) =>
      estimateProjectParticipationPoints(request),
  })
  const submission = useMutation({
    mutationFn: (activeSnapshot: ProjectParticipationSubmissionSnapshot) =>
      submitProjectParticipationApplication(activeSnapshot),
  })

  const selectedAdvisor = (advisorsQuery.data ?? []).find(({ id }) => id === value.advisorId) ?? null
  const currentEstimateEligible = isCurrentEligibleEstimate(estimateState, value.salaryItems)
  const isRateLimited = rateLimitUntil > clock
  const rateLimitSeconds = isRateLimited ? Math.max(1, Math.ceil((rateLimitUntil - clock) / 1000)) : 0
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
    const timer = window.setInterval(() => setClock(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [isRateLimited])

  useEffect(() => {
    if (value.advisorId !== null && advisorsQuery.isSuccess && !advisorsQuery.data.some(({ id }) => id === value.advisorId)) {
      form.setValue('advisorId', null)
    }
  }, [advisorsQuery.data, advisorsQuery.isSuccess, form, value.advisorId])

  function markChanged() {
    setDirty(true)
    setSnapshot(null)
    setUncertain(false)
  }

  function setField(field: FieldPath<ProjectParticipationForm>, next: unknown) {
    markChanged()
    form.setValue(field, next as never, { shouldDirty: true })
    form.clearErrors(field)
  }

  function invalidateEstimate() {
    setEstimateState(initialProjectEstimateState)
    form.clearErrors('root.salaryItems' as FormErrorPath)
  }

  function setStep(step: number, clearErrors = true) {
    if (clearErrors) form.clearErrors()
    setMessage(null)
    setCurrentStep(step)
    requestAnimationFrame(() => document.getElementById('wizard-heading')?.focus())
  }

  async function estimatePoints() {
    setMessage(null)
    form.clearErrors('salaryItems')
    form.clearErrors('root.salaryItems' as FormErrorPath)
    const valid = await form.trigger('salaryItems')
    if (!valid) {
      focusRenderedError()
      return
    }
    const request = createProjectEstimateRequest(form.getValues('salaryItems'))
    const fingerprint = projectEstimateFingerprint(request)
    setEstimateState({ status: 'pending', fingerprint })
    try {
      const response = await estimateMutation.mutateAsync(request)
      const currentFingerprint = projectEstimateFingerprint(
        createProjectEstimateRequest(form.getValues('salaryItems')),
      )
      if (currentFingerprint === fingerprint) {
        setEstimateState({ status: 'success', fingerprint, result: response.data })
      } else {
        setEstimateState(initialProjectEstimateState)
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 422) {
        const normalized = normalizeProjectApiFieldErrors(error.fields)
        normalized.forEach(({ path, message: fieldMessage }) =>
          form.setError(formErrorPath(path), { type: 'server', message: fieldMessage }),
        )
        if (normalized.length === 0) setMessage(error.message)
        setEstimateState(initialProjectEstimateState)
        focusRenderedError()
        return
      }
      setEstimateState({ status: 'error', fingerprint })
    }
  }

  async function next() {
    form.clearErrors()
    const schemaValid = await form.trigger(stepFields[currentStep])
    if (!schemaValid) {
      focusRenderedError()
      return
    }
    if (currentStep === 0 && !currentEstimateEligible) {
      form.setError('root.salaryItems' as FormErrorPath, {
        type: 'validate',
        message: estimateState.status === 'success'
          ? '目前試算尚未達申請門檻。'
          : '請先完成目前薪資資料的點數試算。',
      })
      focusRenderedError()
      return
    }
    if (currentStep === 2 && !selectedAdvisor) {
      form.setError('advisorId', { type: 'validate', message: '選擇的指導老師目前無效' })
      focusRenderedError()
      return
    }
    setStep(Math.min(currentStep + 1, 4))
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
        setRateLimitUntil(now + error.retryAfterSeconds * 1_000)
      }
      setStep(4)
      setMessage(error.message || '嘗試次數過多，請稍後再試。')
      return
    }
    if (error.status === 422 && error.fields.length > 0) {
      const normalized = normalizeProjectApiFieldErrors(error.fields)
      const firstPath = normalized[0]?.path ?? 'form'
      setStep(stepForPath(firstPath), false)
      normalized.forEach(({ path, message: fieldMessage }) =>
        form.setError(formErrorPath(path), { type: 'server', message: fieldMessage }),
      )
      if (normalized.some(({ path }) => path.startsWith('typeDetails.salaryItems'))) {
        invalidateEstimate()
        form.setError('root.salaryItems' as FormErrorPath, {
          type: 'server',
          message: normalized.find(({ path }) => path.startsWith('typeDetails.salaryItems'))?.message,
        })
      }
      focusRenderedError()
      return
    }
    if (error.status === 400 && ['file_too_large', 'too_many_files', 'file_type_not_allowed'].includes(error.apiCode ?? '')) {
      const messages: Record<string, string> = {
        file_too_large: '每個附件不得超過 5 MB。',
        too_many_files: '每份申請最多 10 個附件。',
        file_type_not_allowed: '只接受 PDF、JPEG 或 PNG 檔案。',
      }
      setStep(3)
      setMessage(messages[error.apiCode ?? ''])
      return
    }
    setStep(4)
    setMessage(error.message || '送件資料無法處理，請返回表單確認後再試。')
  }

  async function send(activeSnapshot: ProjectParticipationSubmissionSnapshot) {
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
    await form.handleSubmit(
      async (parsedValue) => {
        if (isRateLimited || !selectedAdvisor || !currentEstimateEligible || estimateState.status !== 'success') {
          setStep(!currentEstimateEligible ? 0 : !selectedAdvisor ? 2 : 4, false)
          if (!currentEstimateEligible) form.setError('root.salaryItems' as FormErrorPath, { type: 'validate', message: '請重新完成點數試算。' })
          focusRenderedError()
          return
        }
        const nextSnapshot = createProjectParticipationSubmissionSnapshot(
          mapProjectParticipationApplicationPayload(parsedValue, estimateState.result.estimatedPoints),
          parsedValue.attachments.map(({ clientFileKey, file }) => ({ clientFileKey, file })),
        )
        setSnapshot(nextSnapshot)
        await send(nextSnapshot)
      },
      (errors) => {
        const firstPath = Object.keys(collectErrorMessages(errors))[0]
        if (firstPath) setStep(stepForPath(firstPath), false)
        focusRenderedError()
      },
    )()
  }

  if (result) return <ApplicationSuccessPage result={result} />

  return (
    <>
      <ApplicationWizard
        currentStep={currentStep}
        nextDisabled={submission.isPending || (currentStep === 4 && isRateLimited)}
        nextLabel={currentStep === 4 ? (submission.isPending ? '送件中…' : '確認送出申請') : '下一步'}
        onBack={currentStep > 0 ? () => setStep(currentStep - 1) : undefined}
        onNext={currentStep === 4 ? () => void submit() : () => void next()}
        onStepSelect={setStep}
        steps={steps}
      >
        <div className="space-y-5">
          {message ? <p className="rounded-lg bg-amber-50 p-3 text-amber-950" role="alert">{message}</p> : null}
          {fieldErrors.form ? <p className="rounded-lg border border-red-300 bg-red-50 p-3 font-semibold text-red-950" role="alert">{fieldErrors.form}</p> : null}
          {uncertain && snapshot ? (
            <ApplicationUncertainState onEdit={() => { setSnapshot(null); setUncertain(false); setStep(4) }} onRetry={() => void send(snapshot)} pending={submission.isPending} />
          ) : currentStep === 0 ? (
            <ProjectDetailsStep
              errors={fieldErrors}
              estimatePending={estimateMutation.isPending}
              estimateState={estimateState}
              onAddSalary={() => {
                markChanged()
                invalidateEstimate()
                salaryArray.append({ clientKey: crypto.randomUUID(), salaryMonth: '', salaryAmount: '' })
              }}
              onEstimate={() => void estimatePoints()}
              onFieldChange={(field, nextValue) => setField(field, nextValue)}
              onRemoveSalary={(index) => {
                markChanged()
                invalidateEstimate()
                salaryArray.remove(index)
              }}
              onSalaryChange={(index, field, nextValue) => {
                markChanged()
                invalidateEstimate()
                form.setValue(`salaryItems.${index}.${field}`, nextValue, { shouldDirty: true })
                form.clearErrors(`salaryItems.${index}.${field}`)
              }}
              value={value}
            />
          ) : currentStep === 1 ? (
            <ProjectApplicantStep errors={fieldErrors} onChange={(field, nextValue) => setField(field, nextValue)} value={value} />
          ) : currentStep === 2 ? (
            advisorsQuery.isPending ? <p role="status">正在載入指導老師名單…</p> : advisorsQuery.isError ? <QueryState retry={() => void advisorsQuery.refetch()} title="暫時無法載入指導老師名單" /> : advisorsQuery.data.length === 0 ? <QueryState empty retry={() => void advisorsQuery.refetch()} title="目前沒有可選擇的指導老師" /> : <AdvisorSelector advisors={advisorsQuery.data} error={fieldErrors.advisorId} onSelect={(id) => setField('advisorId', id)} selectedId={value.advisorId} />
          ) : currentStep === 3 ? (
            <AttachmentEditor
              attachmentTypes={projectAttachmentTypes}
              attachments={value.attachments as AttachmentEditorValue<ProjectAttachmentType>[]}
              defaultAttachmentType="salary_proof"
              errors={fieldErrors}
              inputId="project-participation-attachments"
              onChange={(attachments) => {
                markChanged()
                form.setValue('attachments', attachments, { shouldDirty: true })
              }}
              onError={setMessage}
              onFieldChange={(path) => {
                if (path === 'attachments.*') {
                  form.clearErrors('attachments')
                  form.clearErrors('root.attachments' as FormErrorPath)
                } else {
                  form.clearErrors(formErrorPath(path))
                }
              }}
            />
          ) : selectedAdvisor && estimateState.status === 'success' ? (
            <div className="space-y-6">
              <ProjectConfirmationStep advisor={selectedAdvisor} estimateState={estimateState} value={value} />
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
