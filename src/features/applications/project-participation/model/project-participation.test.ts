import {
  createProjectEstimateRequest,
  isCurrentEligibleEstimate,
  projectEstimateFingerprint,
  type ProjectEstimateState,
} from './project-estimate-state'
import {
  mapProjectParticipationApplicationPayload,
  normalizeProjectApiFieldErrors,
  normalizeProjectStudentNumber,
} from './project-participation.mapper'
import {
  createDefaultProjectParticipationForm,
  createProjectParticipationFormSchema,
  type ProjectParticipationForm,
} from './project-participation.schema'

function validForm(): ProjectParticipationForm {
  return {
    academicYear: '115',
    projectName: ' 數位學習計畫 ',
    principalInvestigator: ' 陳教授 ',
    workDescription: ' 協助教材設計。 ',
    salaryItems: [
      { clientKey: 'june', salaryMonth: '2026-06', salaryAmount: '5000' },
      { clientKey: 'july', salaryMonth: '2026-07', salaryAmount: '3500' },
    ],
    studentName: ' 王小明 ',
    studentNumber: ' 4a0x0001 ',
    grade: 3,
    classNumber: 1,
    applicantEmail: ' STUDENT@EXAMPLE.COM ',
    applicantPhone: ' 0912-345-678 ',
    advisorId: 10,
    attachments: [
      {
        clientFileKey: 'salary-proof-1',
        file: new File(['salary'], 'salary.pdf', { type: 'application/pdf' }),
        attachmentType: 'salary_proof',
        attachmentTypeOther: null,
        description: ' 六七月薪資 ',
      },
    ],
  }
}

describe('project participation form model', () => {
  it('creates one empty salary row and a dynamic academic year', () => {
    const beforeBoundary = createDefaultProjectParticipationForm(
      new Date('2026-07-31T15:59:59.000Z'),
    )
    const afterBoundary = createDefaultProjectParticipationForm(
      new Date('2026-07-31T16:00:00.000Z'),
    )
    expect(beforeBoundary.academicYear).toBe('114')
    expect(afterBoundary.academicYear).toBe('115')
    expect(afterBoundary.salaryItems).toHaveLength(1)
    expect(afterBoundary.salaryItems[0]).toMatchObject({
      salaryMonth: '',
      salaryAmount: '',
    })
  })

  it('validates duplicate, future, integer, bounds, and work length rules', () => {
    const schema = createProjectParticipationFormSchema(
      new Date('2026-08-16T04:00:00.000Z'),
    )
    const value = validForm()
    value.salaryItems = [
      { clientKey: 'one', salaryMonth: '2026-09', salaryAmount: '0' },
      { clientKey: 'two', salaryMonth: '2026-09', salaryAmount: '1.5' },
    ]
    value.workDescription = '字'.repeat(1_001)
    const result = schema.safeParse(value)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(({ path }) => path.join('.'))
      expect(paths).toContain('salaryItems.0.salaryMonth')
      expect(paths).toContain('salaryItems.1.salaryMonth')
      expect(paths).toContain('salaryItems.0.salaryAmount')
      expect(paths).toContain('salaryItems.1.salaryAmount')
      expect(paths).toContain('workDescription')
    }
  })

  it('requires salary proof and valid other attachment metadata', () => {
    const schema = createProjectParticipationFormSchema(
      new Date('2026-08-16T04:00:00.000Z'),
    )
    const value = validForm()
    value.attachments = [
      {
        ...value.attachments[0],
        attachmentType: 'other',
        attachmentTypeOther: '   ',
      },
    ]
    const result = schema.safeParse(value)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path.join('.'))).toEqual(
        expect.arrayContaining(['attachments', 'attachments.0.attachmentTypeOther']),
      )
    }
  })

  it('maps trimmed data, uppercase student number, salary dates, and backend points', () => {
    const mapped = mapProjectParticipationApplicationPayload(validForm(), '4.00')
    expect(normalizeProjectStudentNumber(' 4a0x0001 ')).toBe('4A0X0001')
    expect(mapped).toMatchObject({
      applicant: {
        name: '王小明',
        email: 'student@example.com',
        phone: '0912-345-678',
      },
      participants: [
        {
          academicYear: '115',
          studentNumber: '4A0X0001',
          requestedPoints: '4.00',
          isApplicant: true,
        },
      ],
      typeDetails: {
        projectName: '數位學習計畫',
        principalInvestigator: '陳教授',
        workDescription: '協助教材設計。',
        salaryItems: [
          { salaryMonth: '2026-06-01', salaryAmount: 5_000 },
          { salaryMonth: '2026-07-01', salaryAmount: 3_500 },
        ],
      },
      attachments: [{ description: '六七月薪資' }],
    })
  })

  it('only accepts an eligible estimate for the unchanged salary snapshot', () => {
    const salaryItems = validForm().salaryItems
    const request = createProjectEstimateRequest(salaryItems)
    const state: ProjectEstimateState = {
      status: 'success',
      fingerprint: projectEstimateFingerprint(request),
      result: {
        totalSalary: 8_500,
        estimatedPoints: '4.00',
        isEligible: true,
      },
    }
    expect(isCurrentEligibleEstimate(state, salaryItems)).toBe(true)
    expect(
      isCurrentEligibleEstimate(state, [
        { ...salaryItems[0], salaryAmount: '5001' },
        salaryItems[1],
      ]),
    ).toBe(false)
    expect(
      isCurrentEligibleEstimate(
        { ...state, result: { ...state.result, isEligible: false } },
        salaryItems,
      ),
    ).toBe(false)
  })

  it('normalizes English and blank backend field messages', () => {
    expect(
      normalizeProjectApiFieldErrors([
        { path: 'studentName', message: 'Required' },
        { path: 'salaryItems', message: '   ' },
      ]),
    ).toEqual([
      { path: 'studentName', message: '此欄位為必填' },
      { path: 'salaryItems', message: '此欄位的資料不正確，請重新確認' },
    ])
  })
})
