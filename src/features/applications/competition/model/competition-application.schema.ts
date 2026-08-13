import { z } from 'zod'

import { getTaipeiDateString, getTaiwanAcademicYear } from '../../../../shared/lib/academic-year'
import {
  attachmentTypeSchema,
  awardSchema,
  competitionLevelSchema,
} from '../api/competition-application.schema'

const phonePattern = /^[0-9+()\- ]+$/

const participantSchema = z.object({
  clientKey: z.string().min(1),
  studentName: z.string().trim().min(1, '請輸入姓名').max(100),
  studentNumber: z.string().trim().min(1, '請輸入學號').max(50),
  grade: z.coerce.number().int().min(1).max(6),
  classNumber: z.coerce.number().int().min(1).max(5),
  requestedPoints: z.string().regex(/^\d+\.\d{2}$/),
  isApplicant: z.boolean(),
})

const attachmentSchema = z.object({
  clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
  file: z.instanceof(File),
  attachmentType: attachmentTypeSchema,
  attachmentTypeOther: z.string().max(100).nullable(),
  description: z.string().max(500).nullable(),
})

export function createCompetitionApplicationFormSchema(today = new Date()) {
  const todayString = getTaipeiDateString(today)

  return z
    .object({
      academicYear: z.string().min(1),
      participants: z.array(participantSchema).min(1).max(10),
      applicantEmail: z.string().trim().email('請輸入有效的 Email').max(320),
      applicantPhone: z
        .string()
        .trim()
        .min(1, '請輸入電話')
        .max(30)
        .regex(phonePattern, '電話格式不正確'),
      competitionLevel: competitionLevelSchema.nullable(),
      competitionLevelOther: z.string().max(100).nullable(),
      award: awardSchema.nullable(),
      competitionName: z.string().trim().min(1, '請輸入競賽名稱').max(255),
      competitionCategory: z.string().trim().min(1, '請輸入競賽類別').max(100),
      competitionDate: z.string().min(1, '請選擇競賽日期'),
      advisorId: z.number().int().positive().nullable(),
      attachments: z.array(attachmentSchema).max(10),
    })
    .superRefine((value, context) => {
      const applicants = value.participants.filter(({ isApplicant }) => isApplicant)
      if (applicants.length !== 1) {
        context.addIssue({
          code: 'custom',
          path: ['participants'],
          message: '請指定一位申請人',
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
        isApplicant: true,
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
