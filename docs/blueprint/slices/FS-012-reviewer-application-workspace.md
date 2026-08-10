# FS-012 — Reviewer Application Workspace

## Slice Information
- ID: `FS-012`
- Name: `reviewer-application-workspace`
- Type: `feature`
- Depends On: `FS-001, FS-011`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓承辦人從共用案件池找到並檢視待審、補件中與歷史案件。

## User-Visible Result
承辦人可在兩個獨立頁籤篩選分頁，查看詳情、規則、附件、簽名、版本與時間軸。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.3, 10, 12
- `docs/project/routes-and-pages.md`, sections 8.1–8.2
- `docs/project/workflows-and-permissions.md`, sections 5.1, 7, 9–10
- `docs/project/backend-contract-changes.md`, section 2 B06

## Included
- `under_review`／`needs_revision` 佇列、獨立 URL 狀態、歷史與詳情、私有檔案及響應式。

## Excluded
- 案件認領／分流、補件動作、核准與不核准。

## AI Responsibility
- 建立承辦人工作區 Layout 與導覽，並完成契約／檔案／狀態、響應式、測試與文件。

## Human Integration
- 後端完成 B06，提供多狀態、多版本、分頁與私有檔案資料。

## AI Acceptance
- 自動驗證兩種 status Query、獨立狀態、詳情版面、權限與常見錯誤。

## Human Acceptance
- 承辦人確認真實佇列總數、篩選分頁、詳情與桌面／手機操作。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
