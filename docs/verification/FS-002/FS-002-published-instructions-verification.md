# FS-002 — Published Instructions Verification

## Document Information

- Feature Slice: `FS-002`
- Change Type: `feature`
- Verification Status: `in-progress`
- Created: `2026-08-11`
- Last Updated: `2026-08-11`

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-002/FS-002-published-instructions-spec.md`

## Pending Revision

- 使用者於 Human Integration 期間要求每個申請類型只查詢一次所有公開學年度 sections，年度切換改為前端篩選。
- 既有 AI Verification 證據仍記錄初版實作實際執行結果，但不代表修訂後單次查詢 Acceptance 已通過。
- 修訂後實作、tests、完整 AI Verification 與 Human Integration 尚未執行。

## Implementation Summary

- 已以正式公開頁取代 `/rules` placeholder；初始顯示四個固定申請類型按鈕，選擇前不送出辦法 request。
- 已建立 credentialed JSON GET client、Zod response validation、申請類型／選填學年度 query、Asia/Taipei 學年度 helper、嚴格 MSW 測試邊界與 fixtures。
- 初版選擇類型後同時查詢所有年度與目前學年度；此重複查詢將依待核准修訂改為每個類型只查詢一次，年度切換使用已取得的 Response。
- 已建立保留 API section 順序的安全 Markdown renderer、同頁唯一錨點、目錄，以及外部連結安全屬性；前端不依 `effectiveTo` 排除 API 已回傳內容。
- 真實後端資料與失敗情境尚待 Human Integration；production build 成功，但 Vite 回報主 bundle 超過預設 500 kB 警示，核准範圍未設定 bundle budget。

## Changed Files

| File | Change |
|---|---|
| `package.json`、`package-lock.json` | 加入並鎖定 Markdown、GFM、raw HTML、sanitizer 與 slug 依賴。 |
| `src/shared/api/api-client.ts` | 建立 credentialed JSON GET、AbortSignal、Zod validation 與安全錯誤邊界。 |
| `src/features/rules/api/**` | 建立 application type、section response schema、保留順序 mapper 與 query。 |
| `src/features/rules/lib/academic-year.ts` | 建立 Asia/Taipei 8 月 1 日學年度分界 helper。 |
| `src/features/rules/components/instructions-article.tsx` | 建立安全 Markdown、唯一 anchors、TOC、表格 overflow 與安全連結。 |
| `src/features/rules/published-instructions-page.tsx` | 建立類型／年度控制項與完整非同步狀態。 |
| `src/test/**` | 加入嚴格 MSW lifecycle、公開辦法 handlers 與無個資 fixtures。 |
| `src/app/router/router.tsx` | 將正式頁面掛載至公開 `/rules` route。 |
| `src/**/*.test.ts*` | 覆蓋 API、日期、renderer、頁面狀態與 Router regression。 |
| `e2e/published-instructions.spec.ts`、`e2e/application-entry.spec.ts` | 覆蓋公開 browser flow 並更新既有 rules route assertion。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | passed | exit code 0 | TypeScript project references 通過。 |
| Lint | `npm run lint` | passed | exit code 0 | ESLint 無 error 或 warning。 |
| Unit / Integration Tests | `npm run test` | passed | 8 files、32 tests passed | 覆蓋 client、schema、query、日期、sanitizer、頁面與 Router。 |
| Production Build | `npm run build` | passed | exit code 0；455 modules transformed | Bundle 成功產生；另有超過 Vite 預設 500 kB 的非阻擋警示。 |
| Browser / Responsive | `npm run test:e2e -- e2e/published-instructions.spec.ts e2e/application-entry.spec.ts --project=chromium` | passed | 9 tests passed | 覆蓋 desktop、360px、鍵盤、44px targets、TOC、安全連結、狀態與 regression。 |
| Revised Target Behavior | 修訂後 Spec 與自動化測試逐項比對 | not-run | 等待 F1 實作 | 單次類型查詢與年度切換零新增 request 尚未驗證。 |

## AI Acceptance Summary

| Criterion | Result | Evidence |
|---|---|---|
| `/rules` 公開可達且初始零 request | passed | Router test、page request counter 與 Chromium public route test。 |
| 每個申請類型只查詢一次，年度切換不新增 request | not-run | 等待 F1 component 與 Chromium request-count assertions。 |
| 四個固定類型、合法 wire values 與類型隔離 | passed | Page control assertions、query parameter tests 與 stale-result test。 |
| 預設目前臺灣學年度並可切換歷史年度 | passed | 8 月 1 日單元測試、MSW page test 與 Chromium select flow。 |
| 保留 API section 順序且完整驗證 contract | passed | Schema／mapper tests 與 page section-order assertion。 |
| 信任公開 API 篩選且不依 `effectiveTo` 排除 | passed | Strict schema 與 expired fixture 在 API／page tests 仍顯示。 |
| 安全 Markdown、唯一錨點、TOC 與安全 links | passed | Renderer 4 tests 與 Chromium TOC／external-link assertions。 |
| Loading、200 empty、error、retry、success 與 stale 防護 | passed | Page 7 tests 及 Chromium failure-to-empty flow。 |
| 鍵盤、非同步可辨識、44px targets 與 360px | passed | Semantic roles／ARIA implementation 與 desktop／mobile Chromium tests。 |
| Build、typecheck、lint、unit／integration 與 browser tests | passed | 本次完整 AI Verification commands 均 exit code 0。 |

## Behavior Verification

### New / Changed Behavior

| Criterion | Result | Evidence |
|---|---|---|
| 訪客可依申請類型與學年度閱讀公開辦法 | passed | MSW integration tests 與 Chromium current／historical flow。 |
| 多 section 依 API 順序呈現並可由目錄定位 | passed | Mapper／page order assertions 與 TOC browser flow。 |
| 公開內容先驗證與清理，再進入頁面 | passed | Zod contract failures、XSS fixture 與 unsafe URL tests。 |
| 空陣列與暫時失敗具有不同且可操作狀態 | passed | Empty／error／retry component 及 browser tests。 |

### Preserved Behavior Regression

| Criterion | Result | Evidence |
|---|---|---|
| `/` 仍導向 `/apply`，申請入口與四個目的 routes 保留 | passed | Router tests 與 `e2e/application-entry.spec.ts`。 |
| Public Layout 導覽、active state、skip link 與公開存取保留 | passed | Router assertions與 Chromium keyboard／navigation flow。 |
| Query Provider、Route Error Boundary 與 production build 保持可用 | passed | Router provider test、完整 Vitest 與 Vite build。 |

## Commit Batch Verification

| Batch | Purpose | Required Verification | Result | Planned Message |
|---|---|---|---|---|
| I1 | 安裝 Markdown rendering 依賴 | typecheck、lint、test、build | passed | `build(rules): add markdown rendering dependencies` |
| I2 | 建立公開申請辦法資料存取 | targeted Vitest、typecheck、lint、test、build | passed | `feat(rules): add published instructions data access` |
| I3 | 建立安全 Markdown renderer 與目錄 | targeted Vitest、typecheck、lint、test、build | passed | `feat(rules): add safe instructions renderer` |
| I4 | 完成 `/rules` 頁面與 browser flow | targeted Vitest、typecheck、lint、test、build、Chromium Playwright | passed | `feat(rules): add published instructions page` |
| Initial Verification | 保存初版完整 AI Verification 與狀態 | 完整證據、文件一致性、`git diff --check` | passed | `docs(FS-002): record published instructions verification` |
| F1 | 每個申請類型改為單次查詢並以前端篩選年度 | targeted Vitest、typecheck、lint、test、build、Chromium Playwright | not-run | `fix(rules): avoid duplicate instructions requests` |
| Reverification | 保存修訂後完整 AI Verification 與狀態 | 完整證據、文件一致性、`git diff --check` | not-run | `docs(FS-002): update published instructions verification` |

## Human Integration

### Required Work

1. 在真實環境確認 `GET /public/application-instructions` 接受四個 `applicationType`，省略與提供 `academicYear` 時均符合核准契約。
2. 準備目前年度、歷史年度、多 section、`data: []`，以及一筆 `effectiveTo` 已過期但仍回傳的公開測試資料。
3. 確認真實後端只回傳 published、visible、已生效內容，依 `displayOrder` 排序，並提供可重試失敗情境。

### Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- Notes: `單次查詢修訂尚待核准與實作，Human Integration 暫停。`

## Human Acceptance Instructions

### Preconditions

- 已執行 `npm install`，並以 `npm run dev` 啟動前端。
- 前端 API base URL 指向符合 FS-002 契約的測試後端。

### Test Data

- 四種申請類型的目前年度公開資料。
- 至少一個歷史年度、一個多 section 年度、一個無內容年度。
- 一筆 `effectiveTo` 已早於今日但公開 API 仍回傳的 section。
- 可觸發一次暫時性失敗後恢復的情境。

### Browser / Device / Viewport

- Desktop Chrome，建議 1280 × 800。
- Chrome responsive mode，360 × 800。

### Steps and Expected Results

| Step | Action | Expected Result |
|---|---|---|
| 1 | 未登入開啟 `/rules`。 | 顯示「請選擇申請類型」與四個按鈕，不重新導向且尚未查詢辦法。 |
| 2 | 逐一選擇四種申請類型。 | 預設目前臺灣學年度，內容不會混用其他類型。 |
| 3 | 切換目前與歷史學年度。 | 每次顯示對應年度；`data: []` 顯示無內容而非錯誤。 |
| 4 | 檢查多 section 長篇內容與目錄。 | sections 保留 API 順序，目錄可定位各標題，安全外連以新分頁開啟。 |
| 5 | 觸發暫時失敗並按「重新載入」。 | 顯示安全錯誤文案，重試後恢復內容或正確 empty state。 |
| 6 | 檢查 `effectiveTo` 已過期但 API 回傳的 section。 | 前端仍顯示該 section，不自行過濾。 |
| 7 | 以鍵盤操作並在 360 × 800 重複主要流程。 | 焦點清楚、主要目標易操作，內容與目錄無非必要水平捲動。 |

### Known Limitations

- 後端目前不使用 `effectiveTo` 排除失效內容；前端依核准契約如實顯示 API 回傳資料。
- Production build 主 bundle 超過 Vite 預設 500 kB 警示；目前沒有核准的 bundle budget 或 code-splitting Scope。

## Human Acceptance Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- User Feedback: `pending`

## Final Summary

- AI Verification: `初版 passed；修訂後單次查詢行為 not-run。`
- Human Integration: `pending；修訂核准、實作與重新驗證後再以真實公開端點確認。`
- Human Acceptance: `pending；修訂後等待使用者依更新步驟驗收。`
- Remaining Issues: `待完成單次查詢修訂；另有後端 effectiveTo 已知限制，以及非阻擋的 Vite bundle size 警示。`
- Final Feature Slice Status: `awaiting-approval`

## Document Lineage Update

- Slice Brief Link: `docs/blueprint/slices/FS-002-published-instructions.md`
- Previous Spec Status: `not-applicable`
- Replacement Spec Link Added: `not-applicable`
- Blueprint Links Updated: `yes`

## Template Rules

- 將 AI Verification 與 Human Acceptance 分開記錄。
- 不將未執行檢查標示為通過。
- 不由 AI 填寫使用者尚未確認的結果。
- 將 blueprint Status 視為 Feature Slice 狀態的唯一權威來源。
- `change` 必須記錄 Target Behavior 與 Preserved Behavior 的驗證結果。
- `change` Accepted 後確認舊 Spec 已標示 `superseded` 並連到新 Spec。
- `correction` 必須確認 Authoritative Spec 仍然有效且未被標示 `superseded`。
- Commit Batch Verification 只記錄局部檢查，不取代完整 AI Verification。
- Human Acceptance 失敗後以新的 `fix` batch 記錄修正，不改寫既有 commits。
