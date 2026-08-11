# FS-002 — Published Instructions Plan

## Document Information

- Feature Slice: `FS-002`
- Change Type: `feature`
- Document Status: `approved`
- Based On Spec: `docs/specs/FS-002/FS-002-published-instructions-spec.md`
- Spec Last Updated: `2026-08-11`
- Created: `2026-08-11`
- Last Updated: `2026-08-11`

## Goal

重用既有公開頁骨架、Router 與 Query Provider，建立 `/rules` 每個申請類型只查詢一次所有公開學年度 sections，再以前端所選學年度篩選安全 Markdown 文章、目錄與頁內錨點，並以元件、整合及 Chromium browser tests 驗證單次查詢、類型隔離、安全性、年度切換、鍵盤操作與 360px 版面。

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-002/FS-002-published-instructions-spec.md`

## Scope

### Included

- 安裝安全 Markdown、GFM、HTML 解析／清理與 heading slug 所需的最小依賴。
- 建立第一個實際 API consumer 所需的共用 JSON GET client、安全錯誤正規化與 response envelope 驗證邊界。
- 建立 feature-local 的公開申請辦法 section 陣列 wire schema、保留 API 陣列順序的 mapper、支援申請類型與選填學年度的 query function，以及目前臺灣學年度 helper；頁面 query key 只使用申請類型並省略 `academicYear`。
- 建立 MSW server lifecycle、公開申請辦法 fixture 與 handlers，供 component／integration tests 使用。
- 建立安全 Markdown renderer、同頁唯一 heading anchors、目錄與文章連結安全行為。
- 以正式頁面取代 `/rules` placeholder，以四個固定文案的大型按鈕完成初始未選擇狀態，並涵蓋選擇前零 request、每個申請類型單次 request、前端學年度篩選、loading、empty、error、success、retry、鍵盤、輔助科技與 360px 狀態。
- 建立單元、元件／整合及 Chromium Playwright tests。

### Excluded

- 管理員建立、編輯、預覽、發布、顯示或隱藏申請辦法。
- 登入、Authentication Context、角色權限或受保護 route。
- 申請表單、點數規則、公開點數或其他 Feature Slice 的 API 與 UI。
- 完整 Design System、通用 Markdown CMS framework 或尚未有第二個 consumer 的抽象。
- 真實後端資料建置與部署；其整合由 Human Integration 提供環境及測試內容。

## Current Implementation Assessment

### Existing Behavior

- `/rules` 正式頁面、資料層、安全 Markdown、目錄、所有狀態及自動化測試均已完成先前核准版本。
- 選定申請類型後，目前同時查詢省略 `academicYear` 的所有年度資料與提供目前年度的資料，因此初次會發送兩個 request。
- 切換學年度時，目前會再發送提供 `academicYear` 的 request，而不是使用第一次已取得的所有年度資料。
- 既有 API query function 已支援省略 `academicYear`，不需要修改後端契約或共用 API client。

### Reusable Components

- `src/app/layouts/public-layout.tsx`：重用公開導覽、skip link、main content 與響應式頁面骨架，不修改其導覽資訊架構。
- `src/app/providers/app-providers.tsx`：重用既有 Query Client；修訂後以申請類型隔離所有年度 Response 快取。
- `src/features/rules/api/published-instructions.query.ts`：重用既有省略 `academicYear` 的 query key 與 abortable query function。
- `src/app/styles/global.css`：重用 Tailwind 入口與全域 focus 基礎；文章視覺原則上以 feature component utilities 表達。
- `src/test/setup.ts`：重用現有嚴格 MSW lifecycle。

### Integration Points

- `GET /public/application-instructions`：必須提供 `applicationType`；省略 `academicYear` 時取得該類型所有公開學年度 sections，提供時只取得指定年度；後端依 `displayOrder` 升冪排列，前端保留 API 陣列順序；`HTTP 200 OK` 與 `{ "data": [] }` 映射為 empty state，不當成 `404` 或 failure。
- 公開端點由後端限制 `status = published`、`isVisible = true` 與 `effectiveFrom` 不晚於 Asia/Taipei 當日；Response 不含前兩個管理欄位，前端不重複判斷。後端目前不以 `effectiveTo` 排除內容，前端也不自行過濾 API 已回傳的 section。
- `src/app/providers/app-providers.tsx`：頁面使用 TanStack Query 管理每個申請類型的所有年度 server state 與取消訊號；年度選擇維持本地 UI state。
- `src/app/router/router.tsx`：將 `PublishedInstructionsPage` 掛載至 `/rules`。
- `src/test/setup.ts`：測試前啟動 MSW、測試後重設 handlers、全部完成後關閉 server，且未處理 request 視為錯誤。
- `docs/project/frontend-architecture.md`：feature-local ownership、API client、安全 Markdown、Query 與 Tailwind 限制。
- `docs/project/testing-strategy.md`：schema、日期、MSW、Sanitizer、360px 與 browser verification 分層。

### Gaps Against Spec

- `PublishedInstructionsPage` 目前以兩個 queries 分別取得所有年度及指定年度，違反修訂後每個申請類型只查詢一次的要求。
- 年度切換目前產生新的 request；修訂後應由前端對已驗證的目前類型 Response 篩選 matching sections。
- 現有 component 與 Playwright tests 驗證年度 request，需改為斷言類型選擇恰好一個 request、年度切換零新增 request。

### Preserved Behavior

- `/` 仍導向 `/apply`；`/apply` 四個申請入口與目的 route placeholders 保持不變。
- Public Layout 的「開始申請」、「申請辦法」、active state、skip link 與窄螢幕排列保持可用。
- Route Error Boundary、Query Provider、Tailwind 基礎與現有 scripts 保持可建置及通過既有測試。
- `/rules` 維持公開且不需登入。

### Regression Risks

- Router test 與 application-entry Playwright 目前依賴 `/rules` placeholder，替換後若未同步調整會造成既有驗證回歸。
- 將 MSW 設為未處理 request 錯誤可能暴露既有測試的隱性網路存取；需確認所有測試保持離線且 handlers 可局部覆寫。
- 新增共用 API client 會成為後續 Feature 的整合邊界；本 Slice 只建立已實際使用的 GET JSON、envelope 與安全錯誤能力，避免預建 mutation／CSRF／multipart。
- Markdown heading 重複、非 ASCII 文字與危險連結容易造成錯誤錨點或安全缺口，需以 renderer 單元／元件測試保護。

### Compatibility / Migration

- `not-applicable`；不遷移既有資料。`/rules` URL 不變，只以正式頁面取代 placeholder。

### Constraints

- 使用 React、TypeScript、React Router、TanStack Query、Zod、Tailwind CSS、Vitest、Testing Library、MSW 與 Playwright。
- 申請類型控制項使用四個原生大型按鈕與固定文案，不為此控制項新增 UI library。
- API base URL 必須由 Vite environment 設定取得；所有 request 使用 `credentials: "include"` 並支援 `AbortSignal`。
- Wire model 與 page view model 分離；不使用 TypeScript assertion 略過未知 response 的 runtime validation。
- `applicationType` wire schema 固定為 `competition`、`project_participation`、`certificate` 與 `exhibition`。
- Markdown 必須經 HTML allowlist sanitizer，禁止 script、event handlers 與危險 URL；heading IDs 必須穩定且同頁唯一。
- 使用 Mobile First utilities；只在 Markdown 內容行為無法合理由局部 utilities 表達時建立 feature-local CSS。
- 公開頁最低支援 360px、鍵盤與基本螢幕閱讀器行為；主要互動目標至少 44×44px。
- 不記錄 response body、內部錯誤、token 或其他敏感資訊。
- `FS-002` 沒有 blueprint dependency；公開端點的排序、empty、visibility 與日期契約皆已確認。

### Unknowns

- `none`

## Files

### Create

- `src/shared/api/api-client.ts`：已使用到的 JSON GET、base URL、credentials、AbortSignal、envelope 與安全錯誤邊界。
- `src/shared/api/api-client.test.ts`：成功、HTTP 錯誤、無效 body、AbortSignal 與不暴露內部訊息的測試。
- `src/features/rules/api/published-instructions.schema.ts`：含 section 欄位的正式陣列 wire response Zod schema。
- `src/features/rules/api/published-instructions.mapper.ts`：section wire data 至申請類型／年度頁面 view model 的明確轉換，並保留 API 陣列順序。
- `src/features/rules/api/published-instructions.query.ts`：包含必填申請類型與選填學年度的 query key 及 abortable query function。
- `src/features/rules/api/published-instructions.test.ts`：query parameters、section schema、API 順序保留、`HTTP 200 OK` 空陣列、已超過 `effectiveTo` 但仍回傳的內容、成功、error 與 contract failure 測試。
- `src/features/rules/lib/academic-year.ts`：目前臺灣學年度與 API 格式 helper。
- `src/features/rules/lib/academic-year.test.ts`：8 月 1 日分界與格式案例。
- `src/features/rules/components/instructions-article.tsx`：安全 Markdown、heading anchors、目錄與文章連結。
- `src/features/rules/components/instructions-article.test.tsx`：標題、重複／非 ASCII heading、目錄與惡意內容測試。
- `src/features/rules/published-instructions-page.tsx`：申請類型單次 query、前端年度篩選與所有 query states 的頁面組合。
- `src/features/rules/published-instructions-page.test.tsx`：驗證標題、四個固定文案按鈕與順序，以及 MSW 初始零 request、每個類型恰好一個 request、年度切換零新增 request、類型隔離、loading、`HTTP 200 OK` 空陣列的 empty state、error、retry、success 與 stale result 防護。
- `src/test/server.ts`：共用 MSW Node server。
- `src/test/handlers/public-application-instructions.ts`：預設公開辦法 handler，以及 `HTTP 200 OK` 空陣列與錯誤情境的測試覆寫 helpers。
- `src/test/fixtures/published-instructions.ts`：不含真實個資且通過正式 schema 的不同申請類型、目前／歷史年度、多 section 與已超過 `effectiveTo` 但仍回傳的 fixtures。
- `e2e/published-instructions.spec.ts`：單次類型 query、前端年度切換、desktop／360px、鍵盤、目錄、連結、狀態與 overflow browser test。

### Modify

- `package.json`：加入安全 Markdown rendering 所需 runtime dependencies。
- `package-lock.json`：鎖定相容依賴版本。
- `src/test/setup.ts`：加入嚴格的 MSW server lifecycle。
- `src/app/router/router.tsx`：以正式頁面取代 `/rules` placeholder。
- `src/app/router/router.test.tsx`：驗證公開 `/rules` route 與既有導覽邊界，不再依賴 placeholder 文案。
- `e2e/application-entry.spec.ts`：將既有 `/rules` placeholder assertion 更新為正式公開頁邊界。

### Tests

- `src/shared/api/api-client.test.ts`：共用 GET JSON client 與安全 error normalization。
- `src/features/rules/api/published-instructions.test.ts`：四個合法 `applicationType`、enum 外拒絕、選填 `academicYear`、section wire schema、API 順序保留、`HTTP 200 OK` 空陣列、已超過 `effectiveTo` 但仍回傳的內容、query input/output 與錯誤。
- `src/features/rules/lib/academic-year.test.ts`：臺灣學年度 8 月 1 日分界。
- `src/features/rules/components/instructions-article.test.tsx`：sanitization、heading IDs、TOC 與安全 links。
- `src/features/rules/published-instructions-page.test.tsx`：標題、四個按鈕文案／順序、初始零 request、每個類型單次 request、年度切換零新增 request、MSW query states、`HTTP 200 OK` 空陣列、retry 與 stale result。
- `src/app/router/router.test.tsx`：公開 route、既有 redirect 與導覽回歸。
- `e2e/published-instructions.spec.ts`：Chromium 單次 query／本地年度切換、desktop／360px、鍵盤、44px targets、TOC、links 與無水平溢位。
- `e2e/application-entry.spec.ts`：既有申請入口與 rules navigation 回歸。

## Implementation Steps

1. 安裝並鎖定 Markdown、GFM、raw HTML parsing、allowlist sanitization 與 slug 所需依賴，確認既有 build 與 tests 不受影響。
2. 建立最小共用 GET JSON client，以及 section 陣列 schema、保留後端 `displayOrder` 順序且將 `HTTP 200 OK` 空陣列保留為 empty result 的 mapper、含必填 `applicationType` 與選填 `academicYear` 的 query、目前臺灣學年度 helper、MSW server／fixture／handler 與對應測試；驗證前端不依未提供的管理欄位或 `effectiveTo` 再次過濾。
3. 建立 feature-local instructions article renderer；先由解析後的 heading tree 產生唯一 slug 與目錄，再以 allowlist 清理內容及安全連結行為，並覆蓋惡意與重複 heading 案例。
4. 建立 `PublishedInstructionsPage`，顯示「請選擇申請類型」及四個固定文案的大型按鈕，初始不選擇類型且停用 query；訪客選擇類型後，只以申請類型驅動一次所有年度 query，年度切換以前端篩選 matching sections，並組合 loading、empty、error／retry 與 success states，避免前一次類型查詢結果誤標。
5. 將正式頁面接入 `/rules`，更新 Router 與既有 application-entry tests，保留 Public Layout、根 redirect 與四個申請目的 routes。
6. 建立 Chromium browser flow，驗證未登入公開存取、申請類型與年度切換、長篇目錄、鍵盤、44px targets、desktop／360px 與無水平溢位。
7. 執行完整 AI Verification，建立 verification record 並更新 blueprint 狀態；真實後端內容留待 Human Integration 與 Acceptance。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| 後端未使用 `effectiveTo` 排除失效內容 | 公開頁可能呈現已超過失效日期但仍由 API 回傳的內容 | 前端如實呈現並安全清理 API 結果；在 Human Integration 記錄真實後端行為，後續若契約改變再建立變更 Slice |
| Raw HTML 與外部 URL 可能造成 XSS、reverse tabnabbing 或危險導覽 | 公開頁可執行不可信內容 | 使用明確 allowlist、protocol 限制與安全 link properties，並以惡意 fixtures 自動驗證 |
| Markdown heading 可能重複、包含中文或特殊字元 | TOC link 不唯一或無法定位 | 使用確定性的 slugger 與重複 suffix，測試中文、重複與特殊字元 |
| 申請類型快速切換產生並行 request | 舊內容可能誤顯示為新選擇 | Query key 只包含正規化申請類型、傳遞 AbortSignal，且 renderer 只接受目前類型 query 對應 view model |
| 所有年度內容一次下載 | 歷史 Markdown 會增加單次 response 大小 | 依使用者核准決策使用現有 API；若資料量日後成為問題，再提案加入只回傳年度 metadata 的後端契約 |
| 真實後端尚無已發布測試內容 | AI 可完成 mock verification，但不能完成真實整合與 Human Acceptance | Human Integration 提供目前、歷史、空內容及失敗情境的測試資料／環境 |

## AI Implementation Tasks

- [x] 安裝並鎖定安全 Markdown rendering 依賴。
- [x] 建立最小共用 GET JSON API client 與安全錯誤處理。
- [x] 建立正式 section 陣列 schema、保留 API 順序的 mapper、申請類型／學年度 query 與臺灣學年度 helper，不依 `effectiveTo` 排除已回傳內容。
- [x] 建立嚴格 MSW lifecycle、fixtures 與 handlers。
- [x] 建立安全 Markdown article、唯一 heading anchors、目錄與安全連結。
- [x] 建立 `/rules` 申請類型／年度選擇與 loading、empty、error、success、retry 狀態。
- [x] 建立「請選擇申請類型」與四個固定文案的大型按鈕，不新增額外 UI library。
- [x] 確保初始不預選申請類型，且訪客選擇前不發送公開辦法 request。
- [x] 建立單元、元件／整合與 Chromium browser tests。
- [x] 更新既有 Router 與 application-entry regression tests。
- [x] 完成 verification record 與 blueprint 文件更新。
- [x] 將頁面改為每個申請類型只查詢一次所有年度，並在前端依學年度篩選且保留 API 順序。
- [x] 更新元件與 Chromium tests，驗證類型選擇恰好一個 request、年度切換不新增 request，以及快速類型切換不顯示 stale result。

## AI Verification

- [x] 執行 `npm run build`
- [x] 執行 `npm run test`
- [x] 執行 `npm run lint`
- [x] 執行 `npm run typecheck`
- [x] 執行 `npm run test:e2e -- e2e/published-instructions.spec.ts e2e/application-entry.spec.ts --project=chromium`
- [x] 以 Playwright 驗證單次類型查詢、年度切換零新增 request、desktop 與 360px、鍵盤、44×44px targets、TOC、連結及無水平溢位
- [x] 驗證修訂後 Target Behavior
- [x] 回歸驗證 `/` redirect、`/apply`、Public Layout 導覽與四個申請目的 route placeholders

## Human Integration

- [ ] 提供可由真實公開端點依申請類型取得的目前學年度、至少一個歷史學年度、一個多 section 年度、一個無公開內容學年度，以及一筆已超過 `effectiveTo` 但仍會回傳的測試資料。
- [ ] 確認真實後端依 `displayOrder` 升冪排列，並只回傳 `status = published`、`isVisible = true` 且 `effectiveFrom` 不晚於 Asia/Taipei 當日的內容；同時確認目前不使用 `effectiveTo` 排除內容。
- [ ] 提供可重試失敗情境的驗證方式。

只有使用者明確確認後才能勾選。

## Human Acceptance

- [ ] 在桌面寬度閱讀含多層標題的長篇辦法，確認目錄結構、所有章節連結與文章連結正確。
- [ ] 在 360px 寬度切換申請類型、目前與歷史學年度，確認控制項、目錄與文章易於閱讀和操作。
- [ ] 驗證沒有公開內容的學年度及可重試 API 失敗狀態。
- [ ] 確認 API 已回傳且超過 `effectiveTo` 的 section 仍依後端順序顯示，且 Markdown 經安全清理。
- [ ] 使用鍵盤操作申請類型控制項、學年度選擇器、目錄連結與重試按鈕。
- [ ] 確認測試用惡意內容不會執行或產生危險導覽。

只有使用者明確確認後才能勾選。

## Documentation Updates

- [x] 已依核准提案更新 `docs/project/api-integration.md` 的公開申請辦法 query 與 section 陣列契約。
- [x] 已依後續核准提案將多 section 排序責任改為後端 `displayOrder` 升冪排列，前端保留 API 順序。
- [x] 已依核准提案更新 `docs/project/api-integration.md` 的 `HTTP 200 OK` 空陣列 empty response 契約。
- [x] 已依核准提案更新 `docs/project/api-integration.md` 的公開內容篩選與 `effectiveTo` 已知限制。
- [x] 已依核准提案更新 `docs/project/routes-and-pages.md` 的先選申請類型與選擇前零 request 行為。
- [x] 已依核准提案更新 `docs/project/routes-and-pages.md` 的申請類型標題、四個大型按鈕與固定文案。
- [x] 確認需求文件、Slice Brief、Spec 與 Plan 一致。
- [x] 更新 Slice Brief 或 blueprint 文件連結。
- [x] 更新 Spec 狀態。
- [x] 更新 Plan 狀態。
- [x] 更新 verification record。
- [x] 更新 blueprint Status、Status Note 與 Last Updated。
- [x] `not-applicable`；本 Slice 不是 `change`，不需 supersession lineage。
- [x] `docs/project/` 與 API wire contract 不需修改；現有文件已允許省略 `academicYear` 取得所有年度 sections。

## Commit Plan

Draft Documentation Batch 由使用者建立 Spec / Plan 的明確要求授權，建立本文件後直接以 `docs(FS-002): draft published instructions specification` 提交，不受下列尚為 `pending` 的 Commit Plan 限制。

- Commit Plan Approval: `approved`
- Approved By: `使用者`
- Approved At: `2026-08-11`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存已核准的需求與 Slice 文件 | `docs/blueprint/feature-slice-blueprint.md`、Slice Brief、Spec、Plan | 文件一致性、`git diff --check` | `docs(FS-002): approve published instructions specification` |
| I1 | 安裝並鎖定安全 Markdown rendering 所需依賴 | `package.json`、`package-lock.json` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `build(rules): add markdown rendering dependencies` |
| I2 | 建立經驗證且可測試的公開申請辦法資料存取 | `src/shared/api/**`、`src/features/rules/api/**`、`src/features/rules/lib/academic-year*`、`src/test/server.ts`、`src/test/setup.ts`、`src/test/handlers/public-application-instructions.ts`、`src/test/fixtures/published-instructions.ts` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `feat(rules): add published instructions data access` |
| I3 | 建立安全 Markdown 文章、唯一 heading anchors 與目錄 | `src/features/rules/components/instructions-article.tsx`、`src/features/rules/components/instructions-article.test.tsx` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `feat(rules): add safe instructions renderer` |
| I4 | 完成 `/rules` 頁面、年度與狀態互動及 browser flow | `src/features/rules/published-instructions-page*`、`src/app/router/router.tsx`、`src/app/router/router.test.tsx`、`e2e/published-instructions.spec.ts`、`e2e/application-entry.spec.ts` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `feat(rules): add published instructions page` |
| Initial Verification | 保存初版完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、`git diff --check` | `docs(FS-002): record published instructions verification` |
| Revision Approval | 保存單次查詢修訂的核准文件 | blueprint、Spec、Plan、Verification | 文件一致性、`git diff --check` | `docs(FS-002): approve published instructions specification` |
| F1 | 將每個申請類型改為單次查詢並以前端篩選年度 | `src/features/rules/published-instructions-page.tsx`、`src/features/rules/published-instructions-page.test.tsx`、`e2e/published-instructions.spec.ts` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `fix(rules): avoid duplicate instructions requests` |
| Reverification | 保存修訂後完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、`git diff --check` | `docs(FS-002): update published instructions verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage 文件 | 文件一致性、`git diff --check` | `docs(FS-002): record published instructions acceptance` |

Commit Plan Approval 使用 `pending`、`approved`。新 Plan 的 Implementation Execution 固定使用 `continuous`；缺少此欄位的已核准既有 Plan 視為 legacy `per-batch`，不得自動補欄位或套用新執行方式。每個 implementation batch 恰好對應一個 commit，並在 commit body 加入 `Feature-Slice: FS-002`。

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-11`
- Approval Note: `使用者已明確核准每個申請類型只查詢一次的修訂 Spec、Plan 與 Commit Plan；等待下一次明確開始實作要求。`

## Template Rules

- 根據 Spec 產生 Plan。
- 先分析現有程式碼，再決定 Files 與 Implementation Steps。
- 不修改或覆蓋 Spec 需求。
- Spec 實質變更時同步更新 Plan。
- 只列出實際預期執行的工作。
- 核准後不自行增加 Scope。
- `change` 必須規劃 Target Behavior 與 Preserved Behavior 的驗證。
- `correction` 必須以 Authoritative Spec 為依據，不改寫原需求。
- 只有使用者已明確核准的 `docs/project/` 變更才能列入 Files、Documentation Updates 與 Commit Plan。
- 不得將實作分析或現有程式碼推論出的行為回寫成產品需求。
- Spec 與 Plan 經使用者明確核准時，自動將 Commit Plan Approval 設為 `approved`，並使用相同的 Approved By 與 Approved At；不得另行詢問 Commit Plan 核准。
- Draft Documentation Batch 在 Spec / Plan 建立後自動 commit，讓使用者能以 Git diff 審查後續修改。
- 第一個已核准 batch 必須是 Approval Documentation Batch；Spec 與 Plan 的核准即授權此 commit，不得另行詢問 commit；建立後停止、回報 Commit ID 並詢問使用者是否開始 implementation。
- 一個 implementation batch 恰好對應一個 commit；不得在 I1 或其他單一 batch 內隱藏多個 commits。
- 依 build / dependency / tooling、test infrastructure、runtime / routing / providers、使用者可見功能、tests 與 documentation 等審查目的拆分；只有拆開會造成中間 commit 無法建置或無法合理運作時才能合併。
- 每個 batch 必須能獨立理解並合理回退，Files 使用具體且有限的路徑，並列出自己的 Required Verification；不得以 `foundation`、`setup` 或同類寬泛目的合併不同工作。
- 測試預設放入緊接對應實作的 `test` batch；若測試是讓實作 commit 可驗證或安全成立的必要部分，允許與實作同一 batch。
- Implementation message 使用 `build`、`chore`、`feat`、`fix`、`test`、`refactor` 或 `docs`，scope 使用英文模組名稱；文件 checkpoint 繼續使用 Feature Slice ID。
- 使用者明確要求開始實作後，依 I1、I2、…、In 順序連續執行所有 implementation batches；每個 batch 完成與驗證後直接 commit，批次之間不停止或詢問。
- 完成最後一個 implementation batch 後不停止詢問，直接執行完整 AI Verification 並建立 Verification Documentation commit。
- Human Acceptance 結果授權 Final 或 Acceptance Feedback Documentation commit。
- 已授權 batch 不再要求第二次 commit 確認。
- 不執行或建立未列入 Commit Plan、尚未核准或隱藏在其他 batch 內的 implementation commit；需要新增或重組 batch 時停止並重新核准 Commit Plan。
- 只改變 batch 分組、順序或 message 時，將 Commit Plan Approval 設回 `pending`；若 Scope 也改變，依 Skill 撤銷完整 Plan 核准。
- 最終 Documentation Batch 必須位於 Human Acceptance 之後。
