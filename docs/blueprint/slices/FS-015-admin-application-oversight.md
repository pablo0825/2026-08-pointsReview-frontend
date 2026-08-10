# FS-015 — Admin Application Oversight

## Slice Information
- ID: `FS-015`
- Name: `admin-application-oversight`
- Type: `feature`
- Depends On: `FS-001, FS-012`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓管理員唯讀監督全部申請與學生點數流水帳，但不能參與審核。

## User-Visible Result
管理員可查詢申請、詳情、附件、簽名、歷史與流水帳，畫面不提供承辦人操作。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.4, 10–11
- `docs/project/routes-and-pages.md`, section 9
- `docs/project/workflows-and-permissions.md`, sections 7, 9
- `docs/project/api-integration.md`, sections 9–11

## Included
- 管理導覽、申請列表／唯讀詳情、私有檔案、歷史與流水帳查詢。

## Excluded
- 補件、核准、不核准、統計儀表板、稽核 Log 查詢及點數異動。

## AI Responsibility
- 建立管理員工作區 Layout 與導覽，並完成唯讀監督功能、權限邊界、響應式、測試與文件。

## Human Integration
- 確認管理端 Applications／Transactions 契約並提供跨狀態資料。

## AI Acceptance
- 自動驗證列表詳情、私有檔案、流水帳、角色限制及無審核按鈕。

## Human Acceptance
- 管理員確認真實資料可讀且無任何個案審核入口。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
