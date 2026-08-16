import { z } from 'zod'

import { getTaipeiDateParts, getTaiwanAcademicYear } from '../../../../shared/lib/academic-year'
import { projectAttachmentTypeSchema } from '../api/project-participation.schema'

const phonePattern = /^[0-9+()\- ]+$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const salaryItemFormSchema = z.object({
  clientKey: z.string().min(1),
  salaryMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, '請選擇薪資月份'),
  salaryAmount: z
    .string()
    .trim()
    .min(1, '請輸入單月薪資')
    .refine((value) => /^\d+$/.test(value), '單月薪資必須是整數')
    .refine((value) => {
      const amount = Number(value)
      return Number.isSafeInteger(amount) && amount >= 1 && amount <= 50_000
    }, '單月薪資必須介於 1 至 50,000 元'),
})

const projectAttachmentFormSchema = z.object({
  clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
  file: z.instanceof(File),
  attachmentType: projectAttachmentTypeSchema,
  attachmentTypeOther: z
    .string()
    .max(100, '其他附件類型不可超過 100 字')
    .nullable(),
  description: z.string().max(500, '附件說明不可超過 500 字').nullable(),
})

function taipeiMonth(date: Date) {
  const { year, month } = getTaipeiDateParts(date)
  return `${year}-${String(month).padStart(2, '0')}`
}

export function createProjectParticipationFormSchema(today = new Date()) {
  const currentMonth = taipeiMonth(today)

  return z
    .object({
      academicYear: z.string().min(1),
      projectName: z
        .string()
        .trim()
        .min(1, '請輸入計畫名稱')
        .max(255, '計畫名稱不可超過 255 字'),
      principalInvestigator: z
        .string()
        .trim()
        .min(1, '請輸入計畫主持人')
        .max(100, '計畫主持人不可超過 100 字'),
      workDescription: z
        .string()
        .trim()
        .min(1, '請輸入工作內容')
        .max(1_000, '工作內容不可超過 1,000 字'),
      salaryItems: z
        .array(salaryItemFormSchema)
        .min(1, '至少需要一筆薪資月份')
        .max(12, '每份申請最多填寫 12 個薪資月份'),
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
      applicantEmail: z.string().trim(),
      applicantPhone: z.string().trim(),
      advisorId: z.number().int().positive().nullable(),
      attachments: z
        .array(projectAttachmentFormSchema)
        .max(10, '每份申請最多 10 個附件'),
    })
    .superRefine((value, context) => {
      const seenMonths = new Set<string>()
      value.salaryItems.forEach((item, index) => {
        if (item.salaryMonth > currentMonth) {
          context.addIssue({
            code: 'custom',
            path: ['salaryItems', index, 'salaryMonth'],
            message: '薪資月份不可晚於目前月份。',
          })
        }
        if (seenMonths.has(item.salaryMonth)) {
          context.addIssue({
            code: 'custom',
            path: ['salaryItems', index, 'salaryMonth'],
            message: '薪資月份不可重複。',
          })
        }
        if (item.salaryMonth) seenMonths.add(item.salaryMonth)
      })

      if (
        !value.applicantEmail ||
        value.applicantEmail.length > 320 ||
        !emailPattern.test(value.applicantEmail)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['applicantEmail'],
          message: value.applicantEmail ? '請輸入有效的 Email' : '請輸入申請人 Email',
        })
      }

      if (
        !value.applicantPhone ||
        value.applicantPhone.length > 30 ||
        !phonePattern.test(value.applicantPhone)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['applicantPhone'],
          message: value.applicantPhone ? '電話格式不正確' : '請輸入申請人電話',
        })
      }

      if (value.advisorId === null) {
        context.addIssue({
          code: 'custom',
          path: ['advisorId'],
          message: '請選擇指導老師',
        })
      }

      if (!value.attachments.some(({ attachmentType }) => attachmentType === 'salary_proof')) {
        context.addIssue({
          code: 'custom',
          path: ['attachments'],
          message: '請至少上傳一份薪資證明',
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

export type ProjectParticipationForm = z.input<
  ReturnType<typeof createProjectParticipationFormSchema>
>

export function createDefaultProjectParticipationForm(
  today = new Date(),
): ProjectParticipationForm {
  return {
    academicYear: getTaiwanAcademicYear(today),
    projectName: '',
    principalInvestigator: '',
    workDescription: '',
    salaryItems: [
      {
        clientKey: crypto.randomUUID(),
        salaryMonth: '',
        salaryAmount: '',
      },
    ],
    studentName: '',
    studentNumber: '',
    grade: 1,
    classNumber: 1,
    applicantEmail: '',
    applicantPhone: '',
    advisorId: null,
    attachments: [],
  }
}
