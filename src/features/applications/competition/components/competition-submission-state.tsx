import type { CompetitionApplicationSuccessResponse } from '../api/competition-application.schema'

export function CompetitionUncertainState({
  onRetry,
  onEdit,
  pending,
}: {
  onRetry: () => void
  onEdit: () => void
  pending: boolean
}) {
  return (
    <section
      aria-labelledby="uncertain-heading"
      className="rounded-2xl border border-amber-300 bg-amber-50 p-6"
      role="alert"
    >
      <h2 className="text-xl font-bold text-amber-950" id="uncertain-heading">
        無法確認是否送件成功
      </h2>
      <p className="mt-2 text-amber-900">
        可能已經建立申請。請重新確認同一次送件，或返回修改資料後建立新的送件。
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="min-h-11 rounded-lg bg-amber-900 px-4 py-2 font-bold text-white disabled:bg-slate-400"
          disabled={pending}
          onClick={onRetry}
          type="button"
        >
          {pending ? '重新確認中…' : '重新確認送件'}
        </button>
        <button
          className="min-h-11 rounded-lg border border-amber-700 px-4 py-2 font-bold text-amber-950"
          disabled={pending}
          onClick={onEdit}
          type="button"
        >
          返回修改資料
        </button>
      </div>
    </section>
  )
}

export function CompetitionSuccessPage({
  result,
}: {
  result: CompetitionApplicationSuccessResponse['data']
}) {
  const submittedAt = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(result.submittedAt))

  return (
    <section
      aria-labelledby="success-heading"
      className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:p-8"
      role="status"
    >
      <h1 className="text-3xl font-bold text-emerald-950" id="success-heading">
        申請已成功送出
      </h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><dt className="font-bold">申請編號</dt><dd className="break-all">{result.publicId}</dd></div>
        <div><dt className="font-bold">目前狀態</dt><dd>等待指導老師簽核</dd></div>
        <div><dt className="font-bold">送件時間</dt><dd>{submittedAt}</dd></div>
      </dl>
      <p className="mt-6 text-emerald-950">
        後續狀態將寄送到申請人填寫的 Email，請留意收件匣。
      </p>
    </section>
  )
}
