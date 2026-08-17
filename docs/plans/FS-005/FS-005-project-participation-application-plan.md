# FS-005 — Project Participation Application Plan

## Document Information

- Feature Slice: `FS-005`
- Change Type: `feature`
- Document Status: `completed`
- Based On Spec: `docs/specs/FS-005/FS-005-project-participation-application-spec.md`
- Spec Last Updated: `2026-08-17`
- Created: `2026-08-16`
- Last Updated: `2026-08-17`

## Implementation Goal

在 FS-003 的公開入口與 FS-004 已驗證的申請基礎上，維持已完成的老師、附件、公開 multipart、Idempotency、薪資試算與單人五步表單；修訂第一步文案、移除非必要薪資限制提示，並將年級／班級選項及格式化抽成 FS-004、FS-005 共用來源，畫面顯示正式名稱而 Wire Payload 維持數字代碼。

## Current Implementation Assessment

### Existing Behavior and Gaps

- `/apply/project-participation`、試算、單人五步表單、老師、附件、multipart、Idempotency、錯誤與成功狀態均已實作並完成第一輪 AI Verification。
- 第一個步驟仍顯示「計畫內容與薪資試算」，須精簡為「計畫與薪資試算」；薪資區塊仍顯示「每月 1～50,000 元，最多 12 個不同月份。」提示，須移除但保留驗證規則。
- FS-004 的 `ParticipantsEditor` 已將 `grade`／`classNumber` 對應為「大一～碩二」與「甲班～戊班」；FS-005 的 `ProjectApplicantStep` 與確認摘要卻直接組合數字，造成同一代碼在兩個申請流程顯示不一致。
- 年級／班級對照目前私有於 `ParticipantsEditor`；若只在 FS-005 再複製一份，未來仍可能漂移。

### Reusable Components and Integration Points

- `src/features/applications/common/components/application-wizard.tsx`：直接沿用五步進度、只能返回前面已完成步驟及下一步控制。
- `src/features/applications/common/components/advisor-selector.tsx`：保留搜尋、職稱 fallback、單選與欄位錯誤 UI；型別來源移至 common 公開申請契約。
- `src/features/applications/common/components/attachment-editor.tsx`：保留檔案格式／大小／數量、UUID、重複提示、預覽與 metadata 編輯；改由呼叫端傳入分類選項與預設分類。
- `src/features/applications/common/components/leave-confirmation-dialog.tsx`、`error-summary.tsx`：沿用離開警告與欄位就地錯誤樣式。
- `src/features/applications/common/lib/points.ts`：沿用兩位小數字串的解析／顯示；不加入薪資換算公式。
- `src/features/applications/common/lib/student-profile-options.ts`：新增共用年級／班級選項與格式化函式；FS-004、FS-005 使用同一來源，數字值不變。
- `src/shared/lib/academic-year.ts`：沿用 Asia/Taipei 8 月 1 日分界，Mapper 動態帶入但畫面不顯示。
- `src/shared/api/api-client.ts`：新增公開 JSON POST，並保留 GET、multipart、AbortSignal、結構化錯誤與安全 Response 驗證行為。
- `GET /public/advisors`：FS-004 與 FS-005 共用同一 Query key、cache 與 response schema，不重複建立 feature 專屬查詢。
- `POST /public/point-estimates/project-participation`：以 TanStack Query Mutation 只在使用者明確按下試算時呼叫；Mutation 保持無自動 retry。
- `POST /public/applications`：共用 multipart transport、成功 schema 與不可變 snapshot 規則，payload／附件 metadata 由 FS-005 專屬 Mapper 建立。

### Preserved Behavior and Regression Risks

