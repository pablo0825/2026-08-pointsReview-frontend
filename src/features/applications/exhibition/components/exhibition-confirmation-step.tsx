import type { PublicAdvisor } from '../../common/api/public-application.schema'
import { getAdvisorTitle } from '../../common/components/advisor-options'
import { getClassNumberLabel, getGradeLabel } from '../../common/lib/student-profile-options'
import type { ExhibitionApplicationForm } from '../model/exhibition-application.schema'
import { exhibitionAttachmentTypes, exhibitionTypeLabels, getExhibitionNameLabel } from './exhibition-options'

type Props = {
  value: ExhibitionApplicationForm
  advisor: PublicAdvisor
}

export function ExhibitionConfirmationStep({ value, advisor }: Props) {
  const participants = [...value.participants].sort((left, right) => Number(right.isApplicant) - Number(left.isApplicant))
  const attachmentLabels = new Map(exhibitionAttachmentTypes)

  return (
    <div className="space-y-6">
      <section className="space-y-3" aria-labelledby="confirm-participants">
        <h2 className="text-xl font-bold" id="confirm-participants">參與者與點數</h2>
        {participants.map((participant) => (
          <div className="rounded-lg bg-slate-50 p-3" key={participant.clientKey}>
            <p className="font-semibold">{participant.studentName}｜{participant.studentNumber}｜{getGradeLabel(participant.grade)} {getClassNumberLabel(participant.classNumber)}｜{participant.requestedPoints} 點{participant.isApplicant ? '（申請人）' : ''}</p>
            {participant.isApplicant ? <p className="text-sm text-slate-700">Email：{value.applicantEmail}<br />電話：{value.applicantPhone}</p> : null}
          </div>
        ))}
      </section>
      <section aria-labelledby="confirm-exhibition" className="space-y-3">
        <h2 className="text-xl font-bold" id="confirm-exhibition">展覽資料</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="font-bold">展覽類型</dt><dd>{value.exhibitionType ? exhibitionTypeLabels[value.exhibitionType] : '—'}</dd></div>
          <div><dt className="font-bold">作品名稱</dt><dd>{value.workName}</dd></div>
          <div><dt className="font-bold">展覽名稱</dt><dd>{value.exhibitionName === 'other' ? value.exhibitionNameOther : value.exhibitionName ? getExhibitionNameLabel(value.exhibitionName) : '—'}</dd></div>
          <div><dt className="font-bold">主辦單位</dt><dd>{value.organizer}</dd></div>
          <div><dt className="font-bold">展覽場地</dt><dd>{value.venue}</dd></div>
          <div><dt className="font-bold">展覽日期</dt><dd>{value.startDate} 至 {value.endDate}</dd></div>
        </dl>
      </section>
      <section aria-labelledby="confirm-advisor">
        <h2 className="text-xl font-bold" id="confirm-advisor">指導老師</h2>
        <p className="mt-2">{advisor.name}｜{getAdvisorTitle(advisor.titleCode)}｜{advisor.department}</p>
      </section>
      <section aria-labelledby="confirm-attachments" className="space-y-2">
        <h2 className="text-xl font-bold" id="confirm-attachments">附件</h2>
        <ul className="list-disc space-y-1 pl-5">
          {value.attachments.map((attachment) => <li key={attachment.clientFileKey}>{attachment.file.name}｜{attachmentLabels.get(attachment.attachmentType)}</li>)}
        </ul>
      </section>
    </div>
  )
}
