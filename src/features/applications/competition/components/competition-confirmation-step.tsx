import { getAdvisorTitle } from '../../common/components/advisor-options'
import type { PublicAdvisor } from '../api/competition-application.schema'
import type { CompetitionApplicationForm } from '../model/competition-application.schema'
import { awardLabels, competitionLevelLabels } from './competition-options'

type CompetitionConfirmationStepProps = {
  value: CompetitionApplicationForm
  advisor: PublicAdvisor
  allocationLabel: string
  onEdit: (step: number) => void
}

function SummarySection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          className="min-h-11 rounded-lg px-3 font-bold text-blue-800 underline"
          onClick={() => onEdit(step)}
          type="button"
        >
          修改
        </button>
      </div>
      <div className="mt-3 space-y-2 text-slate-700">{children}</div>
    </section>
  )
}

export function CompetitionConfirmationStep({
  value,
  advisor,
  allocationLabel,
  onEdit,
}: CompetitionConfirmationStepProps) {
  return (
    <div className="space-y-4">
      <SummarySection onEdit={onEdit} step={0} title="申請人與參與者">
        <p>學年度：{value.academicYear}</p>
        <p>Email：{value.applicantEmail}</p>
        <p>電話：{value.applicantPhone}</p>
        <ul className="list-disc space-y-1 pl-5">
          {value.participants.map((participant) => (
            <li key={participant.clientKey}>
              {participant.studentName}｜{participant.studentNumber}｜
              {participant.requestedPoints} 點
              {participant.isApplicant ? '（申請人）' : ''}
            </li>
          ))}
        </ul>
      </SummarySection>
      <SummarySection onEdit={onEdit} step={1} title="競賽資料">
        <p>
          等級：{value.competitionLevel ? competitionLevelLabels[value.competitionLevel] : '—'}
          {value.competitionLevelOther ? `（${value.competitionLevelOther}）` : ''}
        </p>
        <p>獎項：{value.award ? awardLabels[value.award] : '—'}</p>
        <p>競賽名稱：{value.competitionName}</p>
        <p>類別：{value.competitionCategory}</p>
        <p>日期：{value.competitionDate}</p>
        <p>分配方式：{allocationLabel}</p>
      </SummarySection>
      <SummarySection onEdit={onEdit} step={2} title="指導老師">
        <p>
          {advisor.name}｜{getAdvisorTitle(advisor.titleCode)}｜{advisor.department}
        </p>
      </SummarySection>
      <SummarySection onEdit={onEdit} step={3} title="附件">
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
