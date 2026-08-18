import {
  createDefaultExhibitionApplicationForm,
  createExhibitionApplicationFormSchema,
} from './exhibition-application.schema'
import { mapExhibitionApplicationPayload } from './exhibition-application.mapper'
import {
  buildExhibitionPointOptionLookup,
  clearExhibitionParticipantPoints,
  isAllowedExhibitionPoint,
} from './exhibition-points'

describe('exhibition application model', () => {
  it('starts with one applicant and maps normalized wire values', () => {
    const form = createDefaultExhibitionApplicationForm(new Date('2026-08-18T00:00:00Z'))
    expect(form.participants).toEqual([
      expect.objectContaining({ isApplicant: true, requestedPoints: '' }),
    ])
    Object.assign(form, {
      applicantEmail: ' STUDENT@EXAMPLE.COM ', applicantPhone: ' 0912345678 ',
      exhibitionType: 'project_work', workName: ' 作品 ',
      exhibitionName: 'other', exhibitionNameOther: ' 自辦成果展 ',
      organizer: ' 主辦 ', venue: ' 場地 ', startDate: '2026-07-01',
      endDate: '2026-07-05', advisorId: 10,
    })
    Object.assign(form.participants[0], {
      studentName: ' 測試學生 ', studentNumber: ' 4a0x0001 ', requestedPoints: '1.00',
    })
    form.attachments = [{
      clientFileKey: 'photo-1',
      file: new File(['photo'], 'photo.png', { type: 'image/png' }),
      attachmentType: 'exhibition_photo', attachmentTypeOther: null, description: ' ',
    }]

    expect(mapExhibitionApplicationPayload(form)).toMatchObject({
      applicant: { name: '測試學生', email: 'student@example.com' },
      participants: [{ academicYear: '115', studentNumber: '4A0X0001' }],
      typeDetails: { workName: '作品', exhibitionNameOther: '自辦成果展' },
      attachments: [{ description: null }],
    })
  })

  it('validates dates, duplicate students, other name, and required photo', () => {
    const form = createDefaultExhibitionApplicationForm(new Date('2026-08-18T00:00:00Z'))
    Object.assign(form, {
      applicantEmail: 'student@example.com', applicantPhone: '0912345678',
      exhibitionType: 'fan_work', workName: '作品', exhibitionName: 'other',
      exhibitionNameOther: ' ', organizer: '主辦', venue: '場地',
      startDate: '2026-08-20', endDate: '2026-08-19', advisorId: 10,
    })
    Object.assign(form.participants[0], {
      studentName: '甲', studentNumber: 'A001', requestedPoints: '0.50',
    })
    form.participants.push({ ...form.participants[0], clientKey: 'two', studentNumber: ' a001 ', isApplicant: false })

    const result = createExhibitionApplicationFormSchema(new Date('2026-08-18T00:00:00Z')).safeParse(form)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path.join('.'))).toEqual(expect.arrayContaining([
        'participants.1.studentNumber', 'exhibitionNameOther', 'endDate', 'attachments',
      ]))
    }
  })

  it('uses API point options and clears every participant point', () => {
    const lookup = buildExhibitionPointOptionLookup([
      { exhibitionType: 'fan_work', allowedPointsPerPerson: ['0.50', '1.00'] },
    ])
    expect(isAllowedExhibitionPoint(lookup, 'fan_work', '0.50')).toBe(true)
    expect(isAllowedExhibitionPoint(lookup, 'fan_work', '0.75')).toBe(false)
    expect(clearExhibitionParticipantPoints([
      { studentName: '甲', requestedPoints: '0.50' },
      { studentName: '乙', requestedPoints: '1.00' },
    ])).toEqual([
      { studentName: '甲', requestedPoints: '' },
      { studentName: '乙', requestedPoints: '' },
    ])
  })
})
