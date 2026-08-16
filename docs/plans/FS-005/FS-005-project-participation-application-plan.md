# FS-005 — Project Participation Application Plan

## Document Information

- Feature Slice: `FS-005`
- Change Type: `feature`
- Document Status: `approved`
- Based On Spec: `docs/specs/FS-005/FS-005-project-participation-application-spec.md`
- Spec Last Updated: `2026-08-16`
- Created: `2026-08-16`
- Last Updated: `2026-08-16`

## Implementation Goal

在 FS-003 的公開入口與 FS-004 已驗證的申請基礎上，先將老師、附件、公開 multipart、Idempotency 與送件狀態整理為不依賴競賽領域的共用邊界，再建立參與計畫專屬的 Zod Wire／Form schemas、薪資試算、單人五步表單、錯誤定位、不可變送件快照及完整自動化驗證；不得在前端重作點數公式。

## Current Implementation Assessment

### Existing Behavior and Gaps

- `src/app/router/router.tsx` 已註冊 `/apply/project-participation`，目前仍顯示「參與計畫申請表單準備中」placeholder。
- FS-004 已完成 React Hook Form＋Zod Resolver、TanStack Query、五步 Wizard、公開老師、附件、multipart、Idempotency、欄位錯誤、離開警告、不確定結果重試與成功頁，可作為已驗證的互動基礎。
- 現有 `AdvisorSelector`、`AttachmentEditor`、公開老師 Wire schema／Query、成功 Response、multipart snapshot 與送件狀態仍直接引用 `competition` 型別或固定競賽附件分類；FS-005 若直接引用會造成 Feature 間反向耦合。
- `src/shared/api/api-client.ts` 已支援安全 GET 與公開 multipart POST，但沒有公開 JSON POST；尚無參與計畫試算所需的 `credentials: omit`、JSON request、結構化 422 與 Response schema 驗證入口。
- 專案目前沒有 `project-participation` feature、薪資明細 Form Model、試算有效性狀態、單一申請人元件、參與計畫 Mapper、MSW handler 或 E2E。

### Reusable Components and Integration Points

- `src/features/applications/common/components/application-wizard.tsx`：直接沿用五步進度、只能返回前面已完成步驟及下一步控制。
- `src/features/applications/common/components/advisor-selector.tsx`：保留搜尋、職稱 fallback、單選與欄位錯誤 UI；型別來源移至 common 公開申請契約。
- `src/features/applications/common/components/attachment-editor.tsx`：保留檔案格式／大小／數量、UUID、重複提示、預覽與 metadata 編輯；改由呼叫端傳入分類選項與預設分類。
- `src/features/applications/common/components/leave-confirmation-dialog.tsx`、`error-summary.tsx`：沿用離開警告與欄位就地錯誤樣式。
- `src/features/applications/common/lib/points.ts`：沿用兩位小數字串的解析／顯示；不加入薪資換算公式。
- `src/shared/lib/academic-year.ts`：沿用 Asia/Taipei 8 月 1 日分界，Mapper 動態帶入但畫面不顯示。
- `src/shared/api/api-client.ts`：新增公開 JSON POST，並保留 GET、multipart、AbortSignal、結構化錯誤與安全 Response 驗證行為。
- `GET /public/advisors`：FS-004 與 FS-005 共用同一 Query key、cache 與 response schema，不重複建立 feature 專屬查詢。
- `POST /public/point-estimates/project-participation`：以 TanStack Query Mutation 只在使用者明確按下試算時呼叫；Mutation 保持無自動 retry。
- `POST /public/applications`：共用 multipart transport、成功 schema 與不可變 snapshot 規則，payload／附件 metadata 由 FS-005 專屬 Mapper 建立。

### Preserved Behavior and Regression Risks

- `/`、`/apply`、`/rules`、`/apply/competition`、證照與展覽 placeholder 行為不得改變；尤其 FS-004 的附件分類、預設值、multipart、Idempotency 與成功／錯誤流程必須完整回歸。
- 共用公開老師與送件契約時，Query key 或 import 變更不可造成競賽頁重複查詢、cache 行為改變或 runtime cycle。
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

`None`

## Files

