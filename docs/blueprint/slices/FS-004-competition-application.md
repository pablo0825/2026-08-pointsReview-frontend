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
申請人可完成五步表單、選老師、上傳附件、正確分配 `per_person` 或 `shared_total` 點數，預覽並在成功頁取得申請編號、目前狀態、送件時間與 Email 通知提醒。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1–2, 7–8
- `docs/project/routes-and-pages.md`, sections 4, 10–11
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 參與者、申請人、學籍、競賽資料、有效規則、點數分配、老師、附件、預覽、離開警告與 multipart 送件。

## Excluded
- 其他三類申請、補件、送件後進度查詢與草稿持久化。

## AI Responsibility
- 建立首個實際使用的共用申請 Wizard、參與者、老師與附件基礎元件，並完成競賽申請垂直功能、整數點數計算、契約／錯誤處理、測試與文件。

## Human Integration
- 後端需完成 B03、B10 及公開規則／正式送件契約並提供測試資料。

## AI Acceptance
- 自動驗證兩種分配、動態人數、日期、附件、步驟、錯誤定位及成功頁。

## Human Acceptance
- 使用者完成 `per_person` 與多人 `shared_total` 真實送件，並確認成功頁正確顯示申請編號、目前狀態、送件時間與 Email 通知提醒，且不顯示老師簽核期限。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