- `/`、`/apply`、`/rules`、`/apply/competition`、證照與展覽 placeholder 行為不得改變；尤其 FS-004 的附件分類、預設值、multipart、Idempotency 與成功／錯誤流程必須完整回歸。
- 共用公開老師與送件契約時，Query key 或 import 變更不可造成競賽頁重複查詢、cache 行為改變或 runtime cycle。
- 抽出年級／班級標籤時不得改變 FS-004 的既有選項順序、顯示文字、表單數字值或正式 payload。
- 泛化 `AttachmentEditor` 時，競賽仍須顯示原七種分類並預設 `participation_proof`；參與計畫只顯示三種分類並預設 `salary_proof`。
- 薪資資料異動與非同步試算 Response 可能競速；結果必須綁定送出時的薪資快照，舊 Response 不得重新核准已修改的表單。
- 試算 `isEligible: false` 是有效 Response；若誤用 Query error state，會顯示錯誤提示或允許沿用舊點數。
- 正式送件的 `requestedPoints`、薪資明細、File 與 Idempotency Key 必須來自同一不可變快照；任何編輯都必須建立新的邏輯送件。
- 動態學年度只存在 Form Model／payload；隱藏畫面時不可誤刪 `participants[0].academicYear`。
- 後端欄位路徑在試算與正式送件具有不同前綴；映射錯誤會將訊息放到錯誤步驟或無法聚焦。

### Constraints and Unknowns

- 使用既有 React 19、React Router 7、TanStack Query 5、React Hook Form、Zod、Tailwind CSS、Vitest／Testing Library／MSW／Playwright；不需新增套件。
- Wire、Form、試算狀態與 View Model 分離；所有 Response 先通過 Zod，不以型別斷言略過 runtime contract。
- 薪資使用安全整數，點數只使用後端兩位小數字串；前端不得硬編碼薪資換算公式或 1,000 元門檻。
- File、學生資料、Idempotency Key、試算資料與送件快照只留在記憶體，不寫入 URL 或任何瀏覽器儲存。
- 真實後端測試資料與錯誤情境留給 Human Integration；不阻擋以已確認契約和 MSW 實作。

## Scope Delta

2026-08-17 Human Acceptance 修訂只改變可見文案與學籍代碼的顯示轉換：第一步名稱精簡、薪資限制提示移除、FS-005 顯示與 FS-004 相同的正式年級／班級名稱；所有欄位限制與 API Integration Contract 不變。

## Files

### Create

- `src/features/applications/common/lib/student-profile-options.ts`：共用 `grade`／`classNumber` 數字代碼、正式顯示名稱、選項及格式化函式。
- `src/features/applications/common/lib/student-profile-options.test.ts`：驗證完整代碼對照、未知值 fallback 與數字值不變。

- `src/features/applications/common/api/public-application.schema.ts`：共用公開老師、成功 Response、附件 metadata 與基礎 applicant／participant Wire schemas。
- `src/features/applications/common/api/public-advisors.query.ts`：共用老師 Query key、fetch function 與 Response 驗證。
- `src/features/applications/common/api/public-application.submit.ts`：泛型不可變 snapshot、FormData 建立與公開 multipart 送件。
- `src/features/applications/common/components/application-submission-state.tsx`：共用結果不確定與成功送件畫面。
- `src/features/applications/project-participation/api/project-participation.schema.ts`：試算 request／response、參與計畫 payload、附件分類與正式成功 Wire schemas。
- `src/features/applications/project-participation/api/project-participation.estimate.ts`：公開 JSON 試算 request function。
- `src/features/applications/project-participation/api/project-participation.submit.ts`：FS-005 payload snapshot 與共用 multipart 的型別化包裝。
- `src/features/applications/project-participation/model/project-participation.schema.ts`：五步 Form schema、預設值、薪資及單一申請人規則。
- `src/features/applications/project-participation/model/project-participation.mapper.ts`：trim、大寫、動態學年度、空值與正式 payload mapping。
- `src/features/applications/project-participation/model/project-estimate-state.ts`：薪資快照指紋、試算有效／不合格／失效狀態及 stale Response 防護。
- `src/features/applications/project-participation/components/project-details-step.tsx`：計畫欄位、薪資明細、手動試算、資格與錯誤 UI。
- `src/features/applications/project-participation/components/project-applicant-step.tsx`：單一申請人的學籍及聯絡資料卡片。
- `src/features/applications/project-participation/components/project-confirmation-step.tsx`：四區唯讀確認摘要。
- `src/features/applications/project-participation/project-participation-application-page.tsx`：Queries、Form、Wizard、試算與正式送件 orchestration。
- `src/test/fixtures/project-participation-application.ts`：匿名老師、試算、成功與錯誤 fixtures。
- `src/test/handlers/public-project-participation-application.ts`：試算與正式送件 MSW handlers。
- `e2e/project-participation-application.spec.ts`：完整瀏覽器流程、失效、錯誤、重試與 360px 驗證。

