# Feature Slice Verification Template

建立 `docs/verification/<ID>/<ID>-<name>-verification.md`，使用下列結構。

# <ID> — <Feature Name> Verification

## Document Information

- Feature Slice: `<ID>`
- Change Type: `feature | change | correction`
- Verification Status: `in-progress`
- Created: `<YYYY-MM-DD>`
- Last Updated: `<YYYY-MM-DD>`

Verification Status 使用 `in-progress`、`awaiting-human`、`completed`。

## Change Context

- Revises Feature Slice: `<ID or none>`
- Corrects Feature Slice: `<ID or none>`
- Previous Spec: `<path or none>`
- Authoritative Spec: `<path>`

## Implementation Summary

- <已完成的主要實作>
- <已知限制>
- <未執行項目>

## Changed Files

| File | Change |
|---|---|
| `<path>` | <修改摘要> |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Build | `<command>` | passed | exit code 0 | <notes> |
| Tests | `<command>` | not-run | <reason> | <human follow-up> |
| Lint | `<command>` | not-applicable | N/A | <notes> |

Result 只使用 `passed`、`failed`、`not-run`、`not-applicable`。記錄本次實際執行結果，不引用既有報告作為本次通過證據。

## AI Acceptance Summary

| Criterion | Result | Evidence |
|---|---|---|
| <Spec criterion> | passed | <evidence> |

## Behavior Verification

### New / Changed Behavior

| Criterion | Result | Evidence |
|---|---|---|
| <Target Behavior> | <result> | <evidence> |

### Preserved Behavior Regression

| Criterion | Result | Evidence |
|---|---|---|
| <Preserved Behavior> | <result> | <evidence> |

## Commit Batch Verification

| Batch | Purpose | Required Verification | Result | Planned Message |
|---|---|---|---|---|
| C1 | <purpose> | <checks> | <result> | `<type>(<ID>): <English summary>` |

記錄每個 batch 實際執行的相關驗證摘要。不要在文件中保存目前 commit 自己的 hash；以 Git history 與最終回報作為 Commit ID 的權威來源。

## Human Integration

### Required Work

1. <人工設定步驟；不需要時填寫 `Human Integration: not-applicable`>

### Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- Notes: `pending`

Status 使用 `pending`、`passed`、`failed`、`not-applicable`。

## Human Acceptance Instructions

### Preconditions

- <環境與帳號需求>

### Test Data

- <必要測試資料>

### Browser / Device / Viewport

- <建議驗收環境>

### Steps and Expected Results

| Step | Action | Expected Result |
|---|---|---|
| 1 | <操作> | <預期結果> |

### Known Limitations

- <限制；若沒有填寫 `None`>

## Human Acceptance Result

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- User Feedback: `pending`

Status 使用 `pending`、`passed`、`failed`、`changes-requested`。只有使用者明確提供結果後才能修改。

## Final Summary

- AI Verification: `<summary>`
- Human Integration: `<summary>`
- Human Acceptance: `<summary>`
- Remaining Issues: `<summary or none>`
- Final Feature Slice Status: `<blueprint status>`

## Document Lineage Update

- Slice Brief Link: `<path>`
- Previous Spec Status: `<completed | superseded | not-applicable>`
- Replacement Spec Link Added: `<yes | no | not-applicable>`
- Blueprint Links Updated: `<yes | no>`

## Template Rules

- 將 AI Verification 與 Human Acceptance 分開記錄。
- 不將未執行檢查標示為通過。
- 不由 AI 填寫使用者尚未確認的結果。
- 將 blueprint Status 視為 Feature Slice 狀態的唯一權威來源。
- `change` 必須記錄 Target Behavior 與 Preserved Behavior 的驗證結果。
- `change` Accepted 後確認舊 Spec 已標示 `superseded` 並連到新 Spec。
- `correction` 必須確認 Authoritative Spec 仍然有效且未被標示 `superseded`。
- Commit Batch Verification 只記錄局部檢查，不取代完整 AI Verification。
- Human Acceptance 失敗後以新的 `fix` batch 記錄修正，不改寫既有 commits。
