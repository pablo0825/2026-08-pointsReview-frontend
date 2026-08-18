import { z } from 'zod'

import { getTaipeiDateString, getTaiwanAcademicYear } from '../../../../shared/lib/academic-year'
import {
  exhibitionAttachmentTypeSchema,
  exhibitionNameSchema,
  exhibitionTypeSchema,
} from '../api/exhibition-application.schema'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9+()\- ]+$/

const participantSchema = z.object({
  clientKey: z.string().min(1),
  studentName: z.string().trim().min(1, '請輸入姓名').max(100, '姓名不可超過 100 字'),
  studentNumber: z.string().trim().min(1, '請輸入學號').max(50, '學號不可超過 50 字'),
  grade: z.number().int().min(1).max(6),
  classNumber: z.number().int().min(1).max(5),
  requestedPoints: z.string(),
  isApplicant: z.boolean(),
})

const attachmentSchema = z.object({
  clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
  file: z.instanceof(File),
  attachmentType: exhibitionAttachmentTypeSchema,
  attachmentTypeOther: z.string().max(100).nullable(),
  description: z.string().max(500).nullable(),
})

export function createExhibitionApplicationFormSchema(today = new Date()) {
  const todayString = getTaipeiDateString(today)
  return z.object({
    academicYear: z.string().min(1),
    participants: z.array(participantSchema).min(1, '至少需要一位參與者').max(15, '參與者最多 15 人'),
    applicantEmail: z.string().trim(),
    applicantPhone: z.string().trim(),
    exhibitionType: exhibitionTypeSchema.nullable(),
    workName: z.string().trim().min(1, '請輸入作品名稱').max(255, '作品名稱不可超過 255 字'),
    exhibitionName: exhibitionNameSchema.nullable(),
    exhibitionNameOther: z.string().max(255, '其他展覽名稱不可超過 255 字').nullable(),
    organizer: z.string().trim().min(1, '請輸入主辦單位').max(255, '主辦單位不可超過 255 字'),
    venue: z.string().trim().min(1, '請輸入展覽場地').max(255, '展覽場地不可超過 255 字'),
    startDate: z.string().min(1, '請選擇開始日期'),
    endDate: z.string().min(1, '請選擇結束日期'),
    advisorId: z.number().int().positive().nullable(),
    attachments: z.array(attachmentSchema).max(10, '每份申請最多 10 個附件'),
  }).superRefine((value, context) => {
    const applicants = value.participants.filter(({ isApplicant }) => isApplicant)
    if (applicants.length !== 1) {
      context.addIssue({ code: 'custom', path: ['participants', 'applicant'], message: '請指定一位參與者作為申請人' })
    }
    if (!value.applicantEmail || value.applicantEmail.length > 320 || !emailPattern.test(value.applicantEmail)) {
      context.addIssue({ code: 'custom', path: ['applicantEmail'], message: '請輸入有效的 Email' })
    }
    if (!value.applicantPhone || value.applicantPhone.length > 30 || !phonePattern.test(value.applicantPhone)) {
      context.addIssue({ code: 'custom', path: ['applicantPhone'], message: '電話格式不正確' })
    }
    const numbers = new Set<string>()
    value.participants.forEach((participant, index) => {
      const normalized = participant.studentNumber.trim().toUpperCase()
      if (normalized && numbers.has(normalized)) {
        context.addIssue({ code: 'custom', path: ['participants', index, 'studentNumber'], message: '學號不可重複' })
      }
      numbers.add(normalized)
    })
    if (value.exhibitionType === null) {
      context.addIssue({ code: 'custom', path: ['exhibitionType'], message: '請選擇展覽類型' })
    }
    if (value.exhibitionName === null) {
      context.addIssue({ code: 'custom', path: ['exhibitionName'], message: '請選擇展覽名稱' })
    } else if (value.exhibitionName === 'other' && !value.exhibitionNameOther?.trim()) {
      context.addIssue({ code: 'custom', path: ['exhibitionNameOther'], message: '請輸入其他展覽名稱' })
    } else if (value.exhibitionName !== 'other' && value.exhibitionNameOther !== null) {
      context.addIssue({ code: 'custom', path: ['exhibitionNameOther'], message: '非其他展覽時不可保留其他名稱' })
    }
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      context.addIssue({ code: 'custom', path: ['endDate'], message: '結束日期不得早於開始日期' })
    } else if (value.endDate && value.endDate > todayString) {
      context.addIssue({ code: 'custom', path: ['endDate'], message: '展覽結束日期不得晚於今天' })
    }
    if (value.advisorId === null) {
      context.addIssue({ code: 'custom', path: ['advisorId'], message: '請選擇指導老師' })
    }
    if (!value.attachments.some(({ attachmentType }) => attachmentType === 'exhibition_photo')) {
      context.addIssue({ code: 'custom', path: ['attachments'], message: '請上傳至少一張展覽照片' })
    }
  })
}

export type ExhibitionApplicationForm = z.input<ReturnType<typeof createExhibitionApplicationFormSchema>>

export function createDefaultExhibitionApplicationForm(today = new Date()): ExhibitionApplicationForm {
  return {
    academicYear: getTaiwanAcademicYear(today),
    participants: [{
      clientKey: crypto.randomUUID(), studentName: '', studentNumber: '', grade: 1,
      classNumber: 1, requestedPoints: '', isApplicant: true,
    }],
    applicantEmail: '', applicantPhone: '', exhibitionType: null, workName: '',
    exhibitionName: null, exhibitionNameOther: null, organizer: '', venue: '',
    startDate: '', endDate: '', advisorId: null, attachments: [],
  }
}
