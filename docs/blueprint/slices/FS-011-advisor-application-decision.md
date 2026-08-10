# FS-011 — Advisor Application Decision

## Slice Information
- ID: `FS-011`
- Name: `advisor-application-decision`
- Type: `feature`
- Depends On: `FS-010`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓老師對目前版本安全地手寫簽名同意或填寫原因拒絕。

## User-Visible Result
老師可在手機或桌面完成簽名 Dialog，或經不可恢復提示拒絕；409 會重新載入最新案件。

## Source Reference
- `docs/project/product-requirements.md`, sections 4.2, 9, 12
- `docs/project/routes-and-pages.md`, sections 7.2–7.3
- `docs/project/workflows-and-permissions.md`, sections 4, 10
- `docs/project/backend-contract-changes.md`, section 2 B09

## Included
- 手寫 PNG、清除／保留筆跡、版本確認、拒絕原因、期限、409 與完成後狀態更新。

## Excluded
- 上傳既有簽名、老師補件、延長簽核期限與非本人案件。

## AI Responsibility
- 完成兩種決策、無障礙 Dialog、版本安全、測試與文件。

## Human Integration
- 後端完成 B09，提供私有簽名、並發及期限測試案件。

## AI Acceptance
- 自動驗證空白禁用、清除、尺寸、拒絕原因、焦點、409 與 Cache 更新。

## Human Acceptance
- 老師以手機手寫真實簽名並另案拒絕，確認後端浮水印與通知結果。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
