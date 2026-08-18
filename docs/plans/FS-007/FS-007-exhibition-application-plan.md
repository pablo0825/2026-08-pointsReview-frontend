# FS-007 — Exhibition Application Plan

## Document Information

- Feature Slice: `FS-007`
- Change Type: `feature`
- Document Status: `approved`
- Based On Spec: `docs/specs/FS-007/FS-007-exhibition-application-spec.md`
- Spec Last Updated: `2026-08-18`
- Created: `2026-08-18`
- Last Updated: `2026-08-18`

## Implementation Goal

以既有公開申請 Wizard、參與者、老師、附件與 Idempotent multipart 基礎，新增獨立的 exhibition Wire、Form、Mapper、規則與五步頁面，在不改變 FS-004／FS-005 行為的前提下完成 FS-007 Spec。

## Current Implementation Assessment

### Existing Behavior and Gaps

- `src/app/router/router.tsx` 將 `/apply/exhibition` 指向「展覽申請表單準備中」placeholder，尚無 exhibition feature 目錄、Wire Schema、Form Model、Mapper、規則 Query、頁面或測試。
- `ParticipantsEditor` 已統一處理動態參與者、申請人與聯絡資料，但一律顯示點數控制項且新參與者固定以 `0.00` 初始化，無法直接符合 FS-007 第一步隱藏點數、第二步再選擇點數的 contract。
- 共用送件基礎已支援 `credentials: omit`、UUID v4 `Idempotency-Key`、不可變 payload／附件快照與 Zod 成功 Response，FS-007 不需要新的 transport。
- 現有頁面 orchestration 已包含進度、離開警告、422 定位、附件 400、409、429、不確定結果與成功狀態；FS-007 需以專屬頁面組合相同原語，不將四類申請合併為單一巨型頁面。

### Reusable Components and Integration Points

- `src/features/applications/common/components/application-wizard.tsx`：沿用五步進度、返回與鍵盤行為。
- `src/features/applications/common/components/participants-editor.tsx`：新增「隱藏點數」與「新參與者初始點數」設定，預設值保留競賽行為；FS-007 第一步只使用身分與聯絡編輯。
- `src/features/applications/common/components/advisor-selector.tsx`、`attachment-editor.tsx`、`application-submission-state.tsx`、`leave-confirmation-dialog.tsx`：直接沿用老師、附件、成功／不確定與離開狀態。
- `src/features/applications/common/api/public-application.schema.ts`、`public-application.submit.ts`：重用申請人、參與者、成功 Response、FormData 與快照型別。
- `src/features/applications/common/lib/student-profile-options.ts`、`src/shared/lib/academic-year.ts`：重用正式學籍名稱與 Asia/Taipei 學年度／日期工具。
- `src/features/applications/competition/**` 與 `project-participation/**`：只作為實作限制與回歸對象，不作為新產品需求來源。
- `src/test/server.ts`、`src/app/router/router.tsx`：註冊 FS-007 MSW handlers 與正式頁面。

### Preserved Behavior and Regression Risks

- `ParticipantsEditor` 的新 props 必須採用保留現狀的預設值，避免 FS-004 的 `per_person`／`shared_total`、加減按鈕、`0.00` 初始值與申請人位置回歸。
- 共用學籍、老師、附件、送件與成功狀態的改動會同時影響 FS-004／FS-005，每個相關 batch 須先執行定向回歸。
- Router 取代 placeholder 後必須保留 `/apply`、`/rules`、`/apply/competition`、`/apply/project-participation` 與 `/apply/certificate` 的現有行為。
- 第二步對 `participants[].requestedPoints` 的錯誤需與第一步的參與者身分錯誤分流，不可只依 `participants` 前綴導向同一步。

### Constraints and Unknowns

- 後端 B01、B02、B10、B13 的真實部署與安全測試資料尚無本 repository 內證據；前端可以最終契約建立 MSW，Human Integration 仍需真實後端。
- 公開規則可能只回傳一種展覽類型；畫面必須依 Response 動態呈現，不可以固定兩類 fixture 代替邊界測試。
- 實際視覺密度、15 張參與者點數卡片與 360px 操作感受需 Human Acceptance；自動測試只驗證可見行為、無水平溢出與鍵盤操作。

## Scope Delta

`None`

## Files

### Create

