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
import { validateAttachmentFile } from './attachment-validation'
import { LeaveConfirmationDialog } from './leave-confirmation-dialog'
import {
  ParticipantsEditor,
  type ParticipantEditorValue,
} from './participants-editor'

const steps = [
  { label: '競賽內容' },
  { label: '參與者資料' },
  { label: '指導老師' },
] satisfies WizardStep[]

describe('shared application controls', () => {
  it('renders accessible wizard progress and navigation', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const onStepSelect = vi.fn()
    render(
      <ApplicationWizard
        currentStep={1}
        onNext={onNext}
        onStepSelect={onStepSelect}
        steps={steps}
      >
        <p>步驟內容</p>
      </ApplicationWizard>,
    )

    expect(screen.getByText('步驟 2／3')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '申請步驟' })).toBeInTheDocument()
    const completedStep = screen.getByRole('button', {
      name: '1. 競賽內容',
    })
    const currentStep = screen.getByRole('button', {
      name: '2. 參與者資料',
    })
    const futureStep = screen.getByRole('button', {
      name: '3. 指導老師',
    })
    expect(completedStep).toBeEnabled()
    expect(currentStep).toBeDisabled()
    expect(currentStep).toHaveAttribute('aria-current', 'step')
    expect(futureStep).toBeDisabled()
    await user.click(completedStep)
    expect(onStepSelect).toHaveBeenCalledWith(0)
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
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
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
        applicantEmail="student@example.com"
        applicantPhone="0912345678"
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
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
    confirm.mockRestore()
  })

  it('selects the first applicant without confirmation and reveals contact fields', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    const onChange = vi.fn()
    const participant: ParticipantEditorValue = {
      clientKey: 'one',
      studentName: '甲',
      studentNumber: 'a001',
      grade: 1,
      classNumber: 1,
      requestedPoints: '0.50',
      isApplicant: false,
    }

    const { rerender } = render(
      <ParticipantsEditor
        applicantEmail=""
        applicantPhone=""
        applicantSelectionError="請先選擇一位參與者作為申請人。"
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
        onChange={onChange}
        onDirty={vi.fn()}
        participants={[participant]}
        pointsEditable
      />,
    )

    expect(screen.queryByLabelText('申請人 Email')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '設為申請人' }))
    expect(confirm).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ isApplicant: true }),
    ])

    rerender(
      <ParticipantsEditor
        applicantEmail=""
        applicantPhone=""
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
        onChange={onChange}
        onDirty={vi.fn()}
        participants={[{ ...participant, isApplicant: true }]}
        pointsEditable
      />,
    )
    expect(screen.getByRole('heading', { name: '申請人聯絡資料' })).toBeInTheDocument()
    expect(screen.getByLabelText('申請人 Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '目前申請人' })).toBeInTheDocument()
  })

  it('starts shared points at zero and adjusts them with explicit controls', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const participant: ParticipantEditorValue = {
      clientKey: 'one',
      studentName: '甲',
      studentNumber: 'A001',
      grade: 1,
      classNumber: 1,
      requestedPoints: '0.00',
      isApplicant: false,
    }

    const { rerender } = render(
      <ParticipantsEditor
        applicantEmail=""
        applicantPhone=""
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
        onChange={onChange}
        onDirty={vi.fn()}
        participants={[participant]}
        pointsEditable
        sharedRemainingPoints="60.00"
      />,
    )

    const points = screen.getByLabelText('申請點數')
    const decrease = screen.getByRole('button', {
      name: '減少參與者 1 申請點數',
    })
    const increase = screen.getByRole('button', {
      name: '增加參與者 1 申請點數',
    })
    expect(screen.queryByText(/學年度/)).not.toBeInTheDocument()
    expect(points).toHaveAttribute('type', 'text')
    expect(points).toHaveValue('0.00')
    expect(decrease).toBeDisabled()
    expect(increase).toBeEnabled()

    await user.click(increase)
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ requestedPoints: '0.50' }),
    ])

    await user.click(screen.getByRole('button', { name: '新增參與者' }))
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ requestedPoints: '0.50' }),
      expect.objectContaining({ requestedPoints: '0.00' }),
    ])

    rerender(
      <ParticipantsEditor
        applicantEmail=""
        applicantPhone=""
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
        onChange={onChange}
        onDirty={vi.fn()}
        participants={[{ ...participant, requestedPoints: '0.50' }]}
        pointsEditable
        sharedRemainingPoints="0.00"
      />,
    )
    expect(
      screen.getByRole('button', { name: '增加參與者 1 申請點數' }),
    ).toBeDisabled()
    await user.click(
      screen.getByRole('button', { name: '減少參與者 1 申請點數' }),
    )
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ requestedPoints: '0.00' }),
    ])
  })

  it('renders and clears indexed grade and class errors at their controls', async () => {
    const user = userEvent.setup()
    const onFieldChange = vi.fn()
    const participant: ParticipantEditorValue = {
      clientKey: 'one',
      studentName: '甲',
      studentNumber: 'A001',
      grade: 1,
      classNumber: 1,
      requestedPoints: '0.50',
      isApplicant: false,
    }

    render(
      <ParticipantsEditor
        applicantEmail=""
        applicantPhone=""
        errors={{
          'participants.0.grade': '年級資料不正確。',
          'participants.0.classNumber': '班級資料不正確。',
        }}
        maximumParticipants={10}
        onApplicantEmailChange={vi.fn()}
        onApplicantPhoneChange={vi.fn()}
        onChange={vi.fn()}
        onDirty={vi.fn()}
        onFieldChange={onFieldChange}
        participants={[participant]}
        pointsEditable
      />,
    )

    const grade = screen.getByLabelText('年級')
    const classNumber = screen.getByLabelText('班級')
    expect(grade).toHaveClass('border-red-600')
    expect(grade).toHaveAccessibleDescription('年級資料不正確。')
    expect(classNumber).toHaveClass('border-red-600')
    expect(classNumber).toHaveAccessibleDescription('班級資料不正確。')

    await user.selectOptions(grade, '2')
    await user.selectOptions(classNumber, '2')
    expect(onFieldChange).toHaveBeenCalledWith('participants.0.grade')
    expect(onFieldChange).toHaveBeenCalledWith('participants.0.classNumber')
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

  it('enforces attachment type, size, duplicate, and other metadata rules', async () => {
    const oversized = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'large.pdf',
      { type: 'application/pdf' },
    )
    expect(
      validateAttachmentFile(new File(['x'], 'proof.txt', { type: 'text/plain' })),
    ).toMatch(/只接受/)
    expect(
      validateAttachmentFile(new File(['x'], 'proof.pdf', { type: 'text/plain' })),
    ).toMatch(/格式/)
    expect(validateAttachmentFile(oversized)).toMatch(/5 MB/)

    const user = userEvent.setup()
    const onChange = vi.fn()
    const duplicate = new File(['same'], 'proof.pdf', {
      type: 'application/pdf',
      lastModified: 10,
    })
    const attachment: AttachmentEditorValue = {
      clientFileKey: 'existing',
      file: duplicate,
      attachmentType: 'other',
      attachmentTypeOther: '成績公告',
      description: null,
    }
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    confirm.mockClear()
    render(
      <AttachmentEditor
        attachments={[attachment]}
        onChange={onChange}
        onError={vi.fn()}
      />,
    )

    await user.upload(screen.getByLabelText('新增附件'), duplicate)
    expect(window.confirm).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenLastCalledWith([attachment])

    await user.selectOptions(
      screen.getByLabelText('附件分類'),
      'participation_proof',
    )
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        attachmentType: 'participation_proof',
        attachmentTypeOther: null,
      }),
    ])
  })

  it('renders and clears indexed attachment type and description errors', async () => {
    const user = userEvent.setup()
    const onFieldChange = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:preview'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    const attachment: AttachmentEditorValue = {
      clientFileKey: 'existing',
      file: new File(['proof'], 'proof.pdf', { type: 'application/pdf' }),
      attachmentType: 'participation_proof',
      attachmentTypeOther: null,
      description: null,
    }

    render(
      <AttachmentEditor
        attachments={[attachment]}
        errors={{
          'attachments.0.attachmentType': '附件分類不正確。',
          'attachments.0.description': '附件說明不正確。',
        }}
        onChange={vi.fn()}
        onError={vi.fn()}
        onFieldChange={onFieldChange}
      />,
    )

    const attachmentType = screen.getByLabelText('附件分類')
    const description = screen.getByLabelText('說明（選填）')
    expect(attachmentType).toHaveClass('border-red-600')
    expect(attachmentType).toHaveAccessibleDescription('附件分類不正確。')
    expect(description).toHaveClass('border-red-600')
    expect(description).toHaveAccessibleDescription('附件說明不正確。')

    await user.selectOptions(attachmentType, 'official_document')
    await user.type(description, '公文附件')
    expect(onFieldChange).toHaveBeenCalledWith('attachments.0.attachmentType')
    expect(onFieldChange).toHaveBeenCalledWith('attachments.0.description')
  })

  it('focuses the leave dialog and supports Escape', async () => {
    const user = userEvent.setup()
    const onStay = vi.fn()
    render(
      <LeaveConfirmationDialog
        onLeave={vi.fn()}
        onStay={onStay}
        open
      />,
    )

    expect(screen.getByRole('button', { name: '繼續填寫' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(onStay).toHaveBeenCalledOnce()
  })
})
