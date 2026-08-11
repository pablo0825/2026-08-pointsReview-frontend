# FS-003 — Application Entry

## Slice Information
- ID: `FS-003`
- Name: `application-entry`
- Type: `feature`
- Depends On: `none`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓申請人從簡潔且一致的公開導覽選擇正確的申請入口。

## User-Visible Result
訪客可從共用公開導覽前往申請入口或申請辦法，並在 `/apply` 從四個大型連結選擇競賽、參與計畫、證照或展覽申請。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.1, 5
- `docs/project/routes-and-pages.md`, sections 1–3, 11
- `docs/project/application-rules.md`, section 1.1

## Included
- Production 根路徑、`/` 導向、共用公開導覽、四個申請類型連結，以及公開頁響應式與無障礙行為。

## Excluded
- 類型說明、人數與附件摘要、各類五步表單、`/rules` 內容、補件、草稿與進度查詢。

## AI Responsibility
- 保留已建立的公開頁 Layout 與 Router 基礎，完成共用公開導覽、申請入口、路由邊界、自動化測試與文件。

## Human Integration
- `not-applicable`；第一版入口頁不依賴外部資料，production 使用根路徑 `/`。

## AI Acceptance
- 自動驗證共用公開導覽、標題、四個申請連結、鍵盤操作及 360px 版面。

## Human Acceptance
- 使用者確認共用導覽與四個申請入口清楚，並能前往正確路由。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
