# FS-010 — Advisor Application Workspace

## Slice Information
- ID: `FS-010`
- Name: `advisor-application-workspace`
- Type: `feature`
- Depends On: `FS-001, FS-004, FS-005, FS-006, FS-007`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓老師找到並檢視自己負責的待簽與歷史申請。

## User-Visible Result
老師可從深連結或列表查看四類案件詳情、附件、版本、期限與時間軸；舊版本唯讀。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.2, 10, 12
- `docs/project/routes-and-pages.md`, section 7
- `docs/project/workflows-and-permissions.md`, sections 4, 7–10
- `docs/project/api-integration.md`, sections 7, 10–11

## Included
- 待簽／歷史列表與詳情、排序與到期提示、私有附件、版本與常見頁面狀態。

## Excluded
- 簽名同意、拒絕及非本人案件。

## AI Responsibility
- 建立老師工作區 Layout 與導覽，並完成權限／檔案整合、響應式、測試與文件。

## Human Integration
- 提供老師帳號與四類、不同期限／版本／狀態案件及私有檔案。

## AI Acceptance
- 自動驗證資料所有權 UI、排序、到期提示、版本操作可見性與錯誤狀態。

## Human Acceptance
- 老師以桌面與手機確認深連結、列表、詳情、附件及歷史閱讀流程。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
