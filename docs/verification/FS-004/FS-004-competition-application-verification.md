# FS-004 — Competition Application Verification

## Document Information

- Feature Slice: `FS-004`
- Change Type: `feature`
- Verification Status: `awaiting-human`
- Created: `2026-08-13`
- Last Updated: `2026-08-14`

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
- 使用者於 Human Acceptance 前要求調整錯誤呈現：可定位欄位錯誤改在控制項下方顯示並加紅框，區塊錯誤留在相關區塊，只有無法定位與系統錯誤使用頁面內提示；一般錯誤不使用瀏覽器原生 `alert()`。
- 修訂提出後尚未實作時，既有 AI Verification 證據只代表修訂前版本，FS-004 曾返回 `awaiting-approval`。
- 使用者於 2026-08-13 核准修訂後的 Spec、Plan 與 Commit Plan，授權後續 R3 實作與重新驗證。
- 已完成並提交 R3：前端逐步驗證與後端 422 欄位錯誤統一寫入 React Hook Form errors；主要欄位訊息就地呈現並具有紅框、`aria-invalid` 與描述關聯。
- 跨欄位／集合錯誤顯示於參與者或附件等相關區塊；無法定位、Rate Limit、Network、5xx 與結果不確定狀態維持頁面內提示，未使用瀏覽器原生 `alert()`。
- R3 後 typecheck、lint、69 個 Vitest、production build 與 15 個 Chromium 流程均通過；但完整 Spec 核對發現 `participants.*.grade`、`participants.*.classNumber`、`attachments.*.attachmentType` 與 `attachments.*.description` 的 server 422 path 尚未就地顯示，因此 Target Behavior 尚未完全通過。
- 使用者於 2026-08-14 核准新增 F2 fix batch；F2 已補齊上述四類可定位 422 path 的就地錯誤、紅框、ARIA、清除行為與相關測試。
- F2 後完整 AI Verification 已通過：typecheck、lint、13 files／73 tests、production build 與 15 個 Chromium 流程均成功；靜態 path 核對確認四類 server 422 均有對應控制項。
- 使用者於 2026-08-14 Human Acceptance 提出 shared point allocation 與學年度顯示修訂：shared 全員從 0.00 開始、以自訂 0.50 加減按鈕或手動輸入分配、摘要移至參與者清單上方，且競賽表單與確認頁隱藏學年度但 payload 保留系統值。
- 現有程式仍採修訂前 shared 預設分配、摘要位置與學年度顯示，因此既有 F2 證據不代表新 Target Behavior；FS-004 在重新核准前曾退回 `awaiting-approval`。
- 使用者已於 2026-08-14 核准修訂後的 Spec、Plan 與 Commit Plan；R4 已完成並提交為 `a67fc1b`。
- R4 後完整 AI Verification 已通過：typecheck、lint、13 files／75 tests、production build 與 15 個 Chromium 流程均成功。
- AI conformance review 發現 `@hookform/resolvers` 雖已安裝，但 `useForm()` 未接入 `zodResolver`；逐步手寫驗證與最終手動 `safeParse()` 形成重複且可能不同步的靜態規則來源。
- 使用者已於 2026-08-14 確認 Resolver 整合方案並要求開始修改；F3 核准範圍為接入 `zodResolver`、以 `trigger()`／`handleSubmit()` 執行 Schema，並保留 server-dependent 領域驗證與後端 422 mapping。
- F3 已完成並提交為 `971edb2`；頁面實際 import `@hookform/resolvers/zod`，`useForm()` 接入 Resolver，逐步與完整送件分別使用 `trigger()` 與 `handleSubmit()`。
- F3 後完整 AI Verification 已通過：typecheck、lint、13 files／76 tests、production build 與 15 個 Chromium 流程均成功。
- 真實後端、CORS、Rate Limit header、檔案內容檢查及不重複建立案件仍須由 Human Integration 確認。

## Approved Resolver Integration Correction

- React Hook Form 透過 `zodResolver` 使用競賽 Form Schema，必填、格式、長度與靜態跨欄位規則不再於頁面重複實作。
- 下一步以 `trigger()` 驗證目前步驟，最終送件以 `handleSubmit()` 執行完整 Schema；Zod errors 直接進入 `formState.errors`。
- 有效 API 組合、動態人數與點數、老師有效性等 server-dependent 規則維持獨立領域驗證，後端 422 繼續使用 `setError()`。
- 現有錯誤文案與位置、第一錯誤焦點、ARIA、360px、資料保留、payload 與 Idempotent retry 必須維持。
- 已完成：頁面只保留 API 組合、動態人數／點數與老師有效性領域驗證；後端 422 維持 `setError()`，靜態規則與 Zod issue mapping 不再重複於頁面。

