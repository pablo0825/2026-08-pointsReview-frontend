# FS-006 — Certificate Application

## Slice Information
- ID: `FS-006`
- Name: `certificate-application`
- Type: `feature`
- Depends On: `FS-003`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓學生依有效規則完成單人證照申請並了解固定點數與累積上限。

## User-Visible Result
申請人可填寫證照資料、查看不可自由修改的點數與上限提示，補齊老師及證照附件後送件。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 4, 7–8
- `docs/project/backend-contract-changes.md`, section 2 B10–B11
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 單人五步表單、證照資料、日期、固定點數／上限提示、老師、附件、預覽、重複申請錯誤與送件。

## Excluded
- 部分核准、自由調整點數、其他申請類型、補件與草稿。

## AI Responsibility
- 完成垂直功能、API／錯誤處理、測試與文件；不自行決定證照編號正規化規則。

## Human Integration
- 確認證照編號正規化與防重策略，完成 B10–B11 並提供上限／重複案例資料。

## AI Acceptance
- 自動驗證日期、固定點數、上限提示、必要附件、步驟與已知重複錯誤呈現。

## Human Acceptance
- 使用者完成真實送件，並確認上限與重複申請阻擋訊息符合後端規則。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
