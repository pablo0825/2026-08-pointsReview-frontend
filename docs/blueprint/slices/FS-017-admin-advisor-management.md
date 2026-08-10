# FS-017 — Admin Advisor Management

## Slice Information
- ID: `FS-017`
- Name: `admin-advisor-management`
- Type: `feature`
- Depends On: `FS-001`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓管理員維護指導老師並指派目前主任。

## User-Visible Result
管理員可瀏覽、建立、更新、啟停老師並變更主任；公開選擇仍不揭露主任資訊。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.4, 6
- `docs/project/routes-and-pages.md`, section 9
- `docs/project/api-integration.md`, sections 5, 9

## Included
- Advisors 列表、建立／更新、啟用／停用與主任指派。

## Excluded
- 帳號管理、規則、個案審核及公開端顯示 `isDirector`。

## AI Responsibility
- 在契約確認後完成老師管理、公開選擇回歸測試與文件。

## Human Integration
- 確認 Advisors／主任指派契約並提供可變更資料。

## AI Acceptance
- 自動驗證 CRUD 類操作、主任指派、權限及公開端不揭露主任。

## Human Acceptance
- 管理員真實維護老師與主任，並確認公開老師選擇結果。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
