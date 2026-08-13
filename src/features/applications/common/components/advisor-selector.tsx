import { useMemo, useState } from 'react'

import type { PublicAdvisor } from '../../competition/api/competition-application.schema'
import { getAdvisorTitle } from './advisor-options'

type AdvisorSelectorProps = {
  advisors: readonly PublicAdvisor[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function AdvisorSelector({
  advisors,
  selectedId,
  onSelect,
}: AdvisorSelectorProps) {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLocaleLowerCase('zh-TW')
  const filteredAdvisors = useMemo(
    () =>
      advisors.filter((advisor) =>
        [advisor.name, getAdvisorTitle(advisor.titleCode), advisor.department]
          .join(' ')
          .toLocaleLowerCase('zh-TW')
          .includes(normalizedSearch),
      ),
    [advisors, normalizedSearch],
  )

  return (
    <div className="space-y-4">
      <label className="block space-y-1 font-semibold">
        搜尋指導老師
        <input
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="輸入姓名、職稱或系所"
          type="search"
          value={search}
        />
      </label>
      {filteredAdvisors.length === 0 ? (
        <p role="status">找不到符合搜尋條件的老師。</p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="font-bold">選擇指導老師</legend>
          {filteredAdvisors.map((advisor) => (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3"
              key={advisor.id}
            >
              <input
                checked={selectedId === advisor.id}
                data-field-path="advisorId"
                name="advisor"
                onChange={() => onSelect(advisor.id)}
                type="radio"
              />
              <span>
                {advisor.name}｜{getAdvisorTitle(advisor.titleCode)}｜
                {advisor.department}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  )
}