### Modify

- `src/features/applications/common/components/participants-editor.tsx`：改用共用學籍選項，保留 FS-004 可見行為與數字表單值。
- `src/features/applications/project-participation/components/project-details-step.tsx`：移除薪資限制提示文字。
- `src/features/applications/project-participation/components/project-applicant-step.tsx`：使用共用年級／班級選項顯示正式名稱。
- `src/features/applications/project-participation/components/project-confirmation-step.tsx`：使用共用格式化函式顯示申請人年級／班級。
- `src/features/applications/project-participation/project-participation-application-page.tsx`：第一步標籤與錯誤返回名稱改為「計畫與薪資試算」。
- `src/features/applications/common/components/application-controls.test.tsx`、`src/features/applications/project-participation/**/*.test.ts*`、`e2e/project-participation-application.spec.ts`：更新文案斷言並驗證正式名稱與數字 payload。

- `src/shared/api/api-client.ts`：加入公開 JSON POST，沿用結構化錯誤、AbortSignal 與 expected status 驗證。
- `src/features/applications/common/components/advisor-selector.tsx`：改用 common 的 `PublicAdvisor`，移除 competition 依賴。
- `src/features/applications/common/components/attachment-editor.tsx`：以 props 接收合法分類、標籤、預設分類與 input id，保留既有檔案行為。
- `src/features/applications/competition/api/competition-application.schema.ts`、`competition-application.query.ts`、`competition-application.submit.ts`：改用 common 公開契約／Query／multipart primitives，維持競賽 payload 與行為。
- `src/features/applications/competition/model/submission-state.ts`、`src/features/applications/competition/components/competition-submission-state.tsx`、`src/features/applications/competition/competition-application-page.tsx`：改用共用 snapshot／送件狀態與可設定附件編輯器，維持 FS-004 UI。
- `src/app/router/router.tsx`：以正式 FS-005 Page 取代參與計畫 placeholder。
- `src/app/router/router.test.tsx`：加入參與計畫 route smoke test。
- `src/test/server.ts`：註冊參與計畫預設 MSW handlers。

### Tests

- `src/shared/api/api-client.test.ts`：公開 JSON credentials、Content-Type、request body、expected status、422／5xx 與 schema failure。
- `src/features/applications/common/components/application-controls.test.tsx`：泛化附件分類、預設分類、老師型別與既有競賽回歸。
- `src/features/applications/common/api/*.test.ts`：共用老師查詢、FormData、快照與 Idempotency 行為。
- `src/features/applications/competition/**/*.test.ts`、`e2e/competition-application.spec.ts`：共用抽取後的 FS-004 回歸。
- `src/features/applications/project-participation/api/*.test.ts`：試算／payload Wire schema、JSON transport、multipart 與 snapshot。
- `src/features/applications/project-participation/model/*.test.ts`：表單邊界、薪資月份、動態學年度、Mapper、試算失效與競速。
- `src/features/applications/project-participation/project-participation-application-page.test.tsx`：五步流程、試算狀態、老師／附件、欄位錯誤、送件與恢復狀態。
- `e2e/project-participation-application.spec.ts`：合格正常流程、不合格阻擋、薪資異動重試、Idempotency 與行動版流程。

