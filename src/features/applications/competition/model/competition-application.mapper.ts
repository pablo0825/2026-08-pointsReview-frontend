import type { ApiFieldError } from '../../../../shared/api/api-client'
import type {
  CompetitionApplicationPayload,
} from '../api/competition-application.schema'
import type { CompetitionApplicationForm } from './competition-application.schema'

export function normalizeStudentNumber(value: string) {
  return value.trim().toUpperCase()
}

export function mapCompetitionApplicationPayload(
  form: CompetitionApplicationForm,
): CompetitionApplicationPayload {
  const applicant = form.participants.find(({ isApplicant }) => isApplicant)

  if (!applicant || !form.competitionLevel || !form.award || !form.advisorId) {
    throw new Error('Competition form is incomplete')
  }

  return {
    applicationType: 'competition',
    advisorId: form.advisorId,
    applicant: {
      name: applicant.studentName.trim(),
      email: form.applicantEmail.trim().toLowerCase(),
      phone: form.applicantPhone.trim(),
    },
    participants: form.participants.map((participant) => ({
      academicYear: form.academicYear,
      grade: Number(participant.grade),
      classNumber: Number(participant.classNumber),
      studentNumber: normalizeStudentNumber(participant.studentNumber),
      studentName: participant.studentName.trim(),
      requestedPoints: participant.requestedPoints,
      isApplicant: participant.isApplicant,
    })),
    typeDetails: {
      competitionLevel: form.competitionLevel,
      competitionLevelOther:
        form.competitionLevel === 'other'
          ? form.competitionLevelOther?.trim() || null
          : null,
      award: form.award,
      competitionName: form.competitionName.trim(),
      competitionCategory: form.competitionCategory.trim(),
      competitionDate: form.competitionDate,
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

export function mapApiFieldMessage(message: string) {
  if (message === 'Required') {
    return '此欄位為必填'
  }
  return message.trim() || '此欄位的資料不正確，請重新確認'
}

export function normalizeApiFieldErrors(fields: readonly ApiFieldError[]) {
  return fields.map(({ path, message }) => ({
    path,
    message: mapApiFieldMessage(message),
  }))
}