### Resolver Integration Omission Record

- 原始需求並未缺漏：`docs/project/frontend-architecture.md` 已規定申請表單使用 React Hook Form 與 Zod Resolver，FS-004 Plan 也明確要求「安裝並設定 FS-004 實際使用的 React Hook Form 與 Zod Resolver」。
- I1 只將 `react-hook-form` 與 `@hookform/resolvers` 加入依賴；I5 實作雖使用 `useForm()` 保存表單狀態，卻未設定 `resolver`，改由頁面手寫 `validateStep()` 執行逐步驗證，最終送件時才手動呼叫 Zod `safeParse()`。
- 手寫驗證複製了大部分 Schema 規則，使必填阻擋、錯誤顯示與送件流程仍可通過當時的元件、整合與 E2E 測試；原驗證只確認依賴安裝與可見行為，沒有核對 `zodResolver` 是否實際接入 `useForm()` 的執行路徑，因此未在最初 AI Verification 發現。
- R3 將前端與後端錯誤統一寫入 React Hook Form `setError()`／`clearErrors()`，但當時的修正重點是就地錯誤呈現，仍保留手寫 `validateStep()` 與 `safeParse()`，所以 Resolver 整合缺口繼續存在。
- 本事件定性為實作與驗證疏漏，不是需求或討論未定義，也不是 Feature Slice skill 限制。F3 已於 commit `971edb2` 完成 Resolver 整合，commit `627b387` 保存完整重新驗證結果。
- 使用者於 2026-08-14 決定只保留本次個案紀錄，不因此新增通用工作流程規則。

## Approved Shared Point Allocation Revision

- `shared_total` 不論一人或多人皆從 0.00 開始，新增參與者亦為 0.00，不進行預先分配。
- 團隊總點數、已分配與剩餘點數摘要移至參與者清單上方；個別點數使用每次 0.50 的「−」／「＋」按鈕並保留手動輸入。
- 競賽表單與確認頁不顯示學年度，但每位參與者的 payload 仍包含 Asia/Taipei 系統學年度。
- 前次 Human Acceptance 結果為 `changes-requested`；修訂文件、R4 與完整 AI Verification 均已完成，現重新進入 Human Acceptance。

## Completed Shared Point Allocation Revision

- `shared_total` 初始化、加入參與者及切換規則均將每位參與者設為 0.00；既有 `per_person` 固定點數維持唯讀。
- 參與者清單上方顯示團隊總點數、已分配與剩餘點數；自訂「−」／「＋」每次調整 0.50，並保留文字輸入。
- 0.00 時停用減號，剩餘不足 0.50 或輸入無效時停用加號；完整最低值、倍數與總和驗證仍由既有整數點數模型處理。
- 競賽參與者步驟與確認頁已隱藏學年度，Mapper 與 multipart submission tests 確認每位參與者 payload 仍包含系統學年度 `115`。

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

## Approved Field Error Presentation Revision

- 前端驗證與後端 `422 fields[].path` 統一寫入 React Hook Form errors。
- 單一欄位錯誤顯示於控制項下方，搭配紅色邊框、`aria-invalid`、錯誤描述關聯及第一個錯誤焦點。
- 點數總和、參與者集合及必要附件等錯誤顯示於相關區塊；Network、5xx、429、結果不確定與無法定位錯誤使用頁面內提示。
- 修訂後 Spec、Plan 與 Commit Plan 已由使用者核准，並已完成 R3 與重新驗證。

## Completed Field Error Presentation Revision

