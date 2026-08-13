# FS-004 — Competition Application

## Slice Information
- ID: `FS-004`
- Name: `competition-application`
- Type: `feature`
- Depends On: `FS-003`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓學生依有效競賽規則完成單人或多人競賽申請。

## User-Visible Result
申請人可完成五步表單，明確從參與者中指定申請人、填寫該申請人的聯絡資料、選老師、上傳附件、正確分配 `per_person` 或 `shared_total` 點數；`shared_total` 從 0.00 開始，透過 0.50 加減按鈕或手動輸入完成分配，並在清單上方掌握總點數、已分配與剩餘點數。競賽表單不顯示系統學年度，但送件仍包含該值；預覽送出後，成功頁顯示申請編號、目前狀態、送件時間與 Email 通知提醒。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1–2, 7–8
- `docs/project/routes-and-pages.md`, sections 4, 10–11
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 參與者、明確選擇申請人、申請人卡片內聯絡資料、就地欄位／區塊錯誤與焦點、學籍、隱藏但送出的系統學年度、競賽資料、有效規則、從 0.00 開始的 shared point 分配與自訂加減控制、老師、附件、預覽、離開警告與 multipart 送件。

## Excluded
- 其他三類申請、補件、送件後進度查詢與草稿持久化。

## AI Responsibility
- 建立首個實際使用的共用申請 Wizard、參與者、老師與附件基礎元件，並完成競賽申請垂直功能、學號大寫正規化、整數點數計算、單次規則／老師查詢、確認摘要、離開警告、契約／錯誤處理、測試與文件；未登入正式送件不得索取 Session 或 CSRF Token，且須以必填 Idempotency Key 與不可變快照防止同一次操作重複建立案件，所有 5xx 皆依結果不確定流程以相同快照手動重新確認。

## Human Integration
- 後端需完成 B03、B10、B13 及公開規則／正式送件契約並提供測試資料。

## AI Acceptance
- 自動驗證初始未選申請人、聯絡資料卡片位置、欄位下方錯誤、紅框、區塊錯誤與焦點、系統提示、改選清除、唯一申請人 payload、兩種分配、`shared_total` 的 0.00 初始值／摘要位置／0.50 加減與手動輸入、學年度隱藏但存在 payload、規則切換／失效、單次查詢、動態人數、學號正規化／重複、歷史／未來日期、附件、確認摘要、離開警告、錯誤定位、5xx Idempotent retry、衝突／Rate Limit 及成功頁。

## Human Acceptance
- 使用者確認明確選擇申請人、卡片內聯絡資料與就地錯誤提示流程，確認競賽畫面不顯示學年度，完成 `per_person` 與從 0.00 手動分配的多人 `shared_total` 真實送件，並確認成功頁正確顯示申請編號、目前狀態、送件時間與 Email 通知提醒，且不顯示老師簽核期限。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
