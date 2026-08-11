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
我希望依學年度閱讀已發布且可見的申請辦法，並能快速前往長篇內容的指定章節，
以便在提出申請前確認適用規則。
```

## Behavior Change

### Current Behavior

- `not-applicable`；本 Slice 為新功能。

### Target Behavior

- 訪客可由共用公開導覽進入 `/rules`，不需登入。
- 頁面預設顯示目前臺灣學年度的公開申請辦法。
- 訪客可切換至可供閱讀的其他學年度；目前與歷史內容有清楚標示。
- 頁面只呈現後端判定為已發布且可見的內容。
- 長篇 Markdown 保留可閱讀的標題階層，並提供目錄與可定位的章節錨點。
- 頁面具有明確的載入、無內容與失敗狀態；失敗時可重試。
- 桌面與 360px 寬度皆可閱讀、操作，不產生非必要的水平捲動。

### Preserved Behavior

- `not-applicable`；本 Slice 無既有正式行為需要保留。

## Input / Output

### Input

- 訪客造訪 `/rules`。
- 訪客選擇可供公開閱讀的學年度。
- 公開申請辦法服務回傳的學年度、可見內容與查詢結果。

### Output

- 所選學年度的已發布且可見申請辦法。
- 可切換目前與歷史內容的學年度選擇器。
- 與文章標題對應的目錄及頁內錨點。
- 對應查詢結果的載入、無內容、成功或失敗畫面。

## Rules

1. `/rules` 是公開頁面，不得要求登入或依賴使用者身分。
2. 初次進入頁面時，預設查詢目前臺灣學年度。
3. 學年度選擇器只顯示可供公開閱讀的學年度，並允許切換目前與歷史內容。
4. 頁面只呈現後端提供的已發布且可見內容，不得顯示草稿、未發布或隱藏內容。
5. Markdown 標題必須具有同頁唯一的錨點；目錄項目必須對應並可前往相關標題。
6. Markdown 或內嵌 HTML 中的腳本、事件處理屬性、危險 URL 與其他可執行內容不得進入頁面；文章連結必須具備安全行為。
7. 查詢期間顯示載入狀態；查無公開內容時顯示該學年度的無內容狀態；查詢失敗時顯示安全、可理解的錯誤訊息與重試操作。
8. 切換學年度後，不得把前一學年度的內容誤標為目前選取學年度的新結果。
9. 非同步狀態須能被輔助科技辨識；學年度選擇器、重試按鈕與目錄連結須可使用鍵盤操作，主要互動目標至少為 44×44px。
10. 內容、目錄與控制項在 360px 寬度下不得遮蔽主要資訊或造成非必要的水平捲動。
11. 錯誤畫面不得向訪客暴露內部端點細節、堆疊、token 或其他敏感資訊。
12. 本切片不包含管理員建立、編輯、預覽、發布或調整可見性的功能。

## Included

- `/rules` 公開申請辦法頁面。
- 目前臺灣學年度預設值與公開學年度切換。
- 安全 Markdown、標題目錄與頁內錨點。
- 載入、無內容、錯誤、成功、鍵盤、基本輔助科技與 360px 狀態。
- 公開申請辦法資料整合與回應契約驗證。

## Excluded

- 申請辦法的管理、草稿、預覽、發布與顯示設定。
- 登入、角色權限或受保護頁面。
- 申請表單、點數規則管理與其他公開資料頁面。

## Preliminary Integration Contract

- 公開頁使用 `GET /public/application-instructions` 取得所選學年度的公開申請辦法。
- 成功回應遵循專案通用 `{ "data": ... }` envelope，並須讓頁面辨識內容所屬學年度、可供公開切換的學年度，以及是否存在可呈現的 Markdown。
- 每次查詢皆以所選學年度為輸入；切換學年度時，舊查詢不得覆蓋目前選擇的結果。
- 回應不符合正式 wire contract 時，以安全的失敗狀態呈現，不顯示未驗證內容。
- 沒有已發布且可見內容時呈現 empty；暫時性 API 或網路錯誤呈現 failure 並可重試。
- 頁面只信任後端公開端點提供的可見內容，但所有 Markdown 仍必須經過安全處理後才能呈現。

## AI Acceptance

- [ ] 自動驗證未登入狀態可開啟 `/rules`，且不會被重新導向登入頁。
- [ ] 自動驗證初次進入時使用目前臺灣學年度，切換學年度會查詢並顯示相對應內容。
- [ ] 自動驗證只顯示公開端點提供的內容；空內容不會顯示成成功文章。
- [ ] 自動驗證 Markdown 標題會產生唯一錨點，且目錄可正確定位各章節。
- [ ] 自動驗證惡意 HTML、事件屬性、危險 URL 與其他可執行內容不會進入頁面。
- [ ] 自動驗證載入、無內容、API 失敗、契約驗證失敗與成功狀態。
- [ ] 自動驗證快速切換學年度時，不會把舊請求結果顯示為新選取學年度的內容。
- [ ] 自動驗證主要操作可使用鍵盤、非同步狀態可辨識，且 360px 版面無非必要水平捲動。
- [ ] `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 與相關 Playwright 流程通過。

## Human Acceptance

- [ ] 在桌面寬度閱讀一篇含多層標題的長篇辦法，確認目錄結構清楚且所有章節連結正確。
- [ ] 在 360px 寬度切換目前與歷史學年度，確認控制項、目錄與文章仍易於閱讀和操作。
- [ ] 驗證一個沒有公開內容的學年度，以及一次可重試的 API 失敗狀態。
- [ ] 使用鍵盤操作學年度選擇器、目錄連結與重試按鈕。
- [ ] 確認文章中的安全連結行為符合預期，且不會執行測試用惡意內容。

## Open Questions

- `GET /public/application-instructions` 的正式 wire contract 尚未定義：學年度 query parameter 名稱與格式、response 欄位與型別、Markdown 欄位名稱、可切換學年度的來源，以及沒有內容／未發布／隱藏內容的 HTTP 或資料表示方式都需要確認。後端也需確認公開端點保證只回傳已發布且可見內容。

此問題不阻擋 Draft Spec 與 Plan 審查，但在開始資料層實作前必須確認，才能建立正確的 response schema、測試資料與整合案例。

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
