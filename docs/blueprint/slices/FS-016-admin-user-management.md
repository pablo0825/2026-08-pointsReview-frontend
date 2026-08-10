# FS-016 — Admin User Management

## Slice Information
- ID: `FS-016`
- Name: `admin-user-management`
- Type: `feature`
- Depends On: `FS-001`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓管理員維護後台使用者帳號與管理員責任移交。

## User-Visible Result
管理員可瀏覽、建立、更新、啟停帳號，寄啟用信、重設密碼並執行管理員移交。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.4, 10
- `docs/project/routes-and-pages.md`, section 9
- `docs/project/api-integration.md`, section 9

## Included
- Users 列表／詳情、建立／更新、啟用／停用、啟用信、重設密碼、管理員移交。

## Excluded
- 老師資料、主任指派、規則、申請辦法與個案審核。

## AI Responsibility
- 在契約確認後完成帳號管理、權限、錯誤、測試與文件。

## Human Integration
- 確認 Users 完整 API／權限契約並提供 Email 與角色測試環境。

## AI Acceptance
- 自動驗證各操作、危險確認、權限、列表狀態與 Cache 更新。

## Human Acceptance
- 管理員真實完成帳號生命週期、Email 與移交流程。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
