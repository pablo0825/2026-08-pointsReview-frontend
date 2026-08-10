# FS-009 — Public Points Search

## Slice Information
- ID: `FS-009`
- Name: `public-points-search`
- Type: `feature`
- Depends On: `none`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓公開訪客在受限條件下查詢遮罩後學生點數。

## User-Visible Result
訪客可用年級＋班級或至少兩字元關鍵字查詢、排序及分頁，並在桌面表格或手機卡片查看四類與總點數。

## Source Reference
- `docs/project/product-requirements.md`, sections 8, 10, 12
- `docs/project/routes-and-pages.md`, sections 2, 6, 10–11
- `docs/project/backend-contract-changes.md`, section 2 B01, B08
- `docs/project/api-integration.md`, section 5.1

## Included
- 查詢門檻、學年度、URL 條件、後端排序／分頁、遮罩結果與頁面狀態。

## Excluded
- 完整個資、附件、審核資料及不符合門檻的資料查詢。

## AI Responsibility
- 完成查詢頁、最終欄位契約、響應式、測試與文件。

## Human Integration
- 後端需完成 B01、B08 並提供遮罩、空白、分頁與歷史年度資料。

## AI Acceptance
- 自動驗證初始不查詢、門檻、URL、排序分頁、`exhibitionPoints` 與響應式內容。

## Human Acceptance
- 使用者以兩種合法條件真實查詢並確認遮罩、分享 URL 與手機版。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
