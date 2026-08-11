# FS-003 — Application Entry Spec

## Document Information

- Feature Slice: `FS-003`
- Change Type: `feature`
- Document Status: `approved`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-10`
- Last Updated: `2026-08-11`

## Change Information

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `this document`

## Source Reference

- `docs/project/product-requirements.md`, sections 4.1, 10–11
- `docs/project/routes-and-pages.md`, sections 1–3, 10–11
- `docs/project/application-rules.md`, section 1.1

## User Story

```text
身為準備提出點數申請的學生，
我希望從簡潔且一致的公開導覽選擇申請類型，
以便直接進入正確的申請流程或查看申請辦法。
```

## Behavior Change

### Current Behavior

- `not-applicable`；本 Slice 為新功能。

### Target Behavior

- 造訪 `/` 的使用者會被導向 `/apply`。
- 共用公開導覽列顯示「開始申請」與「申請辦法」，分別前往 `/apply` 與 `/rules`。
- `/apply` 顯示「請選擇申請類型」及競賽、參與計畫、證照與展覽四個大型連結。
- 使用者可以從四個連結直接前往對應申請路由。

### Preserved Behavior

- `not-applicable`；本 Slice 無既有正式行為需要保留。

## Input / Output

### Input

- 使用者造訪 `/` 或 `/apply`。
- 使用者操作共用公開導覽或四個申請類型連結。

### Output

- 一個可在桌面與最低 360px 寬度使用的公開申請入口頁。
- 可由鍵盤操作的共用公開導覽與四個大型申請類型連結。
- 前往 `/apply`、`/rules`、`/apply/competition`、`/apply/project-participation`、`/apply/certificate` 與 `/apply/exhibition` 的明確操作。

## Rules

1. `/` 必須直接導向 `/apply`，不得建立額外行銷首頁。
2. Production 必須使用根路徑 `/`，不得依賴子路徑 base path。
3. 共用公開導覽列必須提供「開始申請」前往 `/apply`，以及「申請辦法」前往 `/rules`。
4. `/apply` 必須顯示標題「請選擇申請類型」，並且只提供競賽、參與計畫、證照與展覽四種第一版申請類型。
5. 四個連結的顯示名稱與路由分別為「競賽申請」`/apply/competition`、「參與計畫申請」`/apply/project-participation`、「證照申請」`/apply/certificate`、「展覽申請」`/apply/exhibition`。
6. 入口頁不得顯示額外適用情境文案、參與人數、最低附件摘要或個別的「查看申請辦法」。
7. 公開頁採 Mobile First，最低支援 360px；主要觸控目標至少 44 × 44px，且操作不能只靠顏色或 Hover 傳達。
8. 導覽列與申請類型連結必須支援鍵盤並具有可理解的可存取名稱及清楚的焦點狀態。

## Included

- 公開頁應用程式骨架與 `/apply` 頁面。
- `/` 至 `/apply` 的導向。
- 共用公開導覽與四個大型申請類型連結。
- 360px 響應式、鍵盤操作及基本螢幕閱讀器語意。

## Excluded

- 四種類型的五步申請表單內容與送件。
- 年度申請辦法頁內容實作。
- 類型適用情境、參與人數及最低附件摘要。
- 補件、草稿、進度查詢與自助撤回。
- 指導老師、承辦人及管理員頁面。
- 完整規則內容或管理規則功能。

## Preliminary Integration Contract

- 路由層必須公開提供 `/apply`，並將 `/` 導向 `/apply`。
- Vite 與 Router 使用 production 根路徑 `/`。
- 共用公開導覽輸出 `/apply` 與 `/rules`；本 Slice 不負責 `/rules` 頁面內容。
- 四個申請類型連結輸出到既定申請路由；本 Slice 只保證導覽邊界，不實作目標表單。
- 入口頁不讀取公開規則或其他遠端資料。
- 本 Slice 不建立或修改申請資料，也不處理登入、Session 或個資。

## AI Acceptance

- [ ] 自動驗證 `/` 導向 `/apply`。
- [ ] 自動驗證共用公開導覽的「開始申請」與「申請辦法」連結。
- [ ] 自動驗證標題、四個申請類型名稱與對應路由。
- [ ] 自動驗證入口頁沒有額外文案、人數、附件摘要或個別辦法連結。
- [ ] 自動驗證鍵盤可操作性、可存取名稱、焦點狀態與非純顏色資訊。
- [ ] Production build、typecheck、lint 與相關測試通過。
- [ ] 以瀏覽器檢查 360px 與桌面版面，確認沒有水平溢位且觸控目標符合要求。

## Human Acceptance

- [ ] 使用者在桌面與 360px 手機 viewport 確認共用導覽與四個申請入口清楚、排列可讀且操作容易辨識。
- [ ] 使用者逐一確認四個申請入口前往正確路由。
- [ ] 使用者確認共用導覽的「開始申請」與「申請辦法」前往正確路由。

## Open Questions

- `none`；第一版不使用公開人數 API 或入口說明文案，production 使用根路徑 `/`。

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-11`
- Approval Note: `使用者已明確核准修訂後的 Spec、Plan 與 Commit Plan。`

## Template Rules

- 只定義「做什麼」。
- 不分析現有程式碼。
- 不以現有實作限制降低需求。
- 不寫詳細 implementation steps。
- 不自行回答會實質影響 Scope 或 Acceptance 的 Open Question。
- 每個新 Slice 使用自己的 ID 資料夾，不建立 `v2`、`final`、`new` 文件。
- 已接受需求改變時建立 `change` Spec，不覆寫舊 Spec。
- `change` 核准後只在舊 Spec 加入 `Supersession Pending`，並維持舊 Spec為 `completed`。
- `change` Accepted 後才將舊 Spec 設為 `superseded`，並加入新文件連結。
- `correction` 不使 Authoritative Spec 過期。
