# FS-004 — Competition Application Plan

## Document Information

- Feature Slice: `FS-004`
- Change Type: `feature`
- Document Status: `draft`
- Based On Spec: `docs/specs/FS-004/FS-004-competition-application-spec.md`
- Spec Last Updated: `2026-08-14`
- Created: `2026-08-13`
- Last Updated: `2026-08-14`

## Goal

在 FS-003 已完成的公開 Layout、Router、Provider、Tailwind CSS 與測試基礎上，加入 React Hook Form 表單能力、共用申請 Wizard 與競賽專屬垂直功能；以 Zod、整數點數、TanStack Query、MSW 與不可變 Idempotency 快照完成五步申請、附件 multipart、錯誤定位、結果不確定重試及成功頁，不擴張到其他申請類型。

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-004/FS-004-competition-application-spec.md`

## Scope

### Included

- 安裝並設定 FS-004 實際使用的 React Hook Form 與 Zod Resolver。
- 將目前學年度計算提升為可由規則頁與申請表共用的 helper，並建立百分之一點整數運算工具。
- 擴充共用 API transport，使公開 multipart Mutation 能使用 `credentials: omit`、讀取結構化錯誤與 `Retry-After`，且不破壞既有 GET 行為。
- 建立競賽規則、老師、正式送件、成功與錯誤 Response 的 Zod schema、Query、Mapper、Form Model 與 request 快照。
- 建立 FS-004 首次實際使用的共用 Application Wizard、參與者、老師、附件、錯誤摘要及離開確認元件。
- 以競賽專屬步驟完成 `/apply/competition` 的資料輸入、點數分配、確認、Idempotent retry 與成功頁。
- 將競賽申請前兩步修訂為「競賽內容」後接「參與者資料」；第一步只確立規則與競賽資料，第二步才顯示參與者及可用的點數控制項。
- 修訂競賽申請的申請人互動：初始不預選、選定前隱藏聯絡資料、選定後將聯絡資料置於該參與者卡片，並補齊未選與改選行為。
- 將前端與後端欄位錯誤整合至 React Hook Form，在控制項下方顯示訊息及紅色錯誤框；跨欄位／集合錯誤留在相關區塊，只有無法定位與系統錯誤使用頁面內提示。
- 修訂 `shared_total` 互動：所有參與者從 0.00 開始，摘要移至清單上方，提供每次 0.50 的自訂加減按鈕及手動輸入；競賽表單與確認頁隱藏學年度但 payload 保留系統值。
- 建立單元、契約、元件／整合、MSW 與 Playwright 測試，覆蓋 Spec 的 AI Acceptance。

### Excluded

- 其他三類申請、補件、學生進度查詢、草稿持久化、登入與後台流程。
- 動態參與人數規則 API、老師後端搜尋、附件預先上傳及學生 Email 驗證。
- 完整 Design System 或未被 FS-004 實際使用的通用申請抽象。
- 後端 B03、B10、B13、Idempotency、公開老師／規則／送件及 CORS 設定本身的實作。

## Current Implementation Assessment

### Existing Behavior

- `src/app/router/router.tsx` 已提供 `/apply/competition`，但目前只顯示「競賽申請表單準備中」placeholder。
- FS-003 已提供 `PublicLayout`、`AppProviders`、Router、Tailwind CSS、Route Error Boundary、Vitest、Testing Library、MSW 與 Playwright 基礎。
- TanStack Query 已全域關閉 Query／Mutation 自動 retry，符合正式送件不得自動重試的要求。
- FS-002 已建立可重試的公開 GET Query、Zod Response 驗證與 loading／empty／error 顯示模式。
- 專案尚未安裝 React Hook Form 或 Zod Resolver，也沒有 application form、附件、multipart Mutation 或離開警告實作。

### Approved Revision Assessment

- FS-004 初版實作與完整 AI Verification 已完成，且真實後端 `pointIncrement` 契約已對齊；本次修訂前 blueprint 為 `awaiting-human`。
- 現行第一步為「學生與參與者資料」，點數欄位因競賽規則尚未選定而 disabled；第二步「申請內容與點數」選定規則後又重複顯示參與者編輯器。
- 修訂後第一步改為「競賽內容」且不顯示參與者；第二步改為「參與者資料」，此時規則已確立，可直接顯示 `per_person` 固定點數或編輯 `shared_total` 分配。
- 需同步交換步驟驗證、確認摘要修改索引、422 錯誤落點、規則失效落點及所有 component／browser tests；API、Form Model、payload、五步總數與其他申請類型不變。

### Applicant Selection Revision Assessment

- R1 與 Reverification 已完成；現行實作仍將第一位參與者預設為申請人，Email 與電話固定顯示於整個參與者編輯器底部。
- 修訂後所有參與者初始皆為 `isApplicant = false`，必須明確選擇；選定前隱藏聯絡資料，選定後在該參與者卡片內展開。
- 未選申請人時需建立可存取的錯誤摘要與區域錯誤，捲動並聚焦第一個「設為申請人」按鈕；選定後立即清除錯誤。
- 改選申請人沿用確認機制，但確認後須清除 Email、電話並移動聯絡資料區塊；目前申請人不可直接取消或刪除。
- API、payload 與後端驗證契約不變，正式送件仍保證恰好一位 `isApplicant = true`；FS-005～FS-007 的預設行為不在本修訂範圍。

### Field Error Presentation Revision Assessment

- 現行頁面雖以 React Hook Form 保存表單值，驗證錯誤另由 `errors` React state 與手動 `validateStep()` 管理；一般欄位錯誤集中顯示於頁面上方，輸入控制項本身沒有一致的錯誤訊息、紅框或 ARIA 關聯。
- 修訂後以 React Hook Form 統一保存前端驗證與後端 `422 fields[].path` 錯誤；各步驟元件接收對應 field error，在控制項下方呈現並於修正後清除。
- `participants` 點數總和、`participants.applicant` 與 `attachments` 必要附件等無法歸屬單一控制項的規則，顯示於相關區塊；Network、5xx、429、結果不確定及無法定位的錯誤維持頁面內提示。
- 既有 API contract、Zod schema、payload、Idempotency、步驟順序、資料保留與焦點移動不變；不使用瀏覽器原生 `alert()` 呈現一般錯誤。

### Shared Point Allocation Revision Assessment

- F2 與完整 AI Verification 已完成，但驗證的是修訂前行為：單人 `shared_total` 自動取得全部點數、多人與新增參與者預設 0.50，摘要位於參與者清單下方，且競賽表單與確認頁顯示學年度。
- 修訂後不論人數，每位 `shared_total` 參與者皆以 0.00 開始；新增參與者為 0.00，切換至 shared 規則時全員重設為 0.00，不預先分配。
- 參與者清單上方顯示團隊總點數、已分配與剩餘點數；個別點數使用自訂「−」／「＋」按鈕每次調整 0.50，同時保留手動輸入並隱藏原生數字箭頭。
- 競賽表單與確認頁不顯示學年度；`getCurrentAcademicYear()` 與 Mapper 保留，正式 payload 仍為每位參與者帶入系統學年度，API 契約不變。

### Reusable Components

- `src/app/layouts/public-layout.tsx`：沿用公開導覽、skip link、寬度與頁面容器。
- `src/app/providers/app-providers.tsx`：沿用 TanStack Query Client 與 mutation retry disabled 設定。
- `src/app/router/router.tsx`：以正式 `CompetitionApplicationPage` 取代競賽 placeholder，其他三類 route 保持不變。
- `src/shared/api/api-client.ts`：保留 URL 解析、AbortSignal、安全錯誤與 Zod 驗證模式，擴充公開 multipart 所需 transport。
- `src/features/rules/lib/academic-year.ts`：既有 Asia/Taipei 8 月 1 日計算可提升至 `src/shared/lib/academic-year.ts`，供規則頁與申請表共用。
- `src/features/rules/published-instructions-page.tsx`：可參考 Query loading／empty／failure／manual refetch 的可存取呈現方式，不直接共用其產品元件。

### Integration Points

- `src/app/router/router.tsx`：公開競賽 route 邊界。
- `src/app/providers/app-providers.tsx`：Query／Mutation Cache 與 retry 行為。
- `src/shared/api/api-client.ts`：公開 GET 與 multipart request、結構化錯誤、headers。
- `src/features/applications/common/**`：FS-004 建立並實際使用的 Wizard、參與者、老師、附件與離開警告基礎，後續 Slice 可在有實際需求時擴充。
- `src/features/applications/competition/**`：競賽專屬 schema、API、state、steps、Mapper、submission 與 success view。
- `src/test/server.ts`、`src/test/handlers/**`、`src/test/fixtures/**`：MSW 預設契約與邊界覆寫。

### Gaps Against Spec

- 缺少 React Hook Form、Zod Resolver 與五步表單狀態。
- 缺少共用學年度位置、整數點數解析／格式化／比較及競賽分配邏輯。
- 缺少競賽規則與老師 API schemas／queries，以及單次查詢和手動重載行為。
- 缺少參與者／申請人、競賽資料、老師、附件、確認摘要、dirty-state 與成功頁 UI。
- 既有 API client 只有帶 `credentials: include` 的 GET，錯誤不保留 API `code`、`message`、`fields` 或 headers，無法支援公開 multipart 與 Rate Limit。
- 缺少 multipart Mapper、`credentials: omit`、UUID v4 Idempotency、不可變快照與結果不確定手動重試。
- 缺少 FS-004 的 fixture、MSW handler、單元、元件／整合與 browser tests。
- 目前尚未符合修訂後的就地錯誤呈現：欄位錯誤未寫入 React Hook Form error、控制項沒有一致紅框／`aria-invalid`／描述關聯，且同一批欄位錯誤仍集中顯示於頁面上方。
- 目前尚未符合 shared point allocation 修訂：shared 初始值與新增值不是 0.00、缺少自訂加減按鈕、摘要位置在清單下方，且競賽表單與確認頁仍顯示學年度。

### Preserved Behavior

- `/` 仍導向 `/apply`，`/apply` 四個入口與 `/rules` 行為不變。
- `/apply/project-participation`、`/apply/certificate`、`/apply/exhibition` 繼續顯示既有 placeholder。
- FS-002 的公開辦法查詢、年度切換、Markdown 與錯誤狀態保持通過。
- 既有 `getJson` 呼叫維持 `credentials: include`、AbortSignal 與安全 Zod 錯誤語意。
- 錯誤仍返回正確步驟並聚焦第一個可操作欄位；無法定位、網路、5xx、429 與結果不確定狀態仍保留安全訊息及原有可操作恢復流程。

### Regression Risks

- 提升 academic-year helper 或擴充 API client 可能破壞 FS-002，必須保留並重跑其測試。
- route blocker、`beforeunload` 與成功／不確定狀態若清理不完整，可能阻止正常站內導覽或遺留事件 listener。
- 動態參與者 index 與後端 `fields[].path` 若映射錯誤，可能聚焦錯誤的人或錯誤步驟。
- Blob URL、File 與 Idempotency snapshot 若生命週期不清楚，可能造成記憶體洩漏、內容變更後錯誤重試或敏感資料被持久化。
- React StrictMode 可能使不穩定的 effect 造成重複查詢；Query key、enabled 時機與測試必須驗證正常流程只發出一次規則／老師 request。
- 申請人從預設值改為未選狀態後，Form schema、下一步驗證與確認摘要若仍假設 index 0 為申請人，可能造成無法聚焦、聯絡資料錯置或送出無申請人的 payload。
- 將錯誤來源整合至 React Hook Form 時，動態陣列 index、條件式申請人欄位與後端 path 若未同步，可能讓訊息顯示在錯誤的參與者或無法聚焦。
- 自訂加減按鈕、手動輸入與即時摘要若未共用整數點數 helper，可能產生浮點誤差、超額分配或按鈕狀態不同步。
- 隱藏學年度時若誤刪 Mapper 的系統值，後端會收到缺少 `participants[].academicYear` 的 payload。

### Compatibility / Migration

- academic-year helper 從 rules feature 移至 shared 後更新既有 import，不改變函式輸入輸出或 FS-002 行為。
- 不建立資料遷移；表單、File、Idempotency Key 與 snapshot 僅存在 React 記憶體。
- `package-lock.json` 鎖定新增表單依賴；不更新無關套件。

### Constraints

- 使用 React 19、React Router 7、TanStack Query 5、React Hook Form、Zod、Tailwind CSS、Vitest／Testing Library／MSW／Playwright。
- Wire、Form 與 View Model 分離；API Response 先經 Zod 驗證。
- 點數以百分之一點整數運算，只有畫面與 wire boundary 使用兩位小數字串。
- 動態陣列使用穩定 client key；`clientFileKey` 與 Idempotency Key 使用 `crypto.randomUUID()`。
- multipart 不手動設定 `Content-Type`；公開送件使用 `credentials: omit` 且不取得 CSRF Token。
- 不將學生資料、附件、Key 或 request snapshot 寫入 URL、Local Storage、Session Storage、IndexedDB 或 Log。
- Tailwind CSS 採 Mobile First；主要觸控目標至少 44 × 44px，最低 360px，錯誤與非同步狀態可被螢幕閱讀器感知。

### Unknowns

- None；產品行為與前端契約已確認。真實後端是否完成 B03、B10、B13、完整 Idempotency 與測試資料，留在 Human Integration 驗證，不阻擋以最終契約及 MSW 實作。

## Files

### Create

- `src/shared/lib/academic-year.ts`、`src/shared/lib/academic-year.test.ts`：共用 Asia/Taipei 學年度計算及分界測試。
- `src/features/applications/common/lib/points.ts`、`points.test.ts`：兩位小數字串與百分之一點整數轉換、格式化與倍數／總和 helper。
- `src/features/applications/common/components/application-wizard.tsx`：步驟導覽、逐步驗證、摘要返回與提交狀態骨架。
- `src/features/applications/common/components/participants-editor.tsx`：參與者動態陣列、申請人切換與學籍欄位。
- `src/features/applications/common/components/advisor-selector.tsx`：老師搜尋、選擇、empty／failure／reload。
- `src/features/applications/common/components/attachment-editor.tsx`：附件限制、metadata、重複提示、預覽與清理。
- `src/features/applications/common/components/error-summary.tsx`、`leave-confirmation-dialog.tsx`：可存取錯誤摘要及站內離開確認。
- `src/features/applications/common/**/*.test.tsx`：共用申請元件的行為、焦點與清理測試。
- `src/features/applications/competition/api/competition-application.schema.ts`：規則、老師、payload、成功與錯誤 Wire schemas。
- `src/features/applications/competition/api/competition-application.query.ts`：競賽規則與老師 Query functions／keys。
- `src/features/applications/competition/api/competition-application.submit.ts`：multipart 建立、公開送件、headers 與不可變 retry request。
- `src/features/applications/competition/model/competition-application.schema.ts`：五步 Form schema、預設值、跨欄位與步驟 paths。
- `src/features/applications/competition/model/competition-application.mapper.ts`：Form Model 至 wire payload、學號／空值正規化及欄位錯誤映射。
- `src/features/applications/competition/model/competition-points.ts`：規則 lookup、`per_person`／`shared_total` 重設、增減與驗證。
- `src/features/applications/competition/model/submission-state.ts`：Idempotency Key、不可變快照、明確結果與不確定結果狀態。
- `src/features/applications/competition/model/*.test.ts`、`src/features/applications/competition/api/*.test.ts`：schema、Mapper、點數、Query、multipart、錯誤與 Idempotency tests。
- `src/features/applications/competition/components/competition-details-step.tsx`：競賽資料與點數步驟。
- `src/features/applications/competition/components/competition-confirmation-step.tsx`：四區確認摘要及修改操作。
- `src/features/applications/competition/components/competition-submission-state.tsx`：處理中、不確定、Rate Limit、衝突與成功畫面。
- `src/features/applications/competition/competition-application-page.tsx`：FS-004 route page、Query、Form、Wizard 與 submission orchestration。
- `src/features/applications/competition/competition-application-page.test.tsx`：完整元件／整合流程與 MSW 狀態測試。
- `src/test/fixtures/competition-application.ts`：匿名競賽規則、老師、成功與錯誤 fixtures。
- `src/test/handlers/public-competition-application.ts`：規則、老師與公開送件預設 handlers。
- `e2e/competition-application.spec.ts`：`per_person`、多人 `shared_total`、Idempotent retry、錯誤、360px 與鍵盤流程。

### Modify

- `package.json`、`package-lock.json`：加入 React Hook Form 與 Zod Resolver。
- `src/shared/api/api-client.ts`：加入公開 multipart、結構化 API Error 與 Response headers 支援，保留現有 GET API。
- `src/shared/api/api-client.test.ts`：回歸 GET 並驗證公開 multipart credentials、Boundary、錯誤與 `Retry-After`。
- `src/features/rules/published-instructions-page.tsx`：改用 shared academic-year helper。
- `src/features/rules/lib/academic-year.ts`、`src/features/rules/lib/academic-year.test.ts`：由 shared helper 取代後移除。
- `src/app/router/router.tsx`：以 `CompetitionApplicationPage` 取代競賽 placeholder。
- `src/app/router/router.test.tsx`、`src/app/app.test.tsx`：回歸公開路由並調整競賽 route assertion。
- `src/test/server.ts`：加入 FS-004 預設 MSW handlers。
- `e2e/application-entry.spec.ts`：競賽入口期望改為正式表單，其他三類 placeholder 維持。
- `src/features/applications/competition/competition-application-page.tsx`：以 React Hook Form errors 取代獨立欄位錯誤 state，統一逐步驗證、422 映射、清除、步驟返回與焦點。
- `src/features/applications/competition/components/competition-details-step.tsx`：在競賽欄位下方顯示錯誤並套用錯誤控制項語意與樣式。
- `src/features/applications/common/components/participants-editor.tsx`：在動態參與者、申請人聯絡與點數欄位下方顯示錯誤，並保留參與者層級錯誤。
- `src/features/applications/common/components/advisor-selector.tsx`、`attachment-editor.tsx`：加入老師欄位、附件 metadata 欄位與附件區塊錯誤呈現。
- `src/features/applications/common/components/error-summary.tsx`：移除一般欄位錯誤摘要用途；若已無其他使用則刪除元件與對應測試，系統錯誤繼續由頁面內提示負責。
- `src/features/applications/competition/model/competition-points.ts`、`competition-application.test.ts`：shared 初始化、新增與規則切換改為 0.00，保留整數點數驗證。
- `src/features/applications/common/components/participants-editor.tsx`、`application-controls.test.tsx`：摘要移至清單上方，加入自訂 0.50 加減按鈕、手動輸入與邊界狀態，隱藏學年度及原生數字箭頭。
- `src/features/applications/competition/competition-application-page.tsx`、`competition-application-page.test.tsx`：串接新分配互動並驗證 hidden academic year 仍存在 payload。
- `src/features/applications/competition/components/competition-confirmation-step.tsx`：競賽確認摘要移除學年度顯示。
- `e2e/competition-application.spec.ts`：覆蓋 shared 0.00 初始值、摘要位置、加減／手動輸入、按鈕邊界與學年度 payload。

### Tests

- `src/shared/api/api-client.test.ts`、`src/shared/lib/academic-year.test.ts`、`src/features/applications/common/lib/points.test.ts`：transport、日期與點數基礎。
- `src/features/applications/competition/api/*.test.ts`、`model/*.test.ts`：API contract、Mapper、規則、日期、參與者、附件、錯誤與 Idempotency。
- `src/features/applications/common/**/*.test.tsx`：Wizard、動態參與者、老師、附件、離開警告與 accessibility。
- `src/features/applications/competition/competition-application-page.test.tsx`：五步、單次查詢、確認、送件、錯誤與成功頁整合。
- `src/app/router/router.test.tsx`、`src/app/app.test.tsx`：route 與既有 application shell 回歸。
- `e2e/application-entry.spec.ts`、`e2e/published-instructions.spec.ts`、`e2e/competition-application.spec.ts`：既有公開功能與 FS-004 browser regression。
- `src/features/applications/common/components/*.test.tsx`、`src/features/applications/competition/competition-application-page.test.tsx`：前端／422 欄位錯誤就地呈現、紅框、ARIA、修正清除、區塊與系統錯誤層級。
- `e2e/competition-application.spec.ts`：跨步驟驗證、第一個錯誤焦點、桌面與 360px 的欄位下方訊息及非彈窗系統提示。

## Implementation Steps

1. 安裝 React Hook Form 與 Zod Resolver，確認現有 typecheck、lint、test 與 build 不受影響。
2. 提升 academic-year helper、建立整數點數工具，擴充 API client 的公開 multipart／結構化錯誤能力並保留既有 GET 契約。
3. 建立競賽 Wire／Form schemas、Query、Mapper、點數分配、submission state、fixtures、handlers 與單元／契約 tests。
4. 建立 FS-004 實際使用的共用 Wizard、參與者、老師、附件、錯誤摘要與離開確認元件，驗證動態欄位、焦點、Blob URL 與 dirty-state。
5. 建立競賽專屬步驟及 route page，串接單次規則／老師 Query、確認摘要、multipart Mutation、Idempotent retry、Rate Limit、欄位錯誤與成功頁。
6. 更新 Router 與既有 route tests，加入完整 Testing Library／MSW 整合與 Playwright 關鍵流程；驗證 desktop、360px、鍵盤、觸控目標及無水平溢位。
7. 執行完整 typecheck、lint、Vitest、production build、targeted Chromium Playwright 與 Spec 行為核對，建立 Verification record 後交付 Human Integration／Acceptance。
8. 將逐步驗證與後端 422 path 映射改寫為 React Hook Form field／root errors；由各欄位及相關區塊負責呈現、清除與 ARIA 關聯，頁面只保留非欄位提示。
9. 補齊欄位紅框、欄位下方訊息、動態陣列、區塊錯誤、系統提示、焦點與 360px 的元件／整合／Playwright 回歸，再執行完整 AI Verification。
10. 實作 R4：調整 shared point model 與參與者控制項、上移摘要、隱藏競賽學年度顯示但保留 Mapper payload，補齊 targeted／完整測試並重新執行 AI Verification。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| `pointIncrement` 已加入規則 Response，但第一版產品規則仍固定 0.50 | 若後端未來回傳其他值，UI 可能顯示契約資料卻仍須遵守第一版固定限制 | Zod 驗證並保存欄位；FS-004 依已核准的第一版 0.50 行為實作。若要改為動態增量，先走需求文件修訂 |
| 公開送件 Response 可能在後端已 commit 後遺失或成為 5xx | 一般重送可能建立重複案件或錯誤宣告失敗 | 凍結 Key 與完整 request，所有 5xx／Network 只提供相同快照的手動重新確認 |
| 瀏覽器跨來源時可能讀不到 `Retry-After` | 無法顯示精確等待秒數 | 有 header 時顯示秒數；否則使用已核准通用訊息。真實整合確認 CORS expose header |
| File／Blob URL 與動態附件生命週期複雜 | 可能造成記憶體洩漏、預覽失效或 retry 內容不一致 | 集中 attachment model、明確 revoke 時機、不可變 snapshot 並以 unit／component tests 驗證 |
| 真實後端契約或 B03／B10／B13 尚未同步 | MSW 通過不代表真實送件可用 | AI Verification 如實記錄；Human Integration 使用真實規則、老師與兩種點數資料完成驗收 |
| 交換前兩步後仍沿用舊 index | 確認頁修改、422 或規則失效可能返回錯誤步驟 | 集中更新 step labels、render、validation 與 API error mapping，並以元件及 Playwright 流程覆蓋 |
| React Hook Form field path 與動態參與者／附件 index 不一致 | 錯誤可能出現在錯誤卡片、無法清除或聚焦失敗 | 集中 path 正規化，使用 typed field paths，並測試新增、移除與後端 indexed 422 errors |
| 只以紅框表示錯誤 | 色覺或螢幕閱讀器使用者無法理解原因 | 同時顯示文字、`aria-invalid`、`aria-describedby` 與焦點，不只依賴顏色 |

## AI Implementation Tasks

- [x] 安裝並鎖定表單依賴。
- [x] 建立共用 academic-year、整數點數與公開 multipart API transport。
- [x] 建立競賽 API schemas、queries、Form schema、Mapper、點數與 submission state。
- [x] 建立共用 Wizard、參與者、老師、附件、錯誤與離開確認元件。
- [x] 建立競賽資料／點數、確認、提交狀態與成功頁。
- [x] 串接 `/apply/competition`、規則、老師及公開 multipart 送件。
- [x] 建立 fixtures、MSW、單元、元件／整合與 Playwright tests。
- [x] 將前兩步改為「競賽內容」與「參與者資料」，移除競賽步驟中的參與者重複區塊。
- [x] 同步更新逐步驗證、確認頁返回修改、422／規則失效定位及相關 Vitest／Playwright。
- [x] 將競賽參與者預設值改為沒有申請人，並在下一步與正式送件維持恰好一位申請人的驗證。
- [x] 將申請人聯絡資料移入被選參與者卡片，補齊選定、不可取消、改選確認、清除與移動行為。
- [x] 補齊未選申請人的錯誤摘要、區域訊息、捲動／焦點與選定後立即清除錯誤。
- [x] 更新相關 Form、ParticipantsEditor、page integration 與 Playwright 測試，並回歸其他申請控制項不受影響。
- [x] 將前端逐步驗證與後端 422 欄位錯誤統一寫入 React Hook Form errors，移除獨立欄位錯誤 state。
- [x] 為競賽、參與者、申請人、點數、老師與附件欄位加入就地文字、紅框、ARIA 關聯與修正後清除；F2 已補齊 `grade`、`classNumber`、附件分類與附件說明。
- [x] 更新元件、整合與 Playwright 測試，驗證全部可定位 422 path、焦點、桌面／360px 與既有送件流程。
- [ ] 將 `shared_total` 初始、新增及規則切換值改為 0.00，摘要移至清單上方，加入自訂 0.50 加減按鈕及手動輸入邊界。
- [ ] 隱藏競賽表單與確認頁的學年度顯示，並以 Mapper／submission tests 保證 payload 仍包含系統學年度。

## AI Verification

- [x] 執行 `npm run typecheck`
- [x] 執行 `npm run lint`
- [x] 執行 `npm run test`
- [x] 執行 `npm run build`
- [x] 執行 `npm run test:e2e -- e2e/application-entry.spec.ts e2e/published-instructions.spec.ts e2e/competition-application.spec.ts --project=chromium`
- [x] 以 Playwright 驗證修訂後 desktop 與 360px、鍵盤、44 × 44px targets、Dialog 焦點及無水平溢位
- [x] 驗證初始未選申請人、聯絡資料卡片位置、未選錯誤焦點、改選清除與 payload 唯一申請人
- [x] 回歸驗證 FS-002、FS-003 的公開辦法、入口、導覽、Router、Provider 與 GET API client
- [x] 驗證前端與後端欄位錯誤都在對應控制項下方顯示，具有紅框、`aria-invalid`、描述關聯及修正後清除
- [x] 補齊 `participants.*.grade`、`participants.*.classNumber`、`attachments.*.attachmentType` 與 `attachments.*.description` 的 422 就地錯誤及回歸測試
- [x] 驗證跨欄位／集合錯誤位於相關區塊，無法定位與系統錯誤使用頁面內提示且不呼叫原生 `alert()`
- [ ] R4 後驗證 shared 0.00 初始值、摘要位置、加減／手動輸入、按鈕邊界與 360px 操作
- [ ] R4 後驗證競賽畫面不顯示學年度且 multipart payload 的每位參與者仍包含系統學年度

## Human Integration

- [ ] 確認真實後端已提供 B03、B10、B13、`GET /public/competition-point-options`、`GET /public/advisors`、未登入 `POST /public/applications`、完整 Idempotency 與測試資料。
- [ ] 確認開發／正式環境 API Base URL、CORS 與 `Retry-After` header 是否可由瀏覽器讀取；讀不到時驗證通用 Rate Limit 提示。
- [ ] 使用真實 PDF、JPEG、PNG 測試檔驗證後端副檔名、MIME、內容、5 MiB、10 檔與最低附件規則。

只有使用者明確確認後才能勾選。

## Human Acceptance

- [ ] 依 Spec Human Acceptance 完成真實 `per_person` 與多人 `shared_total` 送件。
- [ ] 確認 empty、failure、規則失效、Rate Limit、結果不確定重新確認與成功頁。
- [ ] 在桌面與 360px 手機確認五步流程、附件、錯誤、離開警告、鍵盤與觸控操作。
- [ ] 確認欄位錯誤可在輸入框下方直接找到，錯誤控制項有紅框，區塊與系統錯誤出現在正確位置。

只有使用者明確確認後才能勾選。

## Documentation Updates

- [x] 確認已核准的競賽步驟順序 `docs/project/` 變更已提交並反映於實作。
- [x] 確認需求文件、Slice Brief、Spec 與 Plan 修訂內容一致。
- [x] 更新 blueprint 的 FS-004 Status、Status Note 與 Last Updated。
- [x] 更新 Spec 狀態。
- [x] 更新 Plan 狀態與 implementation／verification tasks。
- [x] 建立並更新 verification record。
- [x] `not-applicable`：本 Slice 不是 `change`，不需 supersession lineage。
- [x] 更新 `docs/project/` 的欄位、區塊與系統錯誤呈現規則。
- [x] 重新確認需求文件、Slice Brief、Spec 與 Plan 的錯誤呈現修訂一致。
- [x] 修訂完成後更新 Verification 與 blueprint 狀態。

## Commit Plan

Draft Documentation Batch 由使用者建立 Spec / Plan 的明確要求授權，建立本文件後直接以 `docs(FS-004): draft competition application specification` 提交，不受下列尚為 `pending` 的 Commit Plan 限制。

- Commit Plan Approval: `pending`
- Approved By: `pending`
- Approved At: `pending`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Revision Draft | 保存已核准提案形成的流程需求、draft Spec／Plan 與狀態 | `docs/project/product-requirements.md`、`docs/project/routes-and-pages.md`、FS-004 Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): revise competition application flow` |
| Approval | 保存已核准的 FS-004 Spec、Plan 與狀態 | FS-004 Slice Brief、Spec、Plan、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): approve competition application specification` |
| I1 | 加入 FS-004 表單 runtime 依賴 | `package.json`、`package-lock.json` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `build(applications): add form workflow dependencies` |
| I2 | 建立共用學年度、整數點數與公開 multipart transport | `src/shared/lib/academic-year.ts`、`src/shared/lib/academic-year.test.ts`、`src/features/rules/lib/academic-year.ts`、`src/features/rules/lib/academic-year.test.ts`、`src/features/rules/published-instructions-page.tsx`、`src/features/applications/common/lib/points.ts`、`src/features/applications/common/lib/points.test.ts`、`src/shared/api/api-client.ts`、`src/shared/api/api-client.test.ts` | shared/API unit tests、FS-002 tests、`npm run typecheck`、`npm run lint`、`npm run build` | `feat(applications): add shared application utilities` |
| I3 | 建立競賽契約、表單模型、點數與 Idempotency domain | `src/features/applications/competition/api/**`、`model/**`、`src/test/fixtures/competition-application.ts`、`src/test/handlers/public-competition-application.ts`、`src/test/server.ts` | competition unit／contract tests、`npm run typecheck`、`npm run lint`、`npm run build` | `feat(competition): add application contracts and rules` |
| I4 | 建立 FS-004 實際使用的共用申請控制項 | `src/features/applications/common/components/**` 及 colocated tests | common component tests、`npm run typecheck`、`npm run lint`、`npm run build` | `feat(applications): add shared application controls` |
| I5 | 完成競賽五步表單、送件狀態與 route 整合 | `src/features/applications/competition/components/**`、`competition-application-page*`、`src/app/router/router*`、`src/app/app.test.tsx` | competition page／router tests、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `feat(competition): add public competition application` |
| I6 | 覆蓋完整瀏覽器流程與既有公開入口回歸 | `e2e/competition-application.spec.ts`、`e2e/application-entry.spec.ts` | targeted Chromium Playwright、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `test(competition): cover application workflow` |
| Verification | 保存完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、`git diff --check` | `docs(FS-004): record competition application verification` |
| R1 | 將競賽內容移至第一步，參與者與點數移至第二步，並同步錯誤／摘要落點 | `src/features/applications/competition/competition-application-page.tsx`、`components/competition-confirmation-step.tsx`、相關 unit／page／router tests、`e2e/application-entry.spec.ts`、`e2e/competition-application.spec.ts` | targeted Vitest、typecheck、lint、test、build、targeted Chromium Playwright | `fix(competition): reorder application details steps` |
| Reverification | 保存步驟重排後完整 AI Verification 與等待人工狀態 | Spec、Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): update application flow verification` |
| Applicant Revision Draft | 保存已同意的申請人互動需求、draft Spec／Plan 與等待核准狀態 | `docs/project/product-requirements.md`、`docs/project/application-rules.md`、`docs/project/routes-and-pages.md`、`docs/project/testing-strategy.md`、FS-004 Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): revise applicant selection flow` |
| R2 | 改為明確選擇申請人，將聯絡資料置於申請人卡片，並補齊未選與改選互動 | `src/features/applications/common/components/participants-editor.tsx`、相關 common component tests、`src/features/applications/competition/model/competition-application.schema.ts`、相關 model tests、`src/features/applications/competition/competition-application-page.tsx`、page tests、`e2e/competition-application.spec.ts` | targeted Vitest、typecheck、lint、test、build、targeted Chromium Playwright | `fix(competition): clarify applicant selection` |
| Applicant Reverification | 保存申請人互動修訂後完整 AI Verification 與等待人工狀態 | Spec、Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): update applicant selection verification` |
| F1 | 將 Playwright specs 納入獨立 TypeScript project 與根 project references | `tsconfig.json`、`tsconfig.e2e.json` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、完整 Chromium Playwright | `fix(testing): typecheck playwright specifications` |
| E2E Typecheck Reverification | 記錄 E2E typecheck 缺口修正與完整重新驗證 | Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): record e2e typecheck correction` |
| Field Error Revision Draft | 保存已同意的錯誤呈現需求、draft Spec／Plan 與等待核准狀態 | `docs/project/development-standards.md`、`docs/project/frontend-architecture.md`、`docs/project/routes-and-pages.md`、`docs/project/testing-strategy.md`、FS-004 Slice Brief、Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): revise competition application requirements` |
| Field Error Approval | 保存重新核准的 FS-004 Spec、Plan、Commit Plan 與狀態 | FS-004 Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): approve field error presentation` |
| R3 | 以 React Hook Form 統一欄位錯誤並提供就地錯誤、紅框、區塊及系統提示 | `src/features/applications/competition/competition-application-page.tsx`、`src/features/applications/competition/components/competition-details-step.tsx`、`src/features/applications/common/components/participants-editor.tsx`、`src/features/applications/common/components/advisor-selector.tsx`、`src/features/applications/common/components/attachment-editor.tsx`、`src/features/applications/common/components/error-summary.tsx`、相關 component／page tests、`e2e/competition-application.spec.ts` | targeted Vitest、typecheck、lint、test、build、targeted Chromium Playwright | `fix(competition): localize form validation feedback` |
| Field Error Reverification | 保存錯誤呈現修訂後完整 AI Verification 與等待人工狀態 | Spec、Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): record field error verification` |
| Field Error Fix Approval | 保存已核准的補強 batch、驗證範圍與 FS-004 進行中狀態 | Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): approve field error fix plan` |
| F2 | 補齊年級、班級、附件分類與附件說明的可定位 422 就地錯誤及測試 | `src/features/applications/common/components/participants-editor.tsx`、`src/features/applications/common/components/attachment-editor.tsx`、`src/features/applications/common/components/application-controls.test.tsx`、`src/features/applications/competition/competition-application-page.test.tsx` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `fix(competition): complete field error coverage` |
| Field Error Fix Reverification | 保存 F2 後完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): record field error fix verification` |
| Shared Point Revision Draft | 保存已核准的 shared point allocation 與學年度顯示需求、draft Spec／Plan、changes-requested 與等待核准狀態 | `docs/project/` 相關文件、FS-004 Slice Brief、Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): revise shared point allocation flow` |
| Shared Point Approval | 保存重新核准的 FS-004 Spec、Plan、Commit Plan 與狀態 | FS-004 Slice Brief、Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): approve shared point allocation revision` |
| R4 | shared 全員 0.00 初始化、自訂 0.50 加減控制、摘要上移，並隱藏學年度顯示但保留 payload | `competition-points.ts` 與測試、`participants-editor.tsx` 與控制項測試、`competition-application-page.tsx` 與測試、`competition-confirmation-step.tsx`、`e2e/competition-application.spec.ts` | targeted Vitest、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `fix(competition): improve shared point allocation controls` |
| Shared Point Reverification | 保存 R4 後完整 AI Verification 與等待人工狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、文件一致性、`git diff --check` | `docs(FS-004): record shared point allocation verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-004): record competition application acceptance` |

## Approval

- Approved By: `pending`
- Approved At: `pending`
- Approval Note: `等待使用者重新核准 shared point allocation 與學年度顯示修訂後的 Spec、Plan 與 Commit Plan。`
