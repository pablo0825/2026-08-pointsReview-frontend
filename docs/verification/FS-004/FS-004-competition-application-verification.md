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
- 真實後端、CORS、Rate Limit header、檔案內容檢查及不重複建立案件仍須由 Human Integration 確認。

## Changed Files

| File | Change |
|---|---|
| `package.json`、`package-lock.json` | 加入並鎖定 React Hook Form 與 Zod Resolver。 |
| `src/shared/lib/academic-year.ts`、`academic-year.test.ts` | 提升 Asia/Taipei 學年度與日期 helper，供規則及申請共用。 |
| `src/shared/api/api-client.ts`、`api-client.test.ts` | 加入公開 multipart、結構化錯誤、`Retry-After` 與預期 HTTP status 驗證。 |
| `src/features/applications/common/lib/**` | 建立百分之一點整數解析、格式化、加總與倍數驗證。 |
| `src/features/applications/common/components/**` | 建立 Wizard、參與者、老師、附件、錯誤摘要及離開確認控制項。 |
| `src/features/applications/competition/api/**` | 建立規則、老師、payload、成功 Response schemas、queries 與 multipart submit。 |
| `src/features/applications/competition/model/**` | 建立表單、Mapper、點數分配、正規化及 submission state。 |
| `src/features/applications/competition/components/**` | 建立競賽內容、確認、結果不確定與成功畫面。 |
| `src/features/applications/competition/competition-application-page.tsx` | 串接五步流程、單次查詢、錯誤恢復、Idempotency 與 route page。 |
| `src/test/**`、`src/features/applications/**/*.test.ts*` | 加入匿名 fixtures、MSW handlers 與單元／元件／整合覆蓋。 |
| `src/app/router/router.tsx`、`router.test.tsx` | 以正式競賽表單取代 placeholder 並回歸公開 routes。 |
| `e2e/application-entry.spec.ts`、`e2e/competition-application.spec.ts` | 覆蓋入口、兩種點數、multipart、Idempotent retry、desktop 與 360px。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | passed | exit code 0 | TypeScript project references 通過。 |
| Lint | `npm run lint` | passed | exit code 0 | ESLint 無 error 或 warning。 |
| Unit / Integration Tests | `npm run test` | passed | 13 files、65 tests passed | 覆蓋 transport、schemas、點數、元件、五步流程及錯誤恢復。 |
| Production Build | `npm run build` | passed | exit code 0；476 modules transformed | Bundle 成功產生；有超過 Vite 預設 500 kB 的非阻擋警示。 |
| Browser / Responsive | `npm run test:e2e -- e2e/application-entry.spec.ts e2e/published-instructions.spec.ts e2e/competition-application.spec.ts --project=chromium` | passed | 13 tests passed | 覆蓋入口、公開辦法、競賽申請、desktop、360px、Dialog 焦點與無水平溢位。 |
| Target Behavior | Spec 與自動化逐項核對 | passed | 65 Vitest assertions、13 Chromium flows | 驗證單次查詢、兩種點數、multipart、錯誤定位及 Idempotency。 |
| FS-002／FS-003 Regression | 完整 Vitest、入口與公開辦法 Chromium suites | passed | 既有 `/apply`、`/rules`、Router、Provider 與 GET client 均通過 | 未修改其他三類 placeholder。 |

## AI Acceptance Summary

| Criterion | Result | Evidence |
|---|---|---|
| 五步導覽、逐步驗證、返回修改、dirty-state 與離開警告 | passed | Page integration、Wizard 與 Leave Dialog tests。 |
| 學年度、參與者、申請人、學號與聯絡資料規則 | passed | academic-year、form schema、Mapper 與 ParticipantsEditor tests。 |
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
| Verification | 保存完整 AI Verification 與狀態 | 本文件、文件一致性、`git diff --check` | passed | `docs(FS-004): record competition application verification` |

## Human Integration

### Required Work

1. 確認真實後端提供不帶 Query Parameter 的規則／老師 API，以及未登入、不需 Cookie／CSRF 的 multipart 送件 API。
2. 使用真實 `per_person` 與多人 `shared_total` 規則，確認正常流程規則與老師各只查詢一次。
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
| 1 | 未登入開啟 `/apply/competition` 並觀察 Network。 | 只查詢一次規則，不帶 query；表單顯示目前臺灣學年度。 |
| 2 | 完成一筆 `per_person` 單人流程。 | 點數自動且唯讀；進入老師步驟才查詢一次老師，返回步驟不重查。 |
| 3 | 上傳合法附件、查看確認頁並送出。 | multipart 欄位與分類正確，不帶 Cookie／CSRF；成功頁顯示申請編號、等待老師簽核、台北時間與 Email 提醒，不顯示簽核期限。 |
| 4 | 完成一筆兩人 `shared_total` 流程。 | 每人至少 0.50、以 0.50 為單位且總和等於總點數後才能送件。 |
| 5 | 測試錯誤格式、超過 5 MiB、第 11 檔及缺少必要分類。 | 前端阻擋或顯示對應附件訊息，既有資料保留。 |
| 6 | 測試規則／老師 empty、failure 與規則失效。 | empty 與 failure 文案不同；重載可恢復；新規則會重設點數或清除失效組合。 |
| 7 | 觸發 429 與一次 Response 不確定的 5xx／連線中斷後重新確認。 | 429 顯示等待提示；不確定狀態不宣告失敗，相同 Key 重試且只建立一筆案件。 |
| 8 | 修改資料後離開頁面，並在 360px／鍵盤重複主要流程。 | 離開前警告；焦點、錯誤摘要、Dialog、附件與按鈕可操作，無非必要水平捲動。 |

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

- AI Verification: `passed；所有核准檢查已於 2026-08-13 重新執行並通過。`
- Human Integration: `pending；需以真實公開端點、檔案及 Idempotency 行為確認。`
- Human Acceptance: `pending；等待使用者依上述步驟驗收。`
- Remaining Issues: `真實後端整合待確認；另有非阻擋 bundle size 警示。`
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
