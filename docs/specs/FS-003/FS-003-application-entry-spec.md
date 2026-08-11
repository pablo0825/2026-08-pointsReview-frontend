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
- `docs/project/application-rules.md`, sections 1.1, 7.2

## User Story

```text
身為準備提出點數申請的學生，
我希望比較四種申請類型並進入正確的申請入口，
以便在開始填表前理解適用情境、人數與最低附件要求。
```

## Behavior Change

### Current Behavior

- `not-applicable`；本 Slice 為新功能。

### Target Behavior

- 造訪 `/` 的使用者會被導向 `/apply`。
- `/apply` 顯示競賽、參與計畫、證照與展覽四張申請卡片。
- 每張卡片提供足以辨識用途的簡短適用情境、目前允許人數與最低附件要求。
- 使用者可以從每張卡片前往對應申請路由，或前往 `/rules` 查看完整申請辦法。

### Preserved Behavior

- `not-applicable`；本 Slice 無既有正式行為需要保留。

## Input / Output

### Input

- 使用者造訪 `/` 或 `/apply`。
- 四種申請類型的顯示名稱、適用情境、目前允許人數與最低附件要求。

### Output

- 一個可在桌面與最低 360px 寬度使用的公開申請入口頁。
- 四張可辨識、可由鍵盤操作的申請類型卡片。
- 前往 `/apply/competition`、`/apply/project-participation`、`/apply/certificate`、`/apply/exhibition` 與 `/rules` 的明確操作。
- 必要資料無法取得時，不顯示可能過期的替代規則，並向使用者提供可理解的失敗狀態與重試方式。

## Rules

1. `/` 必須直接導向 `/apply`，不得建立額外行銷首頁。
2. `/apply` 必須且只能提供競賽、參與計畫、證照與展覽四種第一版申請類型。
3. 類型名稱與路由分別為競賽 `/apply/competition`、參與計畫 `/apply/project-participation`、證照 `/apply/certificate`、展覽 `/apply/exhibition`。
4. 每張卡片必須顯示簡短適用情境、目前允許人數與最低附件要求。
5. 最低附件要求分別為：競賽至少一份參賽證明或入圍／獎狀、參與計畫至少一份薪資證明、證照至少一份證照影本、展覽至少一份展覽照片。
6. 每張卡片必須提供「開始申請」與「查看申請辦法」；後者前往 `/rules`。
7. 完整規則不得嵌入卡片，卡片只提供選擇類型所需摘要。
8. 公開頁採 Mobile First，最低支援 360px；主要觸控目標至少 44 × 44px，且操作不能只靠顏色或 Hover 傳達。
9. 卡片、連結與錯誤／重試操作必須支援鍵盤並具有可理解的可存取名稱。
10. 若「目前允許人數」依賴的必要資料載入中、為空或讀取失敗，頁面必須呈現明確狀態；失敗時可重試，且不得以未被需求確認的本機預設值冒充目前規則。

## Included

- 公開頁應用程式骨架與 `/apply` 頁面。
- `/` 至 `/apply` 的導向。
- 四類型卡片、摘要資料與申請／規則導覽。
- Loading、Empty、Error 與 Success 狀態。
- 360px 響應式、鍵盤操作及基本螢幕閱讀器語意。

## Excluded

- 四種類型的五步申請表單內容與送件。
- 年度申請辦法頁內容實作。
- 補件、草稿、進度查詢與自助撤回。
- 指導老師、承辦人及管理員頁面。
- 完整規則內容或管理規則功能。

## Preliminary Integration Contract

- 路由層必須公開提供 `/apply`，並將 `/` 導向 `/apply`。
- 四個「開始申請」操作分別輸出到既定申請路由；本 Slice 只保證導覽邊界，不實作目標表單。
- 四個「查看申請辦法」操作輸出到 `/rules`；本 Slice 不負責該頁內容。
- 卡片必須取得或接收可代表目前有效人數限制的資料，並以需求文件定義的最低附件要求組成使用者可讀摘要。
- 若目前人數資料需要非同步取得，對外可觀察狀態至少包含 loading、success、empty 與可重試 failure；資料未確認時不得顯示硬編碼數值作為目前規則。
- 本 Slice 不建立或修改申請資料，也不處理登入、Session 或個資。

## AI Acceptance

- [ ] 自動驗證 `/` 導向 `/apply`。
- [ ] 自動驗證四張卡片的名稱、適用情境、人數與最低附件摘要。
- [ ] 自動驗證四個「開始申請」路由與 `/rules` 連結。
- [ ] 自動驗證 loading、empty、failure、retry 與 success 狀態，且不以未確認本機值取代目前規則。
- [ ] 自動驗證鍵盤可操作性、可存取名稱與非純顏色資訊。
- [ ] Production build、typecheck、lint 與相關測試通過。
- [ ] 以瀏覽器檢查 360px 與桌面版面，確認沒有水平溢位且觸控目標符合要求。

## Human Acceptance

- [ ] 使用者在桌面與 360px 手機 viewport 確認四張卡片資訊清楚、排列可讀且操作容易辨識。
- [ ] 使用者確認四種適用情境與最低附件摘要足以協助選擇正確類型。
- [ ] 使用者逐一確認「開始申請」與「查看申請辦法」前往正確路由。
- [ ] 使用者確認必要資料失敗時的訊息與重試方式可以理解。

## Open Questions

- 「目前允許人數」應由哪一個後端 endpoint 與 response 欄位提供？現有 `docs/project/api-integration.md` 尚未定義公開參與人數規則 API；若第一版需要新增契約，必須先取得需求文件變更核准。
- 四張卡片的簡短「適用情境」是否已有核准文案？若沒有，需由使用者確認文案或授權後續 Spec 修訂採用提案文字。

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-11`
- Approval Note: `使用者已確認本 Spec、Plan 與 Commit Plan，可以開始後續開發批次。`

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
