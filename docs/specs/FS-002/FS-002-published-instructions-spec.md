# FS-002 — Published Instructions Spec

## Document Information

- Feature Slice: `FS-002`
- Change Type: `feature`
- Document Status: `completed`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-11`
- Last Updated: `2026-08-12`

## Change Information

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `this document`

## Source Reference

- `docs/project/product-requirements.md`, sections 4.1, 10
- `docs/project/routes-and-pages.md`, sections 2, 5, 10–11
- `docs/project/api-integration.md`, sections 2–3, 5, 11

## User Story

```text
身為未登入的公開訪客，
我希望依申請類型與學年度閱讀已發布且可見的申請辦法，並能快速前往長篇內容的指定章節，
以便在提出申請前確認適用規則。
```

## Behavior Change

### Current Behavior

- `not-applicable`；本 Slice 為新功能。

### Target Behavior

- 訪客可由共用公開導覽進入 `/rules`，不需登入。
- 初次進入頁面時顯示「請選擇申請類型」與四個大型申請類型按鈕；不預選申請類型，也不查詢公開辦法。
- 每次選定或切換申請類型時，頁面只發送一次省略 `academicYear` 的公開辦法 request，取得該類型所有公開學年度 sections。
- 選定申請類型後，頁面預設顯示目前臺灣學年度的公開申請辦法。
- 訪客可切換至回應中存在的其他學年度；目前與歷史內容有清楚標示，切換年度時由前端使用同一次回應篩選內容，不再發送 request。
- 頁面只呈現後端判定為已發布、可見且已生效的內容；目前後端未使用 `effectiveTo` 排除已超過失效日期的內容。
- 一個申請類型與學年度可由一個或多個辦法 section 組成；後端依 `displayOrder` 由小到大排列，頁面保留 API 回傳順序，各 section 的 Markdown 保留可閱讀的標題階層，並提供目錄與可定位的章節錨點。
- 頁面具有明確的載入、無內容與失敗狀態；失敗時可重試。
- 桌面與 360px 寬度皆可閱讀、操作，不產生非必要的水平捲動。

### Preserved Behavior

- `not-applicable`；本 Slice 無既有正式行為需要保留。

## Input / Output

### Input

- 訪客造訪 `/rules`。
- 訪客指定申請類型。
- 訪客選擇可供公開閱讀的學年度。
- 公開申請辦法服務依申請類型回傳所有公開學年度 sections。

### Output

- 所選申請類型由公開 API 回傳的所有公開學年度 sections，以及前端依所選學年度篩選出的顯示內容；可能包含 `effectiveTo` 已早於今天的內容。
- 標題「請選擇申請類型」，以及「競賽申請」、「參與計畫申請」、「證照申請」、「展覽申請」四個大型按鈕。
- 可切換目前與歷史內容的學年度選擇器。
- 與文章標題對應的目錄及頁內錨點。
- 對應查詢結果的載入、無內容、成功或失敗畫面。

## Rules

1. `/rules` 是公開頁面，不得要求登入或依賴使用者身分。
2. 初次進入頁面時必須顯示標題「請選擇申請類型」，以及依序排列的「競賽申請」、「參與計畫申請」、「證照申請」、「展覽申請」四個大型按鈕。
3. 初次進入頁面時不得預選申請類型，也不得發送公開辦法 request；訪客必須先選擇申請類型。
4. 公開辦法查詢必須提供所選 `applicationType`；頁面不得把一種申請類型的內容標示為另一種類型。
5. 頁面查詢所選申請類型時必須省略選填的 `academicYear`，一次取得該類型所有公開學年度 sections；同一申請類型的年度切換不得再發送公開辦法 request。
6. 選定申請類型後，頁面預設顯示目前臺灣學年度。
7. 學年度選擇器必須包含目前臺灣學年度及所選申請類型 Response 中存在的其他公開學年度；切換年度時以前端篩選保留原 Response 順序的 matching sections。
8. 公開端點由後端限制 `status = published`、`isVisible = true`，且 `effectiveFrom` 不晚於 Asia/Taipei 當日；公開 Response 不提供 `status` 或 `isVisible`，前端直接信任 API 篩選結果，不自行判斷發布、可見或生效狀態。
9. 同一申請類型與學年度可包含一個或多個 sections；後端保證依 `displayOrder` 由小到大排列，前端必須保留 API 陣列順序，不自行排序，且每個 section 必須保留其標題與 Markdown 內容。
10. Markdown 標題必須具有同頁唯一的錨點；目錄項目必須對應並可前往相關標題。
11. Markdown 或內嵌 HTML 中的腳本、事件處理屬性、危險 URL 與其他可執行內容不得進入頁面；文章連結必須具備安全行為。
12. 查詢期間顯示載入狀態；後端以 `HTTP 200 OK` 回傳 `{ "data": [] }` 時，顯示所選申請類型與學年度的無內容狀態，不得視為 `404`、失敗或成功文章；查詢失敗時顯示安全、可理解的錯誤訊息與重試操作。
13. 切換申請類型後，不得把前一次 request 的內容誤標為新類型；切換學年度後，只能顯示目前類型 Response 中符合所選 `academicYear` 的 sections。
14. 四個申請類型按鈕、學年度選擇器、重試按鈕與目錄連結須可使用鍵盤操作，並具有清楚的焦點狀態及至少 44×44px 的主要互動目標；非同步狀態須能被輔助科技辨識。
15. 內容、目錄與控制項在 360px 寬度下不得遮蔽主要資訊或造成非必要的水平捲動。
16. 錯誤畫面不得向訪客暴露內部端點細節、堆疊、token 或其他敏感資訊。
17. 本切片不包含管理員建立、編輯、預覽、發布或調整可見性的功能。
18. 目前後端不以 `effectiveTo` 排除內容；前端不得依 `effectiveTo` 自行排除 API 已回傳的 section，因此可能呈現已超過失效日期的內容。

## Included

- `/rules` 公開申請辦法頁面。
- 必填申請類型輸入與類型資料隔離。
- 目前臺灣學年度預設值與公開學年度切換。
- 一個或多個安全 Markdown sections、標題目錄與頁內錨點。
- 載入、無內容、錯誤、成功、鍵盤、基本輔助科技與 360px 狀態。
- 公開申請辦法資料整合與回應契約驗證。

## Excluded

- 申請辦法的管理、草稿、預覽、發布與顯示設定。
- 登入、角色權限或受保護頁面。
- 申請表單、點數規則管理與其他公開資料頁面。

## Preliminary Integration Contract

- 公開頁使用 `GET /public/application-instructions`，必須提供 `applicationType`，可選擇是否提供 `academicYear`。
- `/rules` 頁面每次選定申請類型只呼叫省略 `academicYear` 的形式一次；選填 `academicYear` 的 API 能力維持不變，但不由本頁的年度切換使用。
- `applicationType` 只接受 `competition`、`project_participation`、`certificate` 或 `exhibition`。
- `GET /public/application-instructions?applicationType=competition` 回傳 `competition` 的所有公開學年度 sections；加上 `academicYear=114` 時，`data` 只包含 114 學年度的 sections。
- 成功回應遵循 `{ "data": [...] }` envelope。每筆資料包含 `academicYear`、`revisionNumber`、`sectionKey`、`title`、`content`、`displayOrder`、`effectiveFrom` 與可為 `null` 的 `effectiveTo`。
- `academicYear`、`sectionKey`、`title` 與 `content` 是字串；`revisionNumber` 與 `displayOrder` 是數字；`effectiveFrom` 與非空的 `effectiveTo` 使用 `YYYY-MM-DD`。
- 同一 `applicationType` 與 `academicYear` 可包含多筆 sections；後端保證 Response 已依 `displayOrder` 由小到大排列，前端保留 API 陣列順序。
- 省略 `academicYear` 的回應提供所選 `applicationType` 可切換的公開學年度；提供 `academicYear` 的回應限制為指定年度。
- 查無符合條件的公開 sections 時，後端固定回傳 `HTTP 200 OK` 與 `{ "data": [] }`，不回傳 `404`；前端將此結果映射為 empty state。
- 頁面 query key 以所選 `applicationType` 為輸入；切換類型時舊 request 不得覆蓋目前選擇的結果，切換年度則在目前類型已驗證的 Response 中篩選。
- 回應不符合正式 wire contract 時，以安全的失敗狀態呈現，不顯示未驗證內容。
- 沒有已發布且可見內容時呈現 empty；暫時性 API 或網路錯誤呈現 failure 並可重試。
- 頁面只信任後端公開端點提供的可見內容，但所有 Markdown 仍必須經過安全處理後才能呈現。
- 後端只回傳 `status = published`、`isVisible = true`，且 `effectiveFrom` 不晚於 Asia/Taipei 當日的 sections；公開 Response 不含 `status` 與 `isVisible`，前端不自行重複判斷。
- 後端目前不使用 `effectiveTo` 過濾；前端不依此欄位排除已回傳資料，因此公開內容不保證尚未超過失效日期。

## AI Acceptance

- [x] 自動驗證未登入狀態可開啟 `/rules`，且不會被重新導向登入頁。
- [x] 自動驗證初始顯示「請選擇申請類型」與四個固定文案的大型按鈕，且沒有預選；選擇前不發送公開辦法 request。
- [x] 自動驗證每次選定申請類型只發送一個包含所選 `applicationType` 且省略 `academicYear` 的 request，取得該類型所有公開學年度。
- [x] 自動驗證四個合法 `applicationType` 均可查詢，且不會送出 enum 以外的值。
- [x] 自動驗證選定申請類型後使用目前臺灣學年度；切換申請類型會發送該新類型唯一一次 request，切換學年度不會再發送 request，且兩者都顯示相對應內容。
- [x] 自動驗證只顯示公開端點提供的內容；空內容不會顯示成成功文章。
- [x] 自動驗證 section 陣列的所有欄位通過契約驗證，並依 API 回傳順序呈現所選申請類型與學年度的一個或多個 sections，不在前端重新排序。
- [x] 自動驗證前端不需要 `status` 或 `isVisible` 欄位，且不會依 `effectiveTo` 排除 API 已回傳的內容。
- [x] 自動驗證 Markdown 標題會產生唯一錨點，且目錄可正確定位各章節。
- [x] 自動驗證惡意 HTML、事件屬性、危險 URL 與其他可執行內容不會進入頁面。
- [x] 自動驗證 `HTTP 200 OK` 與 `{ "data": [] }` 呈現無內容狀態，不會被視為 `404`、API failure 或成功文章，並覆蓋載入、API 失敗、契約驗證失敗與成功狀態。
- [x] 自動驗證快速切換申請類型時不會把舊 request 結果顯示為新類型，切換學年度時只顯示同一次目前類型 Response 中的 matching sections。
- [x] 自動驗證四個按鈕依指定順序支援鍵盤操作、具清楚焦點與至少 44×44px 的目標；非同步狀態可辨識，且 360px 版面無非必要水平捲動。
- [x] `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 與相關 Playwright 流程通過。

