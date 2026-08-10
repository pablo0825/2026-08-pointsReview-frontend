# Feature Slice Blueprint Template

建立 `docs/blueprint/feature-slice-blueprint.md`，使用下列結構。不要在檔名加入版本；將格式版本保存在文件內。

# Feature Slice Blueprint

## Document Information

- Schema Version: `1`
- Document Status: `active`
- Requirements Root: `docs/project/`
- Last Reconciled: `<YYYY-MM-DD>`
- Active Feature Slice: `<ID or none>`

## Purpose

以簡明中文說明 blueprint 的目的、需求來源及使用方式。

## Requirement Sources

| Source | Relevant Sections | Notes |
|---|---|---|
| `docs/project/<file>` | <section> | <notes> |

## Open Questions

列出影響多個 Feature Slice 或整體規劃的未決問題；若沒有，填寫 `None`。

## Feature Slice Index

| ID | Name | Type | Depends On | Revises | Corrects | Status | Status Note | Last Updated |
|---|---|---|---|---|---|---|---|---|
| FS-001 | `<english-name>` | feature | none | none | none | proposed | <note> | YYYY-MM-DD |

Type 只使用 `feature`、`change`、`correction`。Status 只使用 Skill 定義的狀態值。主 blueprint 是目前 Status 與 Status Note 的唯一權威來源。

## Documents

| ID | Slice Brief | Spec | Plan | Verification |
|---|---|---|---|---|
| FS-001 | `docs/blueprint/slices/FS-001-<name>.md` | pending | pending | pending |

文件存在後，以實際路徑取代 `pending`。

## Template Rules

- 只在主 blueprint 保存目前 Status 與 Status Note。
- 不在 Slice Brief、Spec、Plan 或 Verification 鏡像權威狀態。
- 使用 Git history 保存 blueprint 內容歷史，不在主檔累積完整 Status History。
- 使用需求文件建立 Slice，不從程式碼推論需求。
- 每個 Source Reference 必須指向實際需求文件。
- 不將無法追溯的內容當成已確認需求。
- 不因 reconcile 重新編號、覆寫或刪除既有 Slice。
- 只在 Blueprint Revision Proposal 經使用者明確核准後調整 `proposed` Slice 的結構。
- 使用 `withdrawn` 保留因拆分、合併或規劃調整而停止使用的 Slice；不得刪除、重新使用或重新啟用其 ID。
- 結構調整時更新 Slice Index、Depends On、Status、Status Note、Last Updated、Documents 與 Last Reconciled。
- 在 Status Note 簡短記錄替代 Slice；詳細 Blueprint Revision lineage 保存在相關 Slice Brief，不增加主索引欄位。
- 已 `accepted` 需求改變時建立新 ID 的 `change` Slice，並以 `Revises` 連結。
- 實作違反有效 Spec 時建立新 ID 的 `correction` Slice，並以 `Corrects` 連結。
- 將需求移除、衝突或無法判定的情況交由使用者確認。
