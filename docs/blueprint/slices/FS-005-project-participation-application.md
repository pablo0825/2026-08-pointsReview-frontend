# FS-005 — Project Participation Application

## Slice Information
- ID: `FS-005`
- Name: `project-participation-application`
- Type: `feature`
- Depends On: `FS-003`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓學生依薪資與有效規則完成單人參與計畫申請。

## User-Visible Result
申請人可輸入計畫與不重複的薪資月份，查看點數預估，補齊老師及附件後送件。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 3, 7–8
- `docs/project/routes-and-pages.md`, sections 4, 10–11
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 單人五步表單、計畫資料、薪資明細、預估、老師、附件、預覽與 multipart 送件。

## Excluded
- 合併不同計畫、其他申請類型、補件、草稿與進度查詢。

## AI Responsibility
- 完成垂直功能、學號大寫正規化、安全整數薪資與點數計算、API／錯誤、測試與文件；未登入正式送件不得索取 Session 或 CSRF Token，且須以必填 Idempotency Key 與不可變快照防止同一次操作重複建立案件。

## Human Integration
- 後端需完成 B10、B13、點數預估與正式送件契約並提供測試資料。

## AI Acceptance
- 自動驗證學號正規化、月份、整數金額、先加總再換點、未滿千元阻擋、附件、Idempotent retry 與送件狀態。

## Human Acceptance
- 使用者以多月薪資完成真實預估與送件，確認規則提示及成功資訊。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