## Human Acceptance

- [x] 在桌面寬度閱讀一篇含多層標題的長篇辦法，確認目錄結構清楚且所有章節連結正確。
- [x] 在 360px 寬度切換申請類型、目前與歷史學年度，確認控制項、目錄與文章仍易於閱讀和操作。
- [x] 驗證一個沒有公開內容的學年度，以及一次可重試的 API 失敗狀態。
- [x] 使用鍵盤操作申請類型控制項、學年度選擇器、目錄連結與重試按鈕。
- [x] 確認文章中的安全連結行為符合預期，且不會執行測試用惡意內容。

## Open Questions

- `none`

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-11`
- Approval Note: `使用者已明確核准每個申請類型只查詢一次的修訂 Spec、Plan 與 Commit Plan。`

## Template Rules

- 只定義「做什麼」。
- 不分析現有程式碼。
- 不以現有實作限制降低需求。
- 不寫詳細 implementation steps。
- 不自行回答會實質影響 Scope 或 Acceptance 的 Open Question。
- 每個新 Slice 使用自己的 ID 資料夾，不建立 `v2`、`final`、`new` 文件。
- 已接受需求改變時建立 `change` Spec，不覆寫舊 Spec。
- `change` 核准後只在舊 Spec 加入 `Supersession Pending`，並維持舊 Spec 為 `completed`。
- `change` Accepted 後才將舊 Spec 設為 `superseded`，並加入新文件連結。
- `correction` 不使 Authoritative Spec 過期。
