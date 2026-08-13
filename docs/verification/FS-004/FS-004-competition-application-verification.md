# FS-004 — Competition Application Verification

## Document Information

- Feature Slice: `FS-004`
- Change Type: `feature`
- Verification Status: `awaiting-human`
- Created: `2026-08-13`
- Last Updated: `2026-08-13`

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-004/FS-004-competition-application-spec.md`

## Implementation Summary

- 已完成 `/apply/competition` 五步公開申請流程、目前臺灣學年度、動態參與者、兩種點數分配、老師選擇、附件分類／預覽、確認摘要與成功頁。
- 已建立公開競賽規則、老師及 multipart 送件契約；Response 經 Zod 驗證，點數以百分之一點整數運算，送件使用 `credentials: omit` 與 HTTP 201 邊界。
- 已建立不可變 Idempotency 快照；5xx／Network 結果不確定時沿用同一 Key，409 後改用新 Key，429 顯示可讀取的等待秒數。
- React Strict Mode 重新掛載時沿用 Query Cache 中的 request，規則與老師正常流程各只查詢一次。
- 已依真實後端契約將競賽規則增量欄位統一為 `pointIncrement`，並重新執行完整 AI Verification。
- 已將前兩步重排為「競賽內容」與「參與者資料」；第一步只建立競賽與點數規則，第二步才顯示參與者、聯絡資料、固定或共同分配點數。
- 已同步調整逐步驗證、後端欄位錯誤定位、規則失效重載、確認摘要修改連結及共用分配即時摘要。
- 已完成 R2：競賽參與者初始不預選申請人，選定前隱藏聯絡資料，選定後將 Email 與電話顯示於該參與者卡片。
- 未選申請人時同時顯示錯誤摘要與參與者區域訊息，並聚焦第一個「設為申請人」按鈕；選定後立即清除錯誤。
- 改選申請人須確認，確認後聯絡資料被清除並移至新申請人卡片；正式 payload 仍恰好一位 `isApplicant = true`。
- Human Acceptance 檢查發現 `e2e/**` 未被既有 TypeScript project references 納入；Playwright 可執行，但 `npm run typecheck` 無法涵蓋 E2E specs，VS Code 因此無法識別 Node.js `Buffer` global。
- 已新增獨立 E2E TypeScript project 並納入根 project references；`npm run typecheck` 現在會檢查全部 Playwright specs，VS Code 可正確識別 Node.js `Buffer` global。
- F1 後已重新執行完整 AI Verification，產品行為、Vitest、build 與 14 個 Chromium 流程均保持通過。
- 真實後端、CORS、Rate Limit header、檔案內容檢查及不重複建立案件仍須由 Human Integration 確認。

## Approved Flow Revision

- 使用者於 2026-08-13 核准將競賽申請前兩步改為「競賽內容」後接「參與者資料」。
- 第一個步驟不再顯示尚不可操作的參與者點數；第二個步驟在規則已選定後才顯示參與者、申請人聯絡資料與個別點數。
- R1 已完成並重新執行完整 AI Verification；下方表格已更新為步驟重排後的實際結果。

## Approved Applicant Selection Revision

- 使用者於 2026-08-13 同意競賽申請初始不預選申請人，必須由使用者明確指定一位參與者。
- 選定前隱藏 Email 與電話；選定後在該參與者卡片內展開「申請人聯絡資料」，目前申請人不可直接取消或刪除。
- 未選申請人便繼續時顯示錯誤摘要及區域訊息，捲動並聚焦第一個「設為申請人」按鈕；選定後立即清除錯誤。
- 改選前須確認，確認後清除 Email、電話並將聯絡資料區塊移到新申請人卡片。
- R2 已完成並重新執行完整 AI Verification；下方表格已更新為申請人互動修訂後的實際結果。

## Changed Files

| File | Change |
|---|---|
| `package.json`、`package-lock.json` | 加入並鎖定 React Hook Form 與 Zod Resolver。 |
| `src/shared/lib/academic-year.ts`、`academic-year.test.ts` | 提升 Asia/Taipei 學年度與日期 helper，供規則及申請共用。 |
| `src/shared/api/api-client.ts`、`api-client.test.ts` | 加入公開 multipart、結構化錯誤、`Retry-After` 與預期 HTTP status 驗證。 |
| `src/features/applications/common/lib/**` | 建立百分之一點整數解析、格式化、加總與倍數驗證。 |
| `src/features/applications/common/components/**` | 建立 Wizard、參與者、老師、附件、錯誤摘要及離開確認控制項。 |
| `src/features/applications/competition/api/**` | 建立規則、老師、payload、成功 Response schemas、queries 與 multipart submit；規則增量欄位使用 `pointIncrement`。 |
| `src/features/applications/competition/model/**` | 建立表單、Mapper、點數分配、正規化及 submission state。 |
| `src/features/applications/competition/components/**` | 建立競賽內容、確認、結果不確定與成功畫面；確認摘要依新步驟順序返回修改。 |
| `src/features/applications/competition/competition-application-page.tsx` | 串接五步流程、單次查詢、錯誤恢復與 Idempotency；將競賽內容置於第一步、參與者與點數置於第二步。 |
| `src/features/applications/common/components/participants-editor.tsx` | 加入明確選擇申請人、卡片內聯絡資料、未選區域錯誤及改選確認。 |
| `src/features/applications/competition/model/competition-application.schema.ts` | 將初始參與者改為 `isApplicant = false`，保留正式送件唯一申請人驗證。 |
| `src/test/**`、`src/features/applications/**/*.test.ts*` | 加入匿名 fixtures、MSW handlers 與單元／元件／整合覆蓋。 |
| `src/app/router/router.tsx`、`router.test.tsx` | 以正式競賽表單取代 placeholder 並回歸公開 routes。 |
| `e2e/application-entry.spec.ts`、`e2e/competition-application.spec.ts` | 覆蓋新步驟順序、第一步無參與者欄位、兩種點數、multipart、Idempotent retry、desktop 與 360px。 |
| `tsconfig.e2e.json`、`tsconfig.json` | 建立包含 Node 與 DOM types 的嚴格 E2E TypeScript project，並加入根 project references。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | passed | exit code 0 | App、Node config 與全部 `e2e/**/*.ts` project references 均通過；`Buffer` 已由 Node types 正確解析。 |
| Lint | `npm run lint` | passed | exit code 0 | ESLint 無 error 或 warning。 |
| Unit / Integration Tests | `npm run test` | passed | 13 files、68 tests passed | 覆蓋 transport、schemas、點數、初始未選申請人、卡片內聯絡資料、改選清除、修訂後五步流程及錯誤恢復。 |
| Production Build | `npm run build` | passed | exit code 0；476 modules transformed | Bundle 成功產生；有超過 Vite 預設 500 kB 的非阻擋警示。 |
| Browser / Responsive | `npm run test:e2e -- e2e/application-entry.spec.ts e2e/published-instructions.spec.ts e2e/competition-application.spec.ts --project=chromium` | passed | 14 tests passed | 覆蓋申請人未選錯誤與焦點、新步驟順序、入口、公開辦法、desktop、360px、Dialog 焦點與無水平溢位。 |
| Target Behavior | Spec 與自動化逐項核對 | passed | 68 Vitest tests、14 Chromium flows | 驗證明確選擇申請人、聯絡資料卡片位置、改選清除、唯一申請人 payload、競賽內容先行、單次查詢、multipart、錯誤定位及 Idempotency。 |
| FS-002／FS-003 Regression | 完整 Vitest、入口與公開辦法 Chromium suites | passed | 既有 `/apply`、`/rules`、Router、Provider 與 GET client 均通過 | 未修改其他三類 placeholder。 |

## AI Acceptance Summary

| Criterion | Result | Evidence |
|---|---|---|
| 「競賽內容」先於「參與者資料」，第一步不顯示參與者編輯器 | passed | Page integration、Router 與 360px Chromium flow。 |
| 五步導覽、逐步驗證、返回修改、dirty-state 與離開警告 | passed | Page integration、確認摘要 step mapping、Wizard 與 Leave Dialog tests。 |
| 學年度、參與者、申請人、學號與聯絡資料規則 | passed | academic-year、form schema、Mapper 與 ParticipantsEditor tests。 |
| 初始未選申請人、聯絡資料隱藏／卡片位置、未選錯誤焦點與改選清除 | passed | ParticipantsEditor、page integration 與 Chromium explicit-applicant flow。 |
| 規則／老師各查詢一次，並區分 loading、empty、failure、reload | passed | Request counters、page state tests 與 Chromium shared flow。 |
| `per_person` 與單人／多人 `shared_total` 使用整數點數驗證 | passed | points/model tests、page per-person flow 與 shared-total Chromium flow。 |
| 附件格式、大小、數量、metadata、預覽與 URL 清理 | passed | attachment validation／component tests、multipart contract 與 browser upload。 |
| HTTP 201、422、400、409、429、5xx 與不可變 retry | passed | API／page integration tests與 Chromium same-key retry。 |
| 公開未登入 multipart 不帶 Cookie／CSRF，且 Key／檔案不持久化 | passed | API client、submit contract 與 static implementation inspection。 |
| 鍵盤、Dialog 焦點、錯誤定位、44px 與 360px | passed | Common component tests、application entry keyboard flow 與 mobile full flow。 |

## Behavior Verification

### New / Changed Behavior

| Criterion | Result | Evidence |
|---|---|---|
| 訪客可完成競賽申請並取得等待老師簽核的成功結果 | passed | Per-person integration 與 shared-total Chromium submission。 |
| 後端只提供的組合決定點數模式與有效選項 | passed | Strict schema、lookup tests 及 option-driven UI。 |
| 不確定送件可安全重試，明確衝突則使用新 Key | passed | 5xx same-key、409 new-key tests。 |
| 後端規則失效後可手動重載並重設點數 | passed | Rule invalidation integration test。 |
| 規則錯誤返回第一步，參與者與點數錯誤返回第二步 | passed | 422 error routing、field focus 與 rule reload integration tests。 |
| 競賽申請必須明確指定申請人，聯絡資料只出現在目前申請人卡片 | passed | Page integration、ParticipantsEditor 與 Chromium explicit-applicant flow。 |

### Preserved Behavior Regression

| Criterion | Result | Evidence |
|---|---|---|
| `/`、`/apply` 四入口與共用公開導覽保持可用 | passed | Router tests 與 `e2e/application-entry.spec.ts`。 |
| `/rules` 單次查詢、年度切換與公開辦法狀態保持可用 | passed | FS-002 Vitest 與 `e2e/published-instructions.spec.ts`。 |
| 其他三類申請仍維持既有 placeholder | passed | Application entry route browser regression。 |

## Commit Batch Verification

| Batch | Purpose | Required Verification | Result | Planned Message |
|---|---|---|---|---|
| I1 | 加入表單 runtime 依賴 | typecheck、lint、test、build | passed | `build(applications): add form workflow dependencies` |
| I2 | 建立共用日期、點數與 multipart transport | targeted tests、typecheck、lint、build | passed | `feat(applications): add shared application utilities` |
| I3 | 建立競賽契約、模型與規則 | contract／model tests、typecheck、lint、build | passed | `feat(competition): add application contracts and rules` |
| I4 | 建立共用申請控制項 | component tests、typecheck、lint、build | passed | `feat(applications): add shared application controls` |
| I5 | 完成五步表單與 route | page／router tests、typecheck、lint、test、build | passed | `feat(competition): add public competition application` |
| I6 | 覆蓋 browser flow | targeted Chromium、typecheck、lint、test、build | passed | `test(competition): cover application workflow` |
| Verification Fixes | 修正 Strict Mode 重複查詢及補齊送件邊界 | targeted／full Vitest、完整 Chromium、typecheck、lint、build | passed | `fix(competition): avoid duplicate initial queries`、`fix(competition): enforce submission boundaries`、`test(competition): cover submission error recovery` |
| Contract Alignment Fix | 將前端規則增量欄位對齊後端 `pointIncrement` | contract／page tests、完整 Vitest、Chromium、typecheck、lint、build | passed | `fix(competition): align point increment field` |
| Verification | 保存完整 AI Verification 與狀態 | 本文件、文件一致性、`git diff --check` | passed | `docs(FS-004): record competition application verification` |
| R1 | 將競賽內容移至第一步、參與者與點數移至第二步並同步錯誤／摘要落點 | targeted／完整 Vitest、typecheck、lint、build、指定 Chromium | passed | `fix(competition): reorder application details steps` |
| Reverification | 保存步驟重排後完整 AI Verification 與等待人工狀態 | 65 Vitest、13 Chromium、typecheck、lint、build、文件一致性 | passed | `docs(FS-004): update application flow verification` |
| Applicant Revision Draft | 保存申請人互動修訂文件與等待核准狀態 | 文件一致性、`git diff --check` | passed | `docs(FS-004): revise applicant selection flow` |
| R2 | 明確選擇申請人、卡片內聯絡資料、未選與改選互動 | 25 個 targeted Vitest、typecheck、lint、build、5 個 Chromium 流程 | passed | `fix(competition): clarify applicant selection` |
| Applicant Reverification | 保存 R2 後完整 AI Verification 與等待人工狀態 | 68 個 Vitest、14 個 Chromium 流程、typecheck、lint、build、文件一致性 | passed | `docs(FS-004): update applicant selection verification` |
| F1 | 將 Playwright specs 納入獨立 TypeScript project 與根 project references | typecheck、lint、68 個 Vitest、build、14 個 Chromium 流程 | passed | `fix(testing): typecheck playwright specifications` |
| E2E Typecheck Reverification | 記錄 E2E typecheck 缺口修正與完整重新驗證 | 完整 AI Verification 證據、文件一致性、`git diff --check` | passed | `docs(FS-004): record e2e typecheck correction` |

## Human Integration

### Required Work

1. 確認真實後端提供不帶 Query Parameter 的規則／老師 API，以及未登入、不需 Cookie／CSRF 的 multipart 送件 API。
2. 使用含 `pointIncrement` 的真實 `per_person` 與多人 `shared_total` 規則，確認正常流程規則與老師各只查詢一次。
3. 使用真實 PDF、JPEG、PNG，驗證副檔名、MIME、內容、5 MiB、10 檔與必要附件分類。
4. 確認相同 Key／相同 request 重試不重複建立案件；確認 409、422、429、5xx 與 `Retry-After` 的真實行為。

### Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- Notes: `pending`

## Human Acceptance Instructions

### Preconditions

- 已執行 `npm ci`，以 `npm run dev` 啟動前端，API Base URL 指向符合 FS-004 契約的測試後端。
- 未登入瀏覽器 session，DevTools Network 保持開啟。

### Test Data

- 一組 `per_person` 規則、一組可由兩人合法分完的 `shared_total` 規則及至少一位有效老師。
- PDF、JPEG、PNG 各一份；另準備超過 5 MiB、錯誤類型及可測試第 11 份附件的檔案。
- 可切換規則／老師 empty、失敗、規則失效、429、5xx 的測試環境或後端 fixture。

### Browser / Device / Viewport

- Desktop Chrome，建議 1280 × 800。
- Chrome responsive mode，360 × 800。

### Steps and Expected Results

| Step | Action | Expected Result |
|---|---|---|
| 1 | 未登入開啟 `/apply/competition` 並觀察 Network。 | 第一個步驟為「競賽內容」，不顯示參與者欄位；只查詢一次規則且不帶 query。 |
| 2 | 選定 `per_person` 規則並進入「參與者資料」，不選申請人便按下一步。 | 表單顯示目前臺灣學年度，初始沒有申請人且不顯示 Email、電話；錯誤摘要及參與者區域顯示「請先選擇一位參與者作為申請人。」，並聚焦第一個「設為申請人」按鈕。 |
| 3 | 將其中一位參與者設為申請人，再改選另一位。 | 選定後錯誤立即清除，該卡片顯示「目前申請人」與 Email、電話；改選前要求確認，確認後聯絡資料被清除並移至新卡片，且不可直接取消目前申請人。 |
| 4 | 上傳合法附件、查看確認頁並送出。 | multipart 欄位與分類正確，payload 恰好一位 `isApplicant = true`，不帶 Cookie／CSRF；成功頁顯示申請編號、等待老師簽核、台北時間與 Email 提醒，不顯示簽核期限。 |
| 5 | 完成一筆兩人 `shared_total` 流程。 | 每人至少 0.50、以 0.50 為單位且總和等於總點數後才能送件。 |
| 6 | 測試錯誤格式、超過 5 MiB、第 11 檔及缺少必要分類。 | 前端阻擋或顯示對應附件訊息，既有資料保留。 |
| 7 | 測試規則／老師 empty、failure 與規則失效。 | empty 與 failure 文案不同；重載可恢復；新規則會重設點數或清除失效組合。 |
| 8 | 觸發 429 與一次 Response 不確定的 5xx／連線中斷後重新確認。 | 429 顯示等待提示；不確定狀態不宣告失敗，相同 Key 重試且只建立一筆案件。 |
| 9 | 修改資料後離開頁面，並在 360px／鍵盤重複主要流程。 | 離開前警告；焦點、錯誤摘要、Dialog、附件與按鈕可操作，無非必要水平捲動。 |

### Known Limitations

- `pointIncrement` 已納入 API contract，但核准的第一版分配規則固定使用 0.50。
- 跨來源開發環境若未 expose `Retry-After`，只能顯示通用 Rate Limit 提示。
- Production bundle 超過 Vite 預設 500 kB 警示；本 Slice 未核准 bundle budget 或 code-splitting 工作。

## Human Acceptance Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- User Feedback: `pending`

## Final Summary

- AI Verification: `passed；E2E specs 已納入 typecheck；App、Node config、E2E TypeScript、lint、68 個 Vitest、production build 與 14 個 Chromium 流程均通過。`
- Human Integration: `pending；需以真實公開端點、檔案及 Idempotency 行為確認。`
- Human Acceptance: `pending；等待使用者依上述步驟驗收。`
- Remaining Issues: `真實後端整合與 Human Acceptance 待確認；另有非阻擋 bundle size 警示。`
- Final Feature Slice Status: `awaiting-human`

## Document Lineage Update

- Slice Brief Link: `docs/blueprint/slices/FS-004-competition-application.md`
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
