import type { ApiFieldError } from '../../../../shared/api/api-client'
import type { ProjectParticipationApplicationPayload } from '../api/project-participation.schema'
import type { ProjectParticipationForm } from './project-participation.schema'
import { mapSalaryItemsRequest } from './project-estimate-state'

export function normalizeProjectStudentNumber(value: string) {
  return value.trim().toUpperCase()
}

export function mapProjectParticipationApplicationPayload(
  form: ProjectParticipationForm,
  estimatedPoints: string,
): ProjectParticipationApplicationPayload {
  if (!form.advisorId) {
    throw new Error('Project participation form is incomplete')
  }

  return {
    applicationType: 'project_participation',
    advisorId: form.advisorId,
    applicant: {
      name: form.studentName.trim(),
      email: form.applicantEmail.trim().toLowerCase(),
      phone: form.applicantPhone.trim(),
    },
    participants: [
      {
        academicYear: form.academicYear,
        grade: Number(form.grade),
        classNumber: Number(form.classNumber),
        studentNumber: normalizeProjectStudentNumber(form.studentNumber),
        studentName: form.studentName.trim(),
        requestedPoints: estimatedPoints,
        isApplicant: true,
      },
    ],
    typeDetails: {
      projectName: form.projectName.trim(),
      principalInvestigator: form.principalInvestigator.trim(),
      workDescription: form.workDescription.trim(),
      salaryItems: mapSalaryItemsRequest(form.salaryItems),
    },
    attachments: form.attachments.map((attachment) => ({
      clientFileKey: attachment.clientFileKey,
      attachmentType: attachment.attachmentType,
      attachmentTypeOther:
        attachment.attachmentType === 'other'
          ? attachment.attachmentTypeOther?.trim() || null
          : null,
      description: attachment.description?.trim() || null,
    })),
  }
}

export function normalizeProjectApiFieldErrors(
  fields: readonly ApiFieldError[],
) {
  return fields.map(({ path, message }) => ({
    path,
    message:
      message === 'Required'
        ? '此欄位為必填'
        : message.trim() || '此欄位的資料不正確，請重新確認',
  }))
}
