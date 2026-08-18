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
申請人可以「參與者資料」、「展覽內容與點數」、「指導老師」、「附件」、「確認送出」五步完成申請；展覽類型決定每位參與者可選的離散點數，更換類型時保留參與者資料但要求重新確認點數。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 5, 7–8
- `docs/project/routes-and-pages.md`, section 4
- `docs/project/backend-contract-changes.md`, section 2 B01–B02, B10, B13
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 1～15 人五步表單、固定展覽名稱、展覽資料與日期、`fan_work`／`project_work`、API 離散點數、類型切換後重選點數、老師、附件、預覽與送件。

## Excluded
- `external_exhibition` 舊值、自由輸入點數、其他申請類型、補件與草稿。

## AI Responsibility
- 完成垂直功能、學號大寫正規化、固定展覽名稱、規則與正式送件 Wire Contract、日期／點數驗證、類型切換後的點數清除、測試與文件；未登入正式送件不得索取 Session 或 CSRF Token，且須以必填 Idempotency Key 與不可變快照防止同一次操作重複建立案件，所有 5xx 皆依結果不確定流程以相同快照手動重新確認。

## Human Integration
- 後端需完成 B01、B02、B10、B13 及公開規則／正式送件契約並提供資料。

## AI Acceptance
- 自動驗證學號正規化、離散端點、類型切換後保留參與者並清除點數、日期順序、固定名稱與 `other`、參與者、附件、五步、Idempotent retry 與成功狀態。

## Human Acceptance
- 使用者完成兩種展覽類型與多人真實送件，確認欄位名稱、點數與成功資訊。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
