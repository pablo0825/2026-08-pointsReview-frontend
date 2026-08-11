# FS-018 — Admin Rule Management

## Slice Information
- ID: `FS-018`
- Name: `admin-rule-management`
- Type: `feature`
- Depends On: `FS-001`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓管理員以版本方式維護四類點數規則。

## User-Visible Result
管理員可查看點數規則、建立新版本及提前停用，既有申請仍使用首次送件時的點數規則。

## Source Reference
- `docs/project/product-requirements.md`, section 4.4
- `docs/project/application-rules.md`, sections 2–5, 8
- `docs/project/routes-and-pages.md`, section 9
- `docs/project/api-integration.md`, section 9

## Included
- 點數規則列表、新版本、提前停用與有效期間呈現。

## Excluded
- 參與人數規則管理、覆寫歷史版本、規則外點數、個案核准與申請辦法內容。

## AI Responsibility
- 在契約確認後完成規則管理、版本安全、測試與文件。

## Human Integration
- 確認 Points Rules 完整契約及版本衝突規則，提供歷史與未來點數規則資料。

## AI Acceptance
- 自動驗證版本建立、提前停用、各類欄位、權限與錯誤狀態。

## Human Acceptance
- 管理員建立與停用測試點數規則，確認公開選項與既有申請點數規則不被改寫。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