### Create

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

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| 共用抽取改動已驗收的 FS-004 | 競賽附件、老師或送件可能回歸 | I1 只搬移契約與設定點，不改可見行為；先跑 common、competition、router tests，再進 FS-005。 |
| 試算 request 與 Response 發生競速 | 已修改薪資可能被舊 Response 誤判合格 | 對每次試算保存 canonical salary snapshot；只接受仍等於目前表單的 Response，異動立即清除資格。 |
| 試算與正式送件錯誤 path 前綴不同 | 訊息可能落在錯誤欄位或步驟 | 建立集中 path mapper，分別測試 `salaryItems.*` 與 `typeDetails.salaryItems.*`。 |
| 瀏覽器原生月份輸入呈現依平台不同 | 使用者看到的格式可能不同 | Wire boundary 固定轉成 `YYYY-MM-01`，自動測試值與 payload；Human Acceptance 驗證實際瀏覽器操作。 |
| 真實後端合格／不合格資料可能不足 | 部分 Human Integration 無法安全執行 | Verification 明確標記 `passed`、`failed` 或 `not-run`，不以 MSW 取代真實整合證據。 |

## AI Verification

- [x] 執行 `npm run typecheck`
- [x] 執行 `npm run lint`
- [x] 執行 `npm run test`
- [x] 執行 `npm run build`
- [x] 執行 `npm run test:e2e -- --project=chromium e2e/project-participation-application.spec.ts e2e/competition-application.spec.ts`
- [x] 驗證 Spec Target Behavior：五步、試算資格與失效、單一申請人、老師、附件、確認、multipart、錯誤與成功狀態。
- [x] 回歸驗證 Preserved Behavior：`/apply`、`/rules`、FS-004 competition route 與共用公開申請元件。

## Human Integration

- [ ] 以真實後端驗證合格薪資試算、異動失效及重新試算，確認前端沒有自行換算點數。
- [ ] 以真實後端驗證不合格、重複月份、未來月份與欄位路徑顯示。
- [ ] 以真實老師清單及 `salary_proof` 檔案完成 multipart 送件，確認後端只建立一筆且 payload、附件與動態學年度正確。
- [ ] 以相同 Idempotency Key／相同快照驗證重放 201，以相同 Key／不同內容驗證 409；可安全建立條件不足時標記 `not-run`。

## Human Acceptance

- [ ] 使用者確認「計畫內容與薪資試算」優先的五步流程、手動試算與異動後重新試算符合直覺。
- [ ] 使用者確認單一申請人、老師、薪資證明附件、確認摘要、就地錯誤與 360px 版面可理解且可操作。
- [ ] 使用者確認成功頁申請編號、等待指導老師簽核、Asia/Taipei 送件時間與 Email 提醒正確。

## Commit Plan

Draft Documentation Batch 由建立 Spec／Plan 的要求授權，不受下列 pending 狀態限制。

- Commit Plan Approval: `approved`
- Approved By: `user`
- Approved At: `2026-08-16`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存核准文件與狀態 | FS-005 Slice Brief、Spec、Plan、blueprint | `git diff --check`、FS-005 文件狀態／連結一致性 | `docs(FS-005): approve project participation specification` |
| I1 | 抽出跨申請類型共用契約、老師、附件、送件與公開 JSON transport | `src/shared/api/api-client*`、`src/features/applications/common/**`、受影響的 `src/features/applications/competition/**` | `npm run typecheck`、`npm run lint`、common／API client／competition tests | `refactor(applications): share public application infrastructure` |
| I2 | 建立參與計畫 Wire、Form、試算狀態、Mapper 與 multipart domain | `src/features/applications/project-participation/api/**`、`model/**` | `npm run typecheck`、project API／model tests | `feat(project-participation): add application domain contracts` |
| I3 | 完成五步頁面、route、MSW 與 UI 整合流程 | `src/features/applications/project-participation/components/**`、page、page tests、`src/app/router/**`、`src/test/**` | `npm run typecheck`、`npm run lint`、project page／router／competition regression tests | `feat(project-participation): implement application workflow` |
| I4 | 補齊瀏覽器旅程與跨 Slice 回歸 | `e2e/project-participation-application.spec.ts`、必要測試 fixture 調整 | project participation 與 competition Chromium E2E、360px、`git diff --check` | `test(project-participation): cover application journeys` |
| Verification | 保存完整 AI Verification 與狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據 | `docs(FS-005): record project participation verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage | 文件一致性 | `docs(FS-005): record project participation acceptance` |

## Approval

- Approved By: `user`
- Approved At: `2026-08-16`
- Approval Note: `核准 FS-005 的 Spec、Plan 與 Commit Plan，並開始實作。`
