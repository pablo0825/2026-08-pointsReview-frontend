# FS-002 — Published Instructions Spec

## Document Information

- Feature Slice: `FS-002`
- Change Type: `feature`
- Document Status: `draft`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-11`
- Last Updated: `2026-08-11`

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
- 初次進入頁面時不預選申請類型，也不查詢公開辦法；訪客須先從四種申請類型中選擇。
- 選定申請類型後，頁面預設顯示目前臺灣學年度的公開申請辦法。
- 訪客可切換至可供閱讀的其他學年度；目前與歷史內容有清楚標示。
- 頁面只呈現後端判定為已發布且可見的內容。
- 一個學年度可由一個或多個辦法 section 組成；各 section 的 Markdown 保留可閱讀的標題階層，並提供目錄與可定位的章節錨點。
- 頁面具有明確的載入、無內容與失敗狀態；失敗時可重試。
- 桌面與 360px 寬度皆可閱讀、操作，不產生非必要的水平捲動。

### Preserved Behavior

- `not-applicable`；本 Slice 無既有正式行為需要保留。

## Input / Output

### Input

- 訪客造訪 `/rules`。
- 訪客指定申請類型。
- 訪客選擇可供公開閱讀的學年度。
- 公開申請辦法服務依申請類型與選填學年度回傳的公開 sections。

### Output

- 所選申請類型與學年度的已發布且可見申請辦法 sections。
- 可指定申請類型的控制項。
- 可切換目前與歷史內容的學年度選擇器。
- 與文章標題對應的目錄及頁內錨點。
- 對應查詢結果的載入、無內容、成功或失敗畫面。

## Rules

1. `/rules` 是公開頁面，不得要求登入或依賴使用者身分。
2. 初次進入頁面時不得預選申請類型，也不得發送公開辦法 request；訪客必須先選擇申請類型。
3. 公開辦法查詢必須提供所選 `applicationType`；頁面不得把一種申請類型的內容標示為另一種類型。
4. `academicYear` 是選填的查詢條件；省略時取得所選申請類型的所有公開學年度，提供時只取得指定學年度。
5. 選定申請類型後，頁面預設顯示目前臺灣學年度。
6. 學年度選擇器只顯示所選申請類型可供公開閱讀的學年度，並允許切換目前與歷史內容。
7. 頁面只呈現後端提供的已發布且可見內容，不得顯示草稿、未發布或隱藏內容。
8. 同一申請類型與學年度可包含一個或多個 sections；每個 section 必須保留其標題與 Markdown 內容。
9. Markdown 標題必須具有同頁唯一的錨點；目錄項目必須對應並可前往相關標題。
10. Markdown 或內嵌 HTML 中的腳本、事件處理屬性、危險 URL 與其他可執行內容不得進入頁面；文章連結必須具備安全行為。
11. 查詢期間顯示載入狀態；查無公開內容時顯示所選申請類型與學年度的無內容狀態；查詢失敗時顯示安全、可理解的錯誤訊息與重試操作。
12. 切換申請類型或學年度後，不得把前一次查詢內容誤標為目前選擇的新結果。
13. 非同步狀態須能被輔助科技辨識；申請類型控制項、學年度選擇器、重試按鈕與目錄連結須可使用鍵盤操作，主要互動目標至少為 44×44px。
14. 內容、目錄與控制項在 360px 寬度下不得遮蔽主要資訊或造成非必要的水平捲動。
15. 錯誤畫面不得向訪客暴露內部端點細節、堆疊、token 或其他敏感資訊。
16. 本切片不包含管理員建立、編輯、預覽、發布或調整可見性的功能。

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
- `applicationType` 只接受 `competition`、`project_participation`、`certificate` 或 `exhibition`。
- `GET /public/application-instructions?applicationType=competition` 回傳 `competition` 的所有公開學年度 sections；加上 `academicYear=114` 時，`data` 只包含 114 學年度的 sections。
- 成功回應遵循 `{ "data": [...] }` envelope。每筆資料包含 `academicYear`、`revisionNumber`、`sectionKey`、`title`、`content`、`displayOrder`、`effectiveFrom` 與可為 `null` 的 `effectiveTo`。
- `academicYear`、`sectionKey`、`title` 與 `content` 是字串；`revisionNumber` 與 `displayOrder` 是數字；`effectiveFrom` 與非空的 `effectiveTo` 使用 `YYYY-MM-DD`。
- 省略 `academicYear` 的回應提供所選 `applicationType` 可切換的公開學年度；提供 `academicYear` 的回應限制為指定年度。
- 每次查詢皆以所選 `applicationType` 與選填 `academicYear` 為輸入；切換任一條件時，舊查詢不得覆蓋目前選擇的結果。
- 回應不符合正式 wire contract 時，以安全的失敗狀態呈現，不顯示未驗證內容。
- 沒有已發布且可見內容時呈現 empty；暫時性 API 或網路錯誤呈現 failure 並可重試。
- 頁面只信任後端公開端點提供的可見內容，但所有 Markdown 仍必須經過安全處理後才能呈現。

## AI Acceptance

- [ ] 自動驗證未登入狀態可開啟 `/rules`，且不會被重新導向登入頁。
- [ ] 自動驗證初始顯示四種申請類型且沒有預選；選擇前不發送公開辦法 request。
- [ ] 自動驗證 request 必須包含所選 `applicationType`，省略 `academicYear` 時可取得該類型所有公開學年度。
- [ ] 自動驗證四個合法 `applicationType` 均可查詢，且不會送出 enum 以外的值。
- [ ] 自動驗證選定申請類型後使用目前臺灣學年度，切換申請類型或學年度會查詢並顯示相對應內容。
- [ ] 自動驗證只顯示公開端點提供的內容；空內容不會顯示成成功文章。
- [ ] 自動驗證 section 陣列的所有欄位通過契約驗證，並呈現所選學年度的一個或多個 sections。
- [ ] 自動驗證 Markdown 標題會產生唯一錨點，且目錄可正確定位各章節。
- [ ] 自動驗證惡意 HTML、事件屬性、危險 URL 與其他可執行內容不會進入頁面。
- [ ] 自動驗證載入、無內容、API 失敗、契約驗證失敗與成功狀態。
- [ ] 自動驗證快速切換申請類型或學年度時，不會把舊請求結果顯示為新選擇的內容。
- [ ] 自動驗證主要操作可使用鍵盤、非同步狀態可辨識，且 360px 版面無非必要水平捲動。
- [ ] `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 與相關 Playwright 流程通過。

## Human Acceptance

- [ ] 在桌面寬度閱讀一篇含多層標題的長篇辦法，確認目錄結構清楚且所有章節連結正確。
- [ ] 在 360px 寬度切換申請類型、目前與歷史學年度，確認控制項、目錄與文章仍易於閱讀和操作。
- [ ] 驗證一個沒有公開內容的學年度，以及一次可重試的 API 失敗狀態。
- [ ] 使用鍵盤操作申請類型控制項、學年度選擇器、目錄連結與重試按鈕。
- [ ] 確認文章中的安全連結行為符合預期，且不會執行測試用惡意內容。

## Open Questions

- 申請類型控制項應使用哪種具體呈現方式仍待確認。
- 同一學年度存在多個 sections 時，是否由後端保證 `displayOrder` 順序，以及前端是否需自行排序，尚未確認。
- 沒有內容、未發布與隱藏內容是以 `200` 加上空陣列或其他 HTTP 結果表示，以及公開端點是否保證只回傳已發布且可見內容，仍待確認。

上述問題不阻擋 Draft 文件修訂，但在開始資料層與頁面實作前必須確認。

## Approval

- Approved By: `pending`
- Approved At: `pending`
- Approval Note: `pending`

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
