# FS-007 — Exhibition Application

## Slice Information
- ID: `FS-007`
- Name: `exhibition-application`
- Type: `feature`
- Depends On: `FS-003`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓學生依展覽類型與離散點數規則完成單人或多人展覽申請。

## User-Visible Result
申請人可輸入展覽資料、只選允許的每人點數、選老師與上傳附件，預覽後送件。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 5, 7–8
- `docs/project/backend-contract-changes.md`, section 2 B01–B02, B10
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 多人五步表單、展覽資料與日期、`fan_work`／`project_work`、離散點數、老師、附件、預覽與送件。

## Excluded
- `external_exhibition` 舊值、自由輸入點數、其他申請類型、補件與草稿。

## AI Responsibility
- 完成垂直功能、學號大寫正規化、最終欄位契約、日期／點數驗證、測試與文件；未登入正式送件不得索取 Session 或 CSRF Token，且須以必填 Idempotency Key 與不可變快照防止同一次操作重複建立案件，所有 5xx 皆依結果不確定流程以相同快照手動重新確認。

## Human Integration
- 後端需完成 B01、B02、B10、B13 及公開規則／正式送件契約並提供資料。

## AI Acceptance
- 自動驗證學號正規化、離散端點、日期順序、`other` 名稱、參與者、附件、步驟、Idempotent retry 與成功狀態。

## Human Acceptance
- 使用者完成兩種展覽類型與多人真實送件，確認欄位名稱、點數與成功資訊。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
