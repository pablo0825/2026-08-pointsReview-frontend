import type { ApiFieldError } from '../../../../shared/api/api-client'
import type { ExhibitionApplicationPayload } from '../api/exhibition-application.schema'
import type { ExhibitionApplicationForm } from './exhibition-application.schema'

export function mapExhibitionApplicationPayload(
  form: ExhibitionApplicationForm,
): ExhibitionApplicationPayload {
  const applicant = form.participants.find(({ isApplicant }) => isApplicant)
  if (!applicant || !form.advisorId || !form.exhibitionType || !form.exhibitionName) {
    throw new Error('Exhibition form is incomplete')
  }
  return {
    applicationType: 'exhibition',
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
      studentNumber: participant.studentNumber.trim().toUpperCase(),
      studentName: participant.studentName.trim(),
      requestedPoints: participant.requestedPoints,
      isApplicant: participant.isApplicant,
    })),
    attachments: form.attachments.map((attachment) => ({
      clientFileKey: attachment.clientFileKey,
      attachmentType: attachment.attachmentType,
      attachmentTypeOther: attachment.attachmentType === 'other'
        ? attachment.attachmentTypeOther?.trim() || null : null,
      description: attachment.description?.trim() || null,
    })),
    typeDetails: {
      exhibitionType: form.exhibitionType,
      workName: form.workName.trim(),
      exhibitionName: form.exhibitionName,
      exhibitionNameOther: form.exhibitionName === 'other'
        ? form.exhibitionNameOther?.trim() || null : null,
      organizer: form.organizer.trim(),
      venue: form.venue.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    },
  }
}

export function normalizeExhibitionApiFieldErrors(fields: readonly ApiFieldError[]) {
  return fields.map(({ path, message }) => ({
    path,
    message: message === 'Required' ? '此欄位為必填' : message.trim() || '此欄位的資料不正確，請重新確認',
  }))
}
