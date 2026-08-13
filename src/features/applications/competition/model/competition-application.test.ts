import { competitionPointOptions } from '../../../../test/fixtures/competition-application'
import {
  createCompetitionApplicationFormSchema,
  createDefaultCompetitionApplicationForm,
} from './competition-application.schema'
import {
  mapApiFieldMessage,
  mapCompetitionApplicationPayload,
  normalizeStudentNumber,
} from './competition-application.mapper'
import {
  buildPointOptionLookup,
  getCompetitionParticipantLimit,
  getSharedAllocation,
  resetParticipantPoints,
} from './competition-points'

describe('competition application model', () => {
  it('normalizes student numbers and maps wire values', () => {
    expect(normalizeStudentNumber(' 4a0x0001 ')).toBe('4A0X0001')

    const form = createDefaultCompetitionApplicationForm(
      new Date('2026-08-13T00:00:00Z'),
    )
    Object.assign(form, {
      applicantEmail: ' STUDENT@EXAMPLE.COM ',
      applicantPhone: ' 0912-345-678 ',
      competitionLevel: 'national_integrated',
      award: 'finalist',
      competitionName: ' 測試競賽 ',
      competitionCategory: ' 設計組 ',
      competitionDate: '2005-01-01',
      advisorId: 10,
    })
    Object.assign(form.participants[0], {
      studentName: ' 測試學生 ',
      studentNumber: ' 4a0x0001 ',
      requestedPoints: '3.00',
      isApplicant: true,
    })
    form.attachments = [
      {
        clientFileKey: 'attachment-1',
        file: new File(['proof'], 'proof.pdf', { type: 'application/pdf' }),
        attachmentType: 'participation_proof',
        attachmentTypeOther: null,
        description: '   ',
      },
    ]

    expect(mapCompetitionApplicationPayload(form)).toMatchObject({
      applicant: {
        name: '測試學生',
        email: 'student@example.com',
        phone: '0912-345-678',
      },
      participants: [{ studentNumber: '4A0X0001' }],
      attachments: [{ description: null }],
    })
  })

  it('rejects future dates and normalized duplicate student numbers', () => {
    const form = createDefaultCompetitionApplicationForm(
      new Date('2026-08-13T00:00:00Z'),
    )
    form.participants[0].studentName = '甲'
    form.participants[0].studentNumber = '4A0X0001'
    form.participants.push({
      ...form.participants[0],
      clientKey: 'second',
      studentNumber: ' 4a0x0001 ',
      studentName: '乙',
      isApplicant: false,
    })
    Object.assign(form, {
      applicantEmail: 'student@example.com',
      applicantPhone: '0912345678',
      competitionLevel: 'national_integrated',
      award: 'finalist',
      competitionName: '競賽',
      competitionCategory: '組別',
      competitionDate: '2026-08-14',
      advisorId: 10,
    })

    const result = createCompetitionApplicationFormSchema(
      new Date('2026-08-13T00:00:00Z'),
    ).safeParse(form)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path.join('.'))).toEqual(
        expect.arrayContaining([
          'participants.1.studentNumber',
          'competitionDate',
          'attachments',
        ]),
      )
    }
  })

  it('resets and validates both point allocation methods', () => {
    const lookup = buildPointOptionLookup(competitionPointOptions)
    const perPerson = lookup.get('national_integrated:finalist')!
    const shared = lookup.get('national_integrated:first_place')!
    const participants = [
      { requestedPoints: '9.00' },
      { requestedPoints: '8.00' },
    ]

    expect(resetParticipantPoints(participants, perPerson)).toEqual([
      { requestedPoints: '3.00' },
      { requestedPoints: '3.00' },
    ])
    expect(resetParticipantPoints(participants, shared)).toEqual([
      { requestedPoints: '0.50' },
      { requestedPoints: '0.50' },
    ])
    expect(getSharedAllocation(['20.00', '40.00'], shared)).toEqual({
      allocated: '60.00',
      remaining: '0.00',
      isBalanced: true,
    })
    expect(getCompetitionParticipantLimit(shared)).toBe(10)
    expect(resetParticipantPoints([{ requestedPoints: '0.50' }], shared)).toEqual([
      { requestedPoints: '60.00' },
    ])
  })

  it('normalizes conditional other values and accepts historical dates', () => {
    const form = createDefaultCompetitionApplicationForm(
      new Date('2026-08-13T00:00:00Z'),
    )
    Object.assign(form, {
      applicantEmail: 'student@example.com',
      applicantPhone: '+886 912-345-678',
      competitionLevel: 'other',
      competitionLevelOther: ' 校級競賽 ',
      award: 'participation',
      competitionName: ' 競賽 ',
      competitionCategory: ' A 組 ',
      competitionDate: '2005-01-01',
      advisorId: 10,
    })
    Object.assign(form.participants[0], {
      studentName: '王小明',
      studentNumber: 'a001',
      requestedPoints: '1.00',
      isApplicant: true,
    })
    form.attachments = [
      {
        clientFileKey: 'other-proof',
        file: new File(['proof'], 'proof.png', { type: 'image/png' }),
        attachmentType: 'participation_proof',
        attachmentTypeOther: null,
        description: ' 說明 ',
      },
    ]

    expect(createCompetitionApplicationFormSchema().safeParse(form).success).toBe(true)
    expect(mapCompetitionApplicationPayload(form)).toMatchObject({
      typeDetails: {
        competitionLevelOther: '校級競賽',
        competitionDate: '2005-01-01',
      },
      attachments: [{ description: '說明' }],
    })
  })

  it('provides the required Chinese field fallback', () => {
    expect(mapApiFieldMessage('Required')).toBe('此欄位為必填')
    expect(mapApiFieldMessage('')).toBe('此欄位的資料不正確，請重新確認')
  })
})
