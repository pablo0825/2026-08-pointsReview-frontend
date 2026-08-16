import { getAdvisorTitle } from '../../common/components/advisor-options'
import type { PublicAdvisor } from '../../common/api/public-application.schema'
import type { CompetitionApplicationForm } from '../model/competition-application.schema'
import { awardLabels, competitionLevelLabels } from './competition-options'

type CompetitionConfirmationStepProps = {
  value: CompetitionApplicationForm
  advisor: PublicAdvisor
}

function SummarySection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 space-y-2 text-slate-700">{children}</div>
    </section>
  )
}

export function CompetitionConfirmationStep({
  value,
  advisor,
}: CompetitionConfirmationStepProps) {
  const applicant = value.participants.find(
    (participant) => participant.isApplicant,
  )
  const displayParticipants = [
    ...(applicant ? [applicant] : []),
    ...value.participants.filter((participant) => !participant.isApplicant),
  ]

  return (
    <div className="space-y-4">
      <SummarySection title="競賽內容">
        <p>
          等級：{value.competitionLevel ? competitionLevelLabels[value.competitionLevel] : '—'}
          {value.competitionLevelOther ? `（${value.competitionLevelOther}）` : ''}
        </p>
        <p>獎項：{value.award ? awardLabels[value.award] : '—'}</p>
        <p>競賽名稱：{value.competitionName}</p>
        <p>類別：{value.competitionCategory}</p>
        <p>日期：{value.competitionDate}</p>
      </SummarySection>
      <SummarySection title="參與者資料">
        <ul className="space-y-3">
          {displayParticipants.map((participant) => (
            <li
              className="rounded-lg bg-slate-50 p-3"
              key={participant.clientKey}
            >
              <p className="font-semibold text-slate-900">
                {participant.studentName}｜{participant.studentNumber}｜
                {participant.requestedPoints} 點
                {participant.isApplicant ? '（申請人）' : ''}
              </p>
              {participant.isApplicant ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p>Email：{value.applicantEmail}</p>
                  <p>電話：{value.applicantPhone}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </SummarySection>
      <SummarySection title="指導老師">
        <p>
          {advisor.name}｜{getAdvisorTitle(advisor.titleCode)}｜{advisor.department}
        </p>
      </SummarySection>
      <SummarySection title="附件">
        <ul className="list-disc space-y-1 pl-5">
          {value.attachments.map((attachment) => (
            <li className="break-all" key={attachment.clientFileKey}>
              {attachment.file.name}｜{(attachment.file.size / 1024).toFixed(1)} KB｜
              {attachment.attachmentType}
              {attachment.description ? `｜${attachment.description}` : ''}
            </li>
          ))}
        </ul>
      </SummarySection>
    </div>
  )
}
