# FS-014 — Reviewer Final Decision

## Slice Information
- ID: `FS-014`
- Name: `reviewer-final-decision`
- Type: `feature`
- Depends On: `FS-012`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓承辦人依類型規則安全核准或最終不核准案件。

## User-Visible Result
承辦人可比較申請與核定資料、在允許範圍調整並確認摘要，或填原因永久拒絕；併發衝突顯示最新狀態。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.3, 12
- `docs/project/application-rules.md`, section 6
- `docs/project/workflows-and-permissions.md`, sections 5.4–5.5, 10
- `docs/project/backend-contract-changes.md`, sections 2 B02–B04, B07

## Included
- 四類核定規則、調整原因、核准摘要、`under_review`／`needs_revision` 最終不核准、409 與狀態更新。

## Excluded
- 零點核准、規則外點數、補件中核准、核准後更正與案件認領。

## AI Responsibility
- 完成核定／拒絕垂直流程、精確點數、狀態／版本安全、測試與文件。

## Human Integration
- 後端完成 B02–B04、B07，提供四類規則及雙承辦併發案件。

## AI Acceptance
- 自動驗證各類調整限制、原因、摘要、狀態白名單、409 與 Cache 更新。

## Human Acceptance
- 承辦人真實完成四類代表性核准、補件中拒絕及雙人併發測試。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