## Implementation Steps

1. 抽出 common 公開老師、成功 Response、附件 metadata、泛型不可變送件快照與成功／不確定 UI；將 `AttachmentEditor` 改為由呼叫端設定分類，更新競賽 imports 並先完成 FS-004 回歸。
2. 在 shared API client 新增公開 JSON POST，驗證 `credentials: omit`、JSON headers、expected status、AbortSignal、結構化 422／5xx 與 Zod Response boundary。
3. 建立 FS-005 Wire schemas、試算 function、Form schema、預設值、薪資快照有效性及 Mapper；以獨立單元測試確認 1～12 筆、月份、整數金額、工作內容 1,000 字、單一申請人、學號大寫、動態學年度與 payload。
4. 建立五步 Page 與專屬步驟元件；使用 `useFieldArray` 維護穩定薪資列，明確按鈕觸發試算，將 Response 綁定送出時快照，任何薪資異動即失效且禁止繼續。
5. 接入共用老師、可設定附件、確認摘要、離開警告及正式 multipart；將試算與正式 422 路徑映射到正確步驟／欄位，處理附件 400、409、429、未知 4xx、5xx／Network 不確定結果及 201 成功。
6. 新增 MSW fixtures／handlers、元件整合與 Playwright；驗證鍵盤、焦點、ARIA、360px、無自動 retry／重複 request、不可變 Idempotency 快照及 `/apply`、`/rules`、競賽流程回歸。
7. R1 將年級／班級對照抽至 common，讓 FS-004 與 FS-005 共用；精簡第一步名稱、移除薪資限制提示，並更新 FS-005 選單、確認摘要及相關測試，確認 Wire Payload 仍使用數字代碼。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| 共用抽取改動已驗收的 FS-004 | 競賽附件、老師或送件可能回歸 | I1 只搬移契約與設定點，不改可見行為；先跑 common、competition、router tests，再進 FS-005。 |
| 試算 request 與 Response 發生競速 | 已修改薪資可能被舊 Response 誤判合格 | 對每次試算保存 canonical salary snapshot；只接受仍等於目前表單的 Response，異動立即清除資格。 |
| 試算與正式送件錯誤 path 前綴不同 | 訊息可能落在錯誤欄位或步驟 | 建立集中 path mapper，分別測試 `salaryItems.*` 與 `typeDetails.salaryItems.*`。 |
| 瀏覽器原生月份輸入呈現依平台不同 | 使用者看到的格式可能不同 | Wire boundary 固定轉成 `YYYY-MM-01`，自動測試值與 payload；Human Acceptance 驗證實際瀏覽器操作。 |
| 真實後端合格／不合格資料可能不足 | 部分 Human Integration 無法安全執行 | Verification 明確標記 `passed`、`failed` 或 `not-run`，不以 MSW 取代真實整合證據。 |
| 共用學籍標籤時誤改 FS-004 數字值或文案 | 已驗收競賽申請可能回歸，或後端收到字串標籤 | 共用層只提供數字 value、顯示 label 與 formatter；執行 FS-004 元件測試及 competition E2E 回歸。 |

## AI Verification

- [x] 執行 `npm run typecheck`
- [x] 執行 `npm run lint`
- [x] 執行 `npm run test`
- [x] 執行 `npm run build`
- [x] 執行 `npm run test:e2e -- --project=chromium e2e/project-participation-application.spec.ts e2e/competition-application.spec.ts`
- [x] 驗證 Spec Target Behavior：精簡文案、移除提示、FS-005 正式年級／班級名稱、數字 payload 與既有完整申請流程。
- [x] 回歸驗證 Preserved Behavior：`/apply`、`/rules`、FS-004 competition route、既有學籍顯示與共用公開申請元件。

## Human Integration