- `src/features/applications/exhibition/api/exhibition-application.schema.ts`：展覽規則、Payload、附件與成功 Response Zod Wire Schema 及型別。
- `src/features/applications/exhibition/api/exhibition-application.query.ts`：無 Query Parameter 的公開展覽規則 Query。
- `src/features/applications/exhibition/api/exhibition-application.submit.ts`：展覽送件快照與共用 multipart transport wrapper。
- `src/features/applications/exhibition/model/exhibition-application.schema.ts`：表單 schema、交叉驗證與預設值。
- `src/features/applications/exhibition/model/exhibition-application.mapper.ts`：學號、字串、其他名稱、學年度與附件 metadata 的 Form-to-Wire mapper，以及 API field error 正規化。
- `src/features/applications/exhibition/model/exhibition-points.ts`：類型 Lookup、允許點數判定與類型變更後清除點數的純函式。
- `src/features/applications/exhibition/components/exhibition-options.ts`：展覽類型、固定展覽名稱與附件中文對照。
- `src/features/applications/exhibition/components/exhibition-details-step.tsx`：展覽類型、作品／展覽欄位與日期控制項。
- `src/features/applications/exhibition/components/exhibition-participant-points.tsx`：唯讀參與者摘要與 API 離散點數下拉選單。
- `src/features/applications/exhibition/components/exhibition-confirmation-step.tsx`：四區唯讀摘要、申請人置頂與正式學籍名稱。
- `src/features/applications/exhibition/exhibition-application-page.tsx`：五步 orchestration、Query／Mutation、錯誤定位、類型變更、離開警告與送件狀態。
- `src/test/fixtures/exhibition-application.ts`：無個資的規則、老師、Payload 與成功 fixtures。
- `src/test/handlers/public-exhibition-application.ts`：FS-007 預設成功 handlers。
- `e2e/exhibition-application.spec.ts`：兩類型、多人、類型切換、multipart、Idempotent retry 與 360px 瀏覽器旅程。

### Modify

- `src/features/applications/common/components/participants-editor.tsx`：新增預設不改行為的 `showPoints` 與 `initialRequestedPoints` 能力，讓 FS-007 第一步只編輯參與者資料。
- `src/app/router/router.tsx`：以 `ExhibitionApplicationPage` 取代 FS-007 placeholder。
- `src/test/server.ts`：註冊展覽預設 handlers。

### Tests

- `src/features/applications/common/components/application-controls.test.tsx`：驗證參與者無點數模式與新增者空點數，並保留競賽預設行為。
- `src/features/applications/exhibition/api/exhibition-application.test.ts`：Wire Schema、Query transport、Payload／FormData、快照與成功 Response contract。
- `src/features/applications/exhibition/model/exhibition-application.test.ts`：Form schema、預設申請人、1～15 人、重複學號、名稱／日期、點數 Lookup／清除與 Mapper。
- `src/features/applications/exhibition/exhibition-application-page.test.tsx`：五步、API 狀態、類型切換、老師、附件、確認、錯誤、送件、離開與成功整合。
- `src/app/router/router.test.tsx`：FS-007 正式路由 smoke test 與現有路由回歸。

## Implementation Steps

1. 先在 `application-controls.test.tsx` 新增失敗測試：`showPoints={false}` 不呈現點數欄位，`initialRequestedPoints=""` 使新參與者帶空點數；執行定向 Vitest 確認現狀失敗。
2. 在 `ParticipantsEditor` 加入兩個具預設值的 props，只條件呈現點數控制項並以呼叫端提供的初始點數建立新參與者；重跑 common 與 competition 測試，確認未傳 props 時完全保留現狀。
3. 在 exhibition API 測試先定義失敗案例：非法類型、端點非兩位小數，未去重／非升冪 Response，非 canonical 展覽名稱，非 `null` 的非 other 名稱，附件類型與成功 Response 形狀。
4. 建立 exhibition Wire Schema、Query 與 submit wrapper；Query key 固定為 `['exhibition', 'point-options']`，Query 只呼叫 `/public/exhibition-point-options`，submit 只委派共用快照與 `POST /public/applications`。執行 API 定向測試直到通過。
5. 在 model 測試先覆蓋預設一位 applicant、最多 15 人、聯絡資料、學號大寫／重複、固定名稱與 other、255 字、日期、空點數、API 端點判定、類型變更清除及完整 Payload mapper。
6. 建立 `createExhibitionApplicationFormSchema(today)`、`createDefaultExhibitionApplicationForm(today)`、`buildExhibitionPointOptionLookup(options)`、`clearExhibitionParticipantPoints(participants)` 與 `mapExhibitionApplicationPayload(form)`；Form 允許第一步的空 `requestedPoints`，第二步 domain validation 再對所選規則驗證每人點數。
7. 先在 page test 以 MSW 寫出規則載入／空白／失敗、五步、第一步不顯示點數、第二步離散下拉、類型切換確認、日期／other、老師、附件與摘要的失敗測試。
8. 建立 exhibition options 與三個專屬步驟元件；點數元件只接收唯讀參與者、當前允許點數、errors 與 `onChange(index, points)`，不知道 API transport 或 React Hook Form 內部。
9. 建立 `ExhibitionApplicationPage`，使用 TanStack Query／Mutation、React Hook Form 與 Zod resolver；將 participant profile path 導向第一步、`requestedPoints` 與 `typeDetails` 導向第二步，對規則失效提供重新載入及全點數清除，其餘正式送件錯誤沿用 Spec contract。
10. 建立展覽 fixtures／handlers、註冊 `src/test/server.ts`，在 Router 引入正式頁面，完成 page 與 router tests；執行 exhibition page、router、common、competition 與 project-participation 定向 Vitest。
11. 在 page test 補齊 422 精確步驟／焦點、附件 400、409、429、未知 4xx、Network／5xx 不確定快照重試、201 成功、重複點擊、離開警告與修改後廢棄舊 Key，並驗證 request 不帶 Session／CSRF。
12. 建立 Chromium Playwright 旅程：`fan_work` 單人、`project_work` 多人、類型切換清除點數、固定名稱／other、multipart payload、不確定相同 Key 重試與 360px 無水平溢出；同時執行 FS-004／FS-005 瀏覽器回歸。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| `ParticipantsEditor` 是已驗收的競賽共用元件 | 隱藏點數模式可能改變 FS-004 點數初始值或控制項 | 新 props 使用保留現狀的預設值，I1 在接入 FS-007 前先執行 common 與 competition 回歸。 |
| 參與者欄位跨第一與第二步 | 一般 `participants.*` 422 可能導向錯誤步驟 | 以 `participants.{index}.requestedPoints` 明確導向第二步，其他 participant／applicant path 導向第一步，建立定向元件測試。 |
| 類型變更同時影響規則與 15 筆點數 | 取消確認或轉換中斷可能造成類型與點數不一致 | 先計算候選類型，只在確認後原子寫入類型與全部空點數；取消不觸發 form mutation。 |
| 真實後端可能尚未完整部署 B01／B02／B10／B13 | AI Verification 可通過，但真實送件可能無法完成 | 以最終 Wire Contract 建立 Zod 與 MSW；Verification 依實際證據記錄 Human Integration，不用 mock 取代真實整合。 |
| 15 人頁面高度與行動版密度 | 點數重選或錯誤定位可能難以操作 | 每人使用單欄語意卡片、可見 label 與焦點定位；Vitest／Playwright 驗證 360px，Human Acceptance 確認整體感受。 |

