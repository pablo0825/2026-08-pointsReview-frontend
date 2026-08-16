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
讓學生先以多月薪資取得後端點數試算，再完成單人參與計畫申請。

## User-Visible Result
申請人可先填寫計畫與 1～12 個不重複的薪資月份，手動取得唯讀點數試算；符合資格後再補齊單一申請人、老師及附件，預覽並送件。

## Source Reference
- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 3, 7–8
- `docs/project/routes-and-pages.md`, sections 4, 10–11
- `docs/project/api-integration.md`, sections 5–6, 11

## Included
- 「計畫內容與薪資試算」優先的單人五步表單、計畫欄位限制、薪資明細增刪與月份轉換、後端試算及失效處理、動態但隱藏的學年度、單一申請人、老師、附件、預覽與 multipart 送件。

## Excluded
- 合併不同計畫、其他申請類型、補件、草稿與進度查詢。

## AI Responsibility
- 完成垂直功能、學號大寫正規化、安全整數薪資驗證、後端試算整合、API／錯誤、測試與文件；不得在前端重作點數公式或允許修改試算點數。未登入正式送件不得索取 Session 或 CSRF Token，且須以必填 Idempotency Key 與不可變快照防止同一次操作重複建立案件，所有 5xx 皆依結果不確定流程以相同快照手動重新確認。

## Human Integration
- 後端需完成 B10、B13、點數試算、單人正式 multipart 送件、必要薪資附件與 Idempotency 契約，並提供合格、不合格、驗證失敗及成功送件測試資料。

## AI Acceptance
- 自動驗證學號正規化、動態隱藏學年度、1～12 個月份、1～50,000 整數金額、月份選擇轉換、明確試算、`isEligible` 阻擋、異動失效、唯讀點數、單一申請人、必要薪資附件、錯誤定位、Idempotent retry 與送件狀態。

## Human Acceptance
- 使用者以多月薪資完成真實後端試算與送件，確認不合格阻擋、薪資異動後重新試算、單一申請人、必要薪資附件、確認摘要及成功資訊。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
