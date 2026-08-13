import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { getAdvisorTitle } from './advisor-options'
import { AdvisorSelector } from './advisor-selector'
import {
  ApplicationWizard,
  type WizardStep,
} from './application-wizard'
import {
  AttachmentEditor,
  type AttachmentEditorValue,
} from './attachment-editor'
import { ErrorSummary } from './error-summary'
import { LeaveConfirmationDialog } from './leave-confirmation-dialog'
import {
  ParticipantsEditor,
  type ParticipantEditorValue,
} from './participants-editor'

const steps = [
  { label: '學生與參與者資料' },
  { label: '申請內容與點數' },
] satisfies WizardStep[]

describe('shared application controls', () => {
  it('renders accessible wizard progress and navigation', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(
      <ApplicationWizard currentStep={0} onNext={onNext} steps={steps}>
        <p>步驟內容</p>
      </ApplicationWizard>,
    )

    expect(screen.getByText('步驟 1／2')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '申請步驟' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('filters advisors by title and uses a fallback title', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <AdvisorSelector
        advisors={[
          {
            id: 10,
            name: '測試老師',
            titleCode: 6,
            department: '設計學系',
            isDirector: true,
          },
        ]}
        onSelect={onSelect}
        selectedId={null}
      />,
    )

    await user.type(screen.getByRole('searchbox'), '教授')
    await user.click(screen.getByRole('radio', { name: /測試老師/ }))
    expect(onSelect).toHaveBeenCalledWith(10)
    expect(screen.queryByText(/主任/)).not.toBeInTheDocument()
    expect(getAdvisorTitle(99)).toBe('未知職稱')
  })

  it('changes applicant only after confirmation and protects the current applicant', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const participants: ParticipantEditorValue[] = [
      {
        clientKey: 'one',
        studentName: '甲',
        studentNumber: 'a001',
        grade: 1,
        classNumber: 1,
        requestedPoints: '0.50',
        isApplicant: true,
      },
      {
        clientKey: 'two',
        studentName: '乙',
        studentNumber: 'a002',
        grade: 1,
        classNumber: 1,
        requestedPoints: '0.50',
        isApplicant: false,
      },
    ]

    render(
      <ParticipantsEditor
        academicYear="115"
        maximumParticipants={10}
        onChange={onChange}
        onDirty={vi.fn()}
        participants={participants}
        pointsEditable
      />,
    )

    expect(screen.getAllByRole('button', { name: '移除參與者' })[0]).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '設為申請人' }))
    expect(window.confirm).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ isApplicant: false }),
      expect.objectContaining({ isApplicant: true }),
    ])
  })

  it('validates, adds, and removes attachment files', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onError = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:preview')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    })

    const { rerender, unmount } = render(
      <AttachmentEditor attachments={[]} onChange={onChange} onError={onError} />,
    )
    const file = new File(['proof'], 'proof.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('新增附件'), file)
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ file, attachmentType: 'participation_proof' }),
    ])

    const attachment = onChange.mock.calls[0][0][0] as AttachmentEditorValue
    rerender(
      <AttachmentEditor
        attachments={[attachment]}
        onChange={onChange}
        onError={onError}
      />,
    )
    expect(screen.getByRole('link', { name: '在新分頁檢視 PDF' })).toHaveAttribute(
      'target',
      '_blank',
    )
    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })

  it('focuses the leave dialog and exposes actionable errors', async () => {
    const user = userEvent.setup()
    const onStay = vi.fn()
    const onSelect = vi.fn()
    render(
      <>
        <ErrorSummary
          errors={[{ path: 'applicantEmail', message: '請輸入 Email' }]}
          onSelect={onSelect}
        />
        <LeaveConfirmationDialog
          onLeave={vi.fn()}
          onStay={onStay}
          open
        />
      </>,
    )

    expect(screen.getByRole('button', { name: '繼續填寫' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: '請輸入 Email' }))
    expect(onSelect).toHaveBeenCalledWith('applicantEmail')
    await user.keyboard('{Escape}')
    expect(onStay).toHaveBeenCalledOnce()
  })
})