## Verification Gates

| Check ID | Acceptance IDs | Check | Gate | Applicability | Command / Method |
|---|---|---|---|---|---|
| V-001 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | TypeScript strict typecheck | `required` | `always` | `npm run typecheck` |
| V-002 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | ESLint | `required` | `always` | `npm run lint` |
| V-003 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | 完整 Vitest／Testing Library／MSW | `required` | `always` | `npm run test` |
| V-004 | AI-006, AI-007 | Production build | `required` | `always` | `npm run build` |
| V-005 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | FS-007 Chromium 關鍵旅程與 FS-004／FS-005 回歸 | `required` | `always` | `npm run test:e2e -- --project=chromium e2e/exhibition-application.spec.ts e2e/competition-application.spec.ts e2e/project-participation-application.spec.ts` |
| V-006 | AI-001, AI-005 | Firefox／WebKit 展覽補充流程 | `advisory` | `always` | `npm run test:e2e -- --project=firefox --project=webkit e2e/exhibition-application.spec.ts` |
| V-007 | HA-001 | 五步語意、多人點數、類型變更提示與桌面／360px 可用性 | `human` | `always` | `Human Acceptance` |
| V-008 | HA-002 | 真實後端兩類展覽、多人 multipart 與成功資料 | `human` | `always` | `Human Integration and Human Acceptance` |

## Human Integration

| ID | Requirement | Applicability |
|---|---|---|
| HI-001 | 提供已部署 B01、B02、B10、B13 與 canonical Exhibition Payload 的真實後端，包含 `fan_work`、`project_work`、可選老師、可用展覽照片、單人／多人安全測試資料，以及可確認實際建案結果的測試環境。 | `always` |

## Commit Plan

Draft Documentation Batch 由建立 Spec／Plan 的要求授權，不受下列 pending 狀態限制。

- Commit Plan Approval: `approved`
- Approved By: `user`
- Approved At: `2026-08-18`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| I3 | 完成五步頁面、route、MSW 與元件整合 | `src/features/applications/exhibition/components/**`、`exhibition-application-page.tsx`、`exhibition-application-page.test.tsx`、`src/app/router/**`、`src/test/fixtures/exhibition-application.ts`、`src/test/handlers/public-exhibition-application.ts`、`src/test/server.ts` | `npm run typecheck`、`npm run lint`、`npm run test -- src/features/applications/exhibition/exhibition-application-page.test.tsx src/app/router/router.test.tsx src/features/applications/common/components/application-controls.test.tsx src/features/applications/competition/competition-application-page.test.tsx src/features/applications/project-participation/project-participation-application-page.test.tsx` | `feat(exhibition): implement application workflow` |
| I4 | 補齊瀏覽器旅程與跨 Slice 回歸 | `e2e/exhibition-application.spec.ts` | `npm run test:e2e -- --project=chromium e2e/exhibition-application.spec.ts e2e/competition-application.spec.ts e2e/project-participation-application.spec.ts`、`git diff --check` | `test(exhibition): cover application journeys` |
| Verification | 保存完整 AI Verification 與狀態 | Plan、Verification、blueprint | V-001～V-006 實際證據與所有 AI Acceptance closure | `docs(FS-007): record exhibition application verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage | V-007～V-008 實際結果與文件一致性 | `docs(FS-007): record exhibition application acceptance` |

## Approval

- Approved By: `user`
- Approved At: `2026-08-18`
- Approval Note: `使用者已核准目前的 FS-007 Spec、Plan 與 Commit Plan。`