- [x] 以真實後端完成合格薪資試算，確認前端顯示後端點數並可繼續送件。
- [ ] `not-run`：未以真實後端重做不合格、重複月份、未來月份與特殊欄位錯誤；相關自動化測試已通過。
- [x] 以真實老師清單及 `salary_proof` 檔案完成 multipart 送件，確認 201、後端只建立一筆且 payload、附件與動態學年度正確。
- [ ] `not-run`：未以真實後端重做相同 Idempotency Key 重放 201 與不同內容 409；共用送件基礎已由 FS-004 人工驗證，FS-005 自動化測試已通過。

## Human Acceptance

- [x] 使用者確認「計畫與薪資試算」優先的五步流程、薪資限制提示已移除、正式年級／班級名稱、手動試算與異動後重新試算符合直覺。
- [x] 使用者確認單一申請人、老師、薪資證明附件、確認摘要、就地錯誤與 360px 版面可理解且可操作。
- [x] 使用者確認成功頁申請編號、等待指導老師簽核、Asia/Taipei 送件時間與 Email 提醒正確。

## Commit Plan

Draft Documentation Batch 由建立 Spec／Plan 的要求授權，不受下列 pending 狀態限制。

- Commit Plan Approval: `approved`
- Approved By: `user`
- Approved At: `2026-08-17`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存核准文件與狀態 | FS-005 Slice Brief、Spec、Plan、blueprint | `git diff --check`、FS-005 文件狀態／連結一致性 | `docs(FS-005): approve project participation specification` |
| I1 | 抽出跨申請類型共用契約、老師、附件、送件與公開 JSON transport | `src/shared/api/api-client*`、`src/features/applications/common/**`、受影響的 `src/features/applications/competition/**` | `npm run typecheck`、`npm run lint`、common／API client／competition tests | `refactor(applications): share public application infrastructure` |
| I2 | 建立參與計畫 Wire、Form、試算狀態、Mapper 與 multipart domain | `src/features/applications/project-participation/api/**`、`model/**` | `npm run typecheck`、project API／model tests | `feat(project-participation): add application domain contracts` |
| I3 | 完成五步頁面、route、MSW 與 UI 整合流程 | `src/features/applications/project-participation/components/**`、page、page tests、`src/app/router/**`、`src/test/**` | `npm run typecheck`、`npm run lint`、project page／router／competition regression tests | `feat(project-participation): implement application workflow` |
| I4 | 補齊瀏覽器旅程與跨 Slice 回歸 | `e2e/project-participation-application.spec.ts`、必要測試 fixture 調整 | project participation 與 competition Chromium E2E、360px、`git diff --check` | `test(project-participation): cover application journeys` |
| Verification | 保存完整 AI Verification 與狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據 | `docs(FS-005): record project participation verification` |
| Revision Approval | 保存 2026-08-17 修訂核准文件與狀態 | FS-005 Slice Brief、Spec、Plan、Verification、blueprint | `git diff --check`、FS-005 文件狀態／連結一致性 | `docs(FS-005): approve project participation specification` |
| R1 | 精簡第一步文案與提示，並讓 FS-004／FS-005 共用學籍顯示對照 | `src/features/applications/common/lib/student-profile-options.ts`、`common/components/participants-editor.tsx`、`project-participation/components/**`、page 與相關 tests／E2E | `npm run typecheck`、`npm run lint`、common／project page tests、competition regression tests、相關 Chromium E2E | `fix(project-participation): align academic labels and guidance` |
| Reverification | 保存 R1 後完整 AI Verification 與狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據 | `docs(FS-005): record revised project participation verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage | 文件一致性 | `docs(FS-005): record project participation acceptance` |

## Approval

- Approved By: `user`
- Approved At: `2026-08-17`
- Approval Note: `使用者已核准 2026-08-17 修訂後的 Spec、Plan 與 R1 Commit Plan；R1、重新驗證與最終人工驗收均已完成。`
