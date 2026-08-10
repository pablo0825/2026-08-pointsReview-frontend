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
讓申請人理解四種申請用途並選擇正確入口。

## User-Visible Result
訪客在 `/apply` 看到競賽、參與計畫、證照、展覽四張卡片及人數、最低附件、開始申請與查看辦法入口。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.1, 5
- `docs/project/routes-and-pages.md`, sections 1–3, 11
- `docs/project/application-rules.md`, sections 1, 7

## Included
- `/` 導向、四類型卡片、摘要資訊、申請與辦法連結、公開頁響應式與狀態。

## Excluded
- 各類五步表單、補件、草稿與進度查詢。

## AI Responsibility
- 建立公開頁 Layout、Router 基礎與申請入口骨架，並完成入口頁、必要資料整合、導覽、自動化測試與文件。

## Human Integration
- 提供目前有效的人數與附件規則資料。

## AI Acceptance
- 自動驗證四張卡片內容與連結、資料狀態、鍵盤操作及 360px 版面。

## Human Acceptance
- 使用者確認卡片資訊足以分辨類型並能正確進入四個申請路由。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
