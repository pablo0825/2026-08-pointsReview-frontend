# FS-019 — Admin Instruction Management

## Slice Information
- ID: `FS-019`
- Name: `admin-instruction-management`
- Type: `feature`
- Depends On: `FS-001, FS-002`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓管理員以草稿與 Revision 維護、發布及控制年度申請辦法可見性。

## User-Visible Result
管理員可管理年度內容版本、發布、顯示或隱藏，公開頁只呈現已發布且可見版本。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.4, 10
- `docs/project/routes-and-pages.md`, sections 5, 9
- `docs/project/api-integration.md`, sections 5, 9

## Included
- Instructions 列表、草稿、Revision、發布、顯示／隱藏及安全內容預覽。

## Excluded
- 未發布內容公開、一般規則版本與個案審核。

## AI Responsibility
- 在契約確認後完成內容管理、公開頁回歸、安全測試與文件。

## Human Integration
- 確認 Instructions 完整契約並提供多年度與多 Revision 資料。

## AI Acceptance
- 自動驗證草稿／發布／可見性、內容清理、權限與公開頁結果。

## Human Acceptance
- 管理員完成 Revision 與發布／隱藏，確認公開頁立即呈現正確版本。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
