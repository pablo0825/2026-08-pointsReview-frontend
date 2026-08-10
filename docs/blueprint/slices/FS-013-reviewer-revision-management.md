# FS-013 — Reviewer Revision Management

## Slice Information
- ID: `FS-013`
- Name: `reviewer-revision-management`
- Type: `feature`
- Depends On: `FS-008, FS-012`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓承辦人要求補件並在有效期間延長補件期限。

## User-Visible Result
承辦人可填寫原因發起補件，或查看原期限後設定更晚期限；補件中不會出現不允許的操作。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.3, 9, 12
- `docs/project/routes-and-pages.md`, sections 8.2–8.3
- `docs/project/workflows-and-permissions.md`, sections 5.2–5.3
- `docs/project/api-integration.md`, sections 8, 11

## Included
- 要求補件、預計期限、延長期限與原因、狀態限制、通知後的佇列更新及 409。

## Excluded
- 學生重送 UI、補件中直接核准、再次要求補件與老師補件。

## AI Responsibility
- 完成補件管理 Dialog、狀態安全、測試與文件。

## Human Integration
- 提供 Email／Token、可延長與不可延長案件、可控期限環境。

## AI Acceptance
- 自動驗證原因、期限、允許狀態、按鈕可見性、409 與 Queue invalidation。

## Human Acceptance
- 承辦人真實要求及延長補件，確認 Email、Token、期限與佇列結果。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