- 使用 React Hook Form `setError`／`clearErrors` 統一管理前端與 server field errors，移除頁面獨立欄位錯誤 state。
- 競賽、參與者姓名／學號／年級／班級／點數、申請人、老師、附件分類／說明、必要附件及其他附件類型已能就地顯示錯誤，動態 index path 與後端契約一致。
- F2 已為年級、班級、附件分類與附件說明補上紅框、`aria-invalid`、描述關聯、焦點定位、個別清除及 component／page integration tests。
- 欄位修正後只清除對應錯誤；第一個錯誤焦點、資料保留、步驟返回與 Idempotent retry 行為保持不變。

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
| `src/features/applications/competition/competition-application-page.tsx` | 以 React Hook Form errors 統一逐步驗證、422 映射、欄位清除、步驟返回與焦點。 |
| `src/features/applications/competition/components/competition-details-step.tsx` | 競賽欄位加入就地錯誤、紅框與 ARIA 關聯。 |
| `src/features/applications/common/components/participants-editor.tsx`、`advisor-selector.tsx`、`attachment-editor.tsx`、`error-summary.tsx` | 參與者、聯絡、點數、老師與附件加入欄位／區塊錯誤呈現，將摘要元件改為欄位訊息 helper。 |
| `src/features/applications/competition/competition-application-page.test.tsx`、`src/features/applications/common/components/application-controls.test.tsx`、`e2e/competition-application.spec.ts` | 覆蓋前端與 422 錯誤、紅框、ARIA、修正清除、非原生彈窗、焦點與 360px 回歸。 |
| `src/features/applications/competition/model/competition-points.ts`、`src/features/applications/common/components/participants-editor.tsx` | 將 shared 初始／新增點數改為 0.00，加入整數點數加減控制與按鈕邊界。 |
| `src/features/applications/competition/competition-application-page.tsx`、`components/competition-confirmation-step.tsx` | 將 shared 摘要移至參與者清單上方，並隱藏競賽畫面與確認頁的學年度。 |
| R4 model、component、page 與 Playwright tests | 覆蓋 shared 0.00、加減／手動輸入、摘要順序、學年度顯示及 payload 保留。 |
| `src/features/applications/competition/model/competition-application.schema.ts` | 補齊 Resolver 所需靜態欄位訊息、條件式聯絡資料、必要選擇與跨欄位路徑。 |
| `src/features/applications/competition/competition-application-page.tsx` | 接入 `zodResolver`、`trigger()` 與 `handleSubmit()`，分離 server-dependent 領域驗證並保留 422 mapping。 |
| `src/features/applications/competition/competition-application-page.test.tsx` | 驗證 Schema-only 長度規則由 Resolver 阻擋目前步驟，且未提前阻擋未來步驟。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | passed | exit code 0 | App、Node config 與全部 `e2e/**/*.ts` project references 均通過；`Buffer` 已由 Node types 正確解析。 |
| Lint | `npm run lint` | passed | exit code 0 | ESLint 無 error 或 warning。 |
| Unit / Integration Tests | `npm run test` | passed | 13 files、76 tests passed | 覆蓋 Resolver current-step 驗證、Schema-only 規則、transport、點數、422、Idempotent retry 與既有五步流程。 |
| Production Build | `npm run build` | passed | exit code 0；478 modules transformed | Bundle 成功產生；有超過 Vite 預設 500 kB 的非阻擋警示。 |
| Browser / Responsive | `npm run test:e2e -- e2e/application-entry.spec.ts e2e/published-instructions.spec.ts e2e/competition-application.spec.ts --project=chromium` | passed | 15 tests passed | 覆蓋 shared 0.00、摘要順序、加減／手動輸入、按鈕邊界、學年度 payload、入口、公開辦法、360px、Dialog 與無水平溢位。 |
| Target Behavior | 既有 Spec／架構、F3 程式與自動測試核對 | passed | Resolver import／configuration、page integration、完整 Chromium suites | React Hook Form 與 Zod 已經由 Resolver 整合；逐步、完整送件、動態規則與 422 使用同一 error state 且既有產品行為保持通過。 |
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
| `shared_total` 全員 0.00、自訂加減／手動輸入及摘要上移 | passed | model、ParticipantsEditor、page integration 與 shared-total Chromium flow。 |
| 競賽畫面隱藏學年度但 payload 保留系統值 | passed | Page／confirmation assertions、Mapper unit test 與 multipart Chromium body。 |
| 附件格式、大小、數量、metadata、預覽與 URL 清理 | passed | attachment validation／component tests、multipart contract 與 browser upload。 |
| HTTP 201、422、400、409、429、5xx 與不可變 retry | passed | API／page integration tests與 Chromium same-key retry。 |
| 公開未登入 multipart 不帶 Cookie／CSRF，且 Key／檔案不持久化 | passed | API client、submit contract 與 static implementation inspection。 |
| 鍵盤、Dialog 焦點、錯誤定位、44px 與 360px | passed | Common component tests、application entry keyboard flow 與 mobile full flow。 |
| 前端／422 欄位錯誤就地呈現、紅框、ARIA 與修正清除 | passed | Component／page integration 覆蓋全部既定欄位 path；Chromium 驗證主要流程與就地錯誤互動。 |
| 區塊錯誤與頁面內系統提示分層，不使用原生 `alert()` | passed | Participants／Attachment integration 與未知 4xx system-message test。 |
| React Hook Form 透過 Zod Resolver 執行靜態逐步與完整送件驗證 | passed | Resolver 接入靜態核對、Schema-only 長度 page test、既有逐步與送件 integration／Chromium flows。 |

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
| 前端與後端欄位錯誤顯示於對應控制項下方並可個別清除 | passed | 73 個 Vitest 包含年級、班級、附件分類與附件說明的 indexed 422 mapping、ARIA 與個別清除。 |
| 跨欄位／集合錯誤與系統錯誤呈現在正確層級 | passed | Participants、attachments、429、unknown 4xx、5xx 與 Network tests。 |
| shared 分配不預填且提供 0.50 加減與手動輸入 | passed | Points model、ParticipantsEditor、page integration 與 Chromium shared-total flow。 |
| 畫面不顯示學年度但正式 payload 保留系統值 | passed | Confirmation／page tests、Mapper 與 multipart request assertion。 |
| 靜態規則由 Zod Resolver 統一，動態 API 規則與 422 保持正確 | passed | Page integration 覆蓋 current-step、shared rules、advisor、422 與 same-key retry；15 個 Chromium flows 通過。 |

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
| Field Error Revision Draft | 保存錯誤呈現需求、draft Spec／Plan 與等待核准狀態 | 文件一致性、`git diff --check` | passed | `docs(FS-004): revise competition application requirements` |
| Field Error Approval | 重新核准錯誤呈現 Spec、Plan 與 Commit Plan | 文件一致性、`git diff --check` | passed | `docs(FS-004): approve field error presentation` |
| R3 | 以 React Hook Form 統一欄位錯誤並提供就地錯誤、紅框、區塊及系統提示 | 21 個 targeted Vitest、typecheck、lint、69 個 Vitest、build、6 個 targeted Chromium | passed | `fix(competition): localize form validation feedback` |
| Field Error Reverification | 保存修訂後完整 AI Verification 與等待人工狀態 | 69 個 Vitest、15 個 Chromium、typecheck、lint、build、Spec 核對 | failed | `docs(FS-004): record field error verification` |
| Field Error Fix Approval | 保存已核准的補強 batch 與進行中狀態 | 文件一致性、`git diff --check` | passed | `docs(FS-004): approve field error fix plan` |
| F2 | 補齊年級、班級、附件分類與附件說明的可定位 422 就地錯誤及測試 | 25 個 targeted Vitest、typecheck、lint、73 個 Vitest、build、6 個 targeted Chromium | passed | `fix(competition): complete field error coverage` |
| Field Error Fix Reverification | 保存 F2 後完整 AI Verification 與適當狀態 | 73 個 Vitest、15 個 Chromium、typecheck、lint、build、Spec／path 核對 | passed | `docs(FS-004): record field error fix verification` |
| Shared Point Revision Draft | 保存 shared point allocation 與學年度顯示修訂文件及等待核准狀態 | 文件一致性、`git diff --check` | passed | `docs(FS-004): revise shared point allocation flow` |
| Shared Point Approval | 重新核准修訂後 Spec、Plan 與 Commit Plan | 文件一致性、`git diff --check` | passed | `docs(FS-004): approve shared point allocation revision` |
| R4 | 實作 shared 0.00、加減控制、摘要上移與隱藏學年度顯示 | 32 個 targeted Vitest、typecheck、lint、75 個 Vitest、build、6 個 targeted Chromium | passed | `fix(competition): improve shared point allocation controls` |
| Shared Point Reverification | 保存 R4 後完整 AI Verification 與等待人工狀態 | 75 個 Vitest、15 個 Chromium、typecheck、lint、build、文件一致性 | passed | `docs(FS-004): record shared point allocation verification` |
| Resolver Fix Approval | 保存 Resolver 整合修正、驗證範圍與進行中狀態 | 文件一致性、`git diff --check` | passed | `docs(FS-004): approve resolver integration fix` |
| F3 | 接入 `zodResolver`、`trigger()`／`handleSubmit()`，分離領域驗證並保留 422 mapping | 23 個 targeted Vitest、typecheck、lint、76 個 Vitest、build、6 個 targeted Chromium | passed | `fix(competition): integrate zod form resolver` |
| Resolver Reverification | 保存 F3 後完整 AI Verification 與等待人工狀態 | 76 個 Vitest、15 個 Chromium、typecheck、lint、build、文件一致性 | passed | `docs(FS-004): record resolver integration verification` |

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
| 2 | 選定 `per_person` 規則並進入「參與者資料」，不選申請人便按下一步。 | 表單與後續確認頁不顯示學年度；初始沒有申請人且不顯示 Email、電話。參與者區域顯示「請先選擇一位參與者作為申請人。」，並聚焦第一個「設為申請人」按鈕；送件 payload 仍為每位參與者帶入系統學年度。 |
| 3 | 將其中一位參與者設為申請人，再改選另一位。 | 選定後錯誤立即清除，該卡片顯示「目前申請人」與 Email、電話；改選前要求確認，確認後聯絡資料被清除並移至新卡片，且不可直接取消目前申請人。 |
| 4 | 上傳合法附件、查看確認頁並送出。 | multipart 欄位與分類正確，payload 恰好一位 `isApplicant = true`，不帶 Cookie／CSRF；成功頁顯示申請編號、等待老師簽核、台北時間與 Email 提醒，不顯示簽核期限。 |
| 5 | 完成一筆兩人 `shared_total` 流程。 | 摘要位於參與者清單上方；兩人皆從 0.00 開始，可用每次 0.50 的「−」／「＋」按鈕或手動輸入。按鈕不會產生負數或超額分配；完成時每人至少 0.50 且總和等於總點數後才能送件。 |
| 6 | 測試錯誤格式、超過 5 MiB、第 11 檔及缺少必要分類。 | 前端阻擋或顯示對應附件訊息，既有資料保留。 |
| 7 | 測試規則／老師 empty、failure 與規則失效。 | empty 與 failure 文案不同；重載可恢復；新規則會重設點數或清除失效組合。 |
| 8 | 觸發 429 與一次 Response 不確定的 5xx／連線中斷後重新確認。 | 429 顯示等待提示；不確定狀態不宣告失敗，相同 Key 重試且只建立一筆案件。 |
| 9 | 修改資料後離開頁面，並在 360px／鍵盤重複主要流程。 | 離開前警告；焦點、就地錯誤、頁面內系統提示、Dialog、附件與按鈕可操作，無非必要水平捲動。 |
| 10 | 在各步驟留下必填欄位空白、輸入無效值，再觸發一筆後端 422 欄位錯誤。 | 訊息顯示於對應控制項下方，控制項有紅色邊框及可存取錯誤狀態；修正後該錯誤清除，頁面頂端不重複列出欄位錯誤。 |
| 11 | 觸發點數總和／必要附件等區塊錯誤，以及 Network／5xx／429 系統錯誤。 | 區塊錯誤靠近相關內容；系統錯誤使用頁面內提示並提供既有恢復操作，不出現瀏覽器原生錯誤彈窗。 |

### Known Limitations

- `pointIncrement` 已納入 API contract，但核准的第一版分配規則固定使用 0.50。
- 跨來源開發環境若未 expose `Retry-After`，只能顯示通用 Rate Limit 提示。
- Production bundle 超過 Vite 預設 500 kB 警示；本 Slice 未核准 bundle budget 或 code-splitting 工作。

## Human Acceptance Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- User Feedback: `pending；前次 changes-requested 已由 R4 處理，等待使用者依更新後步驟重新驗收。`

## Final Summary

- AI Verification: `passed；F3 後 typecheck、lint、76 個 Vitest、production build、15 個 Chromium 流程及 Resolver／Target Behavior 核對均通過。`
- Human Integration: `pending；需以真實公開端點、檔案及 Idempotency 行為確認。`
- Human Acceptance: `pending；等待使用者依 R4 更新後步驟重新驗收。`
- Remaining Issues: `待完成 Human Integration 與 Human Acceptance；另有非阻擋 bundle size 警示。Resolver 架構落差已由 F3 解決。`
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
