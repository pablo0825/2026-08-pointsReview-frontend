import type { PublicAdvisor } from '../../common/api/public-application.schema'
import { getAdvisorTitle } from '../../common/components/advisor-options'
import type { ProjectEstimateState } from '../model/project-estimate-state'
import type { ProjectParticipationForm } from '../model/project-participation.schema'

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 space-y-2 text-slate-700">{children}</div>
    </section>
  )
}

export function ProjectConfirmationStep({
  value,
  advisor,
  estimateState,
}: {
  value: ProjectParticipationForm
  advisor: PublicAdvisor
  estimateState: Extract<ProjectEstimateState, { status: 'success' }>
}) {
  return (
    <div className="space-y-4">
      <SummarySection title="計畫與薪資">
        <p>計畫名稱：{value.projectName}</p>
        <p>計畫主持人：{value.principalInvestigator}</p>
        <p className="whitespace-pre-wrap">工作內容：{value.workDescription}</p>
        <ul className="list-disc pl-5">
          {value.salaryItems.map((item) => <li key={item.clientKey}>{item.salaryMonth}｜{Number(item.salaryAmount).toLocaleString('zh-TW')} 元</li>)}
        </ul>
        <p>總薪資：{estimateState.result.totalSalary.toLocaleString('zh-TW')} 元</p>
        <p className="font-bold">預估點數：{estimateState.result.estimatedPoints} 點</p>
      </SummarySection>
      <SummarySection title="申請人資料">
        <p>{value.studentName}｜{value.studentNumber}｜{value.grade} 年級 {value.classNumber} 班</p>
        <p>Email：{value.applicantEmail}</p>
        <p>電話：{value.applicantPhone}</p>
      </SummarySection>
      <SummarySection title="指導老師">
        <p>{advisor.name}｜{getAdvisorTitle(advisor.titleCode)}｜{advisor.department}</p>
      </SummarySection>
      <SummarySection title="附件">
        <ul className="list-disc space-y-1 pl-5">
          {value.attachments.map((attachment) => (
            <li className="break-all" key={attachment.clientFileKey}>
              {attachment.file.name}｜{attachment.attachmentType}
              {attachment.description ? `｜${attachment.description}` : ''}
            </li>
          ))}
        </ul>
      </SummarySection>
    </div>
  )
}
