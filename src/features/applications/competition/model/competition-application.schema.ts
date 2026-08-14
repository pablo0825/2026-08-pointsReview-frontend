import { z } from 'zod'

import { getTaipeiDateString, getTaiwanAcademicYear } from '../../../../shared/lib/academic-year'
import {
  attachmentTypeSchema,
  awardSchema,
  competitionLevelSchema,
} from '../api/competition-application.schema'

const phonePattern = /^[0-9+()\- ]+$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const participantSchema = z.object({
  clientKey: z.string().min(1),
  studentName: z
    .string()
    .trim()
    .min(1, '請輸入姓名')
    .max(100, '姓名不可超過 100 字'),
  studentNumber: z
    .string()
    .trim()
    .min(1, '請輸入學號')
    .max(50, '學號不可超過 50 字'),
  grade: z.number().int().min(1).max(6),
  classNumber: z.number().int().min(1).max(5),
  requestedPoints: z
    .string()
    .regex(/^\d+\.\d{2}$/, '點數格式必須包含兩位小數'),
  isApplicant: z.boolean(),
})

const attachmentSchema = z.object({
  clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
  file: z.instanceof(File),
  attachmentType: attachmentTypeSchema,
  attachmentTypeOther: z
    .string()
    .max(100, '其他附件類型不可超過 100 字')
    .nullable(),
  description: z.string().max(500, '附件說明不可超過 500 字').nullable(),
})

export function createCompetitionApplicationFormSchema(today = new Date()) {
  const todayString = getTaipeiDateString(today)

  return z
    .object({
      academicYear: z.string().min(1),
      participants: z
        .array(participantSchema)
        .min(1, '至少需要一位參與者')
        .max(10, '參與者最多 10 人'),
      applicantEmail: z.string().trim(),
      applicantPhone: z.string().trim(),
      competitionLevel: competitionLevelSchema.nullable(),
      competitionLevelOther: z
        .string()
        .max(100, '其他競賽等級不可超過 100 字')
        .nullable(),
      award: awardSchema.nullable(),
      competitionName: z
        .string()
        .trim()
        .min(1, '請輸入競賽名稱')
        .max(255, '競賽名稱不可超過 255 字'),
      competitionCategory: z
        .string()
        .trim()
        .min(1, '請輸入競賽類別')
        .max(100, '競賽類別不可超過 100 字'),
      competitionDate: z.string().min(1, '請選擇競賽日期'),
      advisorId: z.number().int().positive().nullable(),
      attachments: z
        .array(attachmentSchema)
        .max(10, '每份申請最多 10 個附件'),
    })
    .superRefine((value, context) => {
      const applicants = value.participants.filter(({ isApplicant }) => isApplicant)
      if (applicants.length !== 1) {
        context.addIssue({
          code: 'custom',
          path: ['participants', 'applicant'],
          message: '請先選擇一位參與者作為申請人。',
        })
      } else {
        if (!value.applicantEmail) {
          context.addIssue({
            code: 'custom',
            path: ['applicantEmail'],
            message: '請輸入申請人 Email',
          })
        } else if (
          value.applicantEmail.length > 320 ||
          !emailPattern.test(value.applicantEmail)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['applicantEmail'],
            message: '請輸入有效的 Email',
          })
        }

        if (!value.applicantPhone) {
          context.addIssue({
            code: 'custom',
            path: ['applicantPhone'],
            message: '請輸入申請人電話',
          })
        } else if (
          value.applicantPhone.length > 30 ||
          !phonePattern.test(value.applicantPhone)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['applicantPhone'],
            message: '電話格式不正確',
          })
        }
      }

      if (value.competitionLevel === null) {
        context.addIssue({
          code: 'custom',
          path: ['competitionLevel'],
          message: '請選擇競賽等級',
        })
      }

      if (value.award === null) {
        context.addIssue({
          code: 'custom',
          path: ['award'],
          message: '請選擇獎項',
        })
      }

      const normalizedNumbers = new Map<string, number>()
      value.participants.forEach((participant, index) => {
        const normalized = participant.studentNumber.trim().toUpperCase()
        if (normalizedNumbers.has(normalized)) {
          context.addIssue({
            code: 'custom',
            path: ['participants', index, 'studentNumber'],
            message: '學號不可重複',
          })
        } else if (normalized) {
          normalizedNumbers.set(normalized, index)
        }
      })

      if (value.competitionLevel === 'other') {
        if (!value.competitionLevelOther?.trim()) {
          context.addIssue({
            code: 'custom',
            path: ['competitionLevelOther'],
            message: '請輸入其他競賽等級',
          })
        }
      } else if (value.competitionLevelOther !== null) {
        context.addIssue({
          code: 'custom',
          path: ['competitionLevelOther'],
          message: '非其他等級時不可保留其他名稱',
        })
      }

      if (value.competitionDate && value.competitionDate > todayString) {
        context.addIssue({
          code: 'custom',
          path: ['competitionDate'],
          message: '競賽日期不得晚於今天',
        })
      }

      if (value.advisorId === null) {
        context.addIssue({
          code: 'custom',
          path: ['advisorId'],
          message: '請選擇指導老師',
        })
      }

      const hasRequiredAttachment = value.attachments.some(({ attachmentType }) =>
        ['participation_proof', 'finalist_or_award_certificate'].includes(
          attachmentType,
        ),
      )
      if (!hasRequiredAttachment) {
        context.addIssue({
          code: 'custom',
          path: ['attachments'],
          message: '請上傳參賽證明或入圍／獎狀',
        })
      }

      value.attachments.forEach((attachment, index) => {
        if (
          attachment.attachmentType === 'other' &&
          !attachment.attachmentTypeOther?.trim()
        ) {
          context.addIssue({
            code: 'custom',
            path: ['attachments', index, 'attachmentTypeOther'],
            message: '請輸入其他附件類型',
          })
        }
      })
    })
}

export type CompetitionApplicationForm = z.input<
  ReturnType<typeof createCompetitionApplicationFormSchema>
>

export function createDefaultCompetitionApplicationForm(
  today = new Date(),
): CompetitionApplicationForm {
  return {
    academicYear: getTaiwanAcademicYear(today),
    participants: [
      {
        clientKey: crypto.randomUUID(),
        studentName: '',
        studentNumber: '',
        grade: 1,
        classNumber: 1,
        requestedPoints: '0.00',
        isApplicant: false,
      },
    ],
    applicantEmail: '',
    applicantPhone: '',
    competitionLevel: null,
    competitionLevelOther: null,
    award: null,
    competitionName: '',
    competitionCategory: '',
    competitionDate: '',
    advisorId: null,
    attachments: [],
  }
}
