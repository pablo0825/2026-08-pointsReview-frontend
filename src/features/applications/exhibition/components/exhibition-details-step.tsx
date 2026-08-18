import type { ExhibitionPointOption, ExhibitionType } from '../api/exhibition-application.schema'
import type { ExhibitionApplicationForm } from '../model/exhibition-application.schema'
import { exhibitionNameOptions, exhibitionTypeLabels } from './exhibition-options'

type Props = {
  value: ExhibitionApplicationForm
  options: readonly ExhibitionPointOption[]
  errors: Readonly<Record<string, string | undefined>>
  onChange: <K extends keyof ExhibitionApplicationForm>(key: K, value: ExhibitionApplicationForm[K]) => void
  onTypeChange: (value: ExhibitionType) => void
}

function ErrorMessage({ message }: { message?: string }) {
  return message ? <span className="block text-sm font-semibold text-red-800">{message}</span> : null
}

const controlClass = 'min-h-11 w-full rounded-lg border border-slate-300 px-3 aria-[invalid=true]:border-red-700'

export function ExhibitionDetailsStep({ value, options, errors, onChange, onTypeChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 font-semibold">
          展覽類型
          <select aria-invalid={Boolean(errors.exhibitionType)} className={controlClass} data-field-path="exhibitionType" onChange={(event) => onTypeChange(event.target.value as ExhibitionType)} value={value.exhibitionType ?? ''}>
            <option value="">請選擇展覽類型</option>
            {options.map(({ exhibitionType }) => <option key={exhibitionType} value={exhibitionType}>{exhibitionTypeLabels[exhibitionType]}</option>)}
          </select>
          <ErrorMessage message={errors.exhibitionType} />
        </label>
        <label className="space-y-1 font-semibold">
          作品名稱
          <input aria-invalid={Boolean(errors.workName)} className={controlClass} data-field-path="workName" maxLength={255} onChange={(event) => onChange('workName', event.target.value)} value={value.workName} />
          <ErrorMessage message={errors.workName} />
        </label>
        <label className="space-y-1 font-semibold">
          展覽名稱
          <select aria-invalid={Boolean(errors.exhibitionName)} className={controlClass} data-field-path="exhibitionName" onChange={(event) => {
            const exhibitionName = event.target.value as ExhibitionApplicationForm['exhibitionName']
            onChange('exhibitionName', exhibitionName)
            if (exhibitionName !== 'other') onChange('exhibitionNameOther', null)
          }} value={value.exhibitionName ?? ''}>
            <option value="">請選擇展覽名稱</option>
            {exhibitionNameOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <ErrorMessage message={errors.exhibitionName} />
        </label>
        {value.exhibitionName === 'other' ? (
          <label className="space-y-1 font-semibold">
            其他展覽名稱
            <input aria-invalid={Boolean(errors.exhibitionNameOther)} className={controlClass} data-field-path="exhibitionNameOther" maxLength={255} onChange={(event) => onChange('exhibitionNameOther', event.target.value)} value={value.exhibitionNameOther ?? ''} />
            <ErrorMessage message={errors.exhibitionNameOther} />
          </label>
        ) : null}
        <label className="space-y-1 font-semibold">
          主辦單位
          <input aria-invalid={Boolean(errors.organizer)} className={controlClass} data-field-path="organizer" maxLength={255} onChange={(event) => onChange('organizer', event.target.value)} value={value.organizer} />
          <ErrorMessage message={errors.organizer} />
        </label>
        <label className="space-y-1 font-semibold">
          展覽場地
          <input aria-invalid={Boolean(errors.venue)} className={controlClass} data-field-path="venue" maxLength={255} onChange={(event) => onChange('venue', event.target.value)} value={value.venue} />
          <ErrorMessage message={errors.venue} />
        </label>
        <label className="space-y-1 font-semibold">
          開始日期
          <input aria-invalid={Boolean(errors.startDate)} className={controlClass} data-field-path="startDate" onChange={(event) => onChange('startDate', event.target.value)} type="date" value={value.startDate} />
          <ErrorMessage message={errors.startDate} />
        </label>
        <label className="space-y-1 font-semibold">
          結束日期
          <input aria-invalid={Boolean(errors.endDate)} className={controlClass} data-field-path="endDate" onChange={(event) => onChange('endDate', event.target.value)} type="date" value={value.endDate} />
          <ErrorMessage message={errors.endDate} />
        </label>
      </div>
    </div>
  )
}
