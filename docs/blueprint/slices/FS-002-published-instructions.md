# FS-002 — Published Instructions

## Slice Information
- ID: `FS-002`
- Name: `published-instructions`
- Type: `feature`
- Depends On: `none`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓公開訪客依申請類型與學年度閱讀後端已發布且可見的申請辦法。

## User-Visible Result
訪客可在 `/rules` 以四個大型按鈕選擇申請類型、切換學年度，閱讀由一個或多個 section 組成且具目錄與錨點的安全 Markdown，並看見空白、歷史年度與失敗狀態。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.1, 10
- `docs/project/routes-and-pages.md`, sections 2, 5, 10–11
- `docs/project/api-integration.md`, sections 5, 11

## Included
- 固定文案的四個申請類型大型按鈕、學年度選擇、安全 Markdown sections、目錄、頁內錨點、載入／空白／錯誤與響應式狀態。

## Excluded
- 申請辦法的管理、草稿、發布與顯示設定。

## AI Responsibility
- 完成公開頁面、API 整合、內容清理、可及性、測試與文件。

## Human Integration
- 依申請類型提供含目前、歷史學年度、多 section 及已超過 `effectiveTo` 但仍由公開 API 回傳的測試內容。

## AI Acceptance
- 自動驗證只呈現公開 API 對所選申請類型與學年度回傳的內容、保留後端 `displayOrder` 排序、`HTTP 200 OK` 空陣列呈現無內容狀態、API 已回傳且超過 `effectiveTo` 的內容不被前端排除、危險 HTML 被移除，且年度與頁面狀態正確。

## Human Acceptance
- 使用者實際閱讀長篇內容並確認桌面與 360px 導覽、目錄及連結體驗。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
