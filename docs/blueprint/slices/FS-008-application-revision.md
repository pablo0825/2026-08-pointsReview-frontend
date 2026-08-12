# FS-008 — Application Revision

## Slice Information
- ID: `FS-008`
- Name: `application-revision`
- Type: `feature`
- Depends On: `FS-004, FS-005, FS-006, FS-007`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓學生透過有效限時 Token 修正原申請並建立新版本。

## User-Visible Result
學生可載入四類原申請、依補件原因修改允許欄位與附件後重送；類型及老師不可更換。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.1, 6, 12
- `docs/project/application-rules.md`, section 8
- `docs/project/workflows-and-permissions.md`, sections 2, 5.2–5.3, 6
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- Token 驗證、原資料／既有附件、新附件、欄位錯誤、期限狀態、重送與新版本結果。

## Excluded
- 更換類型或老師、學生進度查詢、自助撤回及無 Token 編輯。

## AI Responsibility
- 完成四類補件垂直流程、學號大寫正規化、契約、錯誤、測試與文件。

## Human Integration
- 提供有效、失效、逾期 Token 及各類補件測試案件；完成 B05、B13。

## AI Acceptance
- 自動驗證學號正規化、不可變欄位、附件組合、Token 狀態、錯誤定位與重送。

## Human Acceptance
- 使用者完成真實補件，確認新版本、舊簽名失效與重新通知老師。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
