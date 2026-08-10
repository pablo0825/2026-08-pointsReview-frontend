# Feature Slice Plan Template

建立 `docs/plans/<ID>/<ID>-<name>-plan.md`，使用下列結構。

# <ID> — <Feature Name> Plan

## Document Information

- Feature Slice: `<ID>`
- Change Type: `feature | change | correction`
- Document Status: `draft`
- Based On Spec: `docs/specs/<ID>/<ID>-<name>-spec.md`
- Spec Last Updated: `<YYYY-MM-DD>`
- Created: `<YYYY-MM-DD>`
- Last Updated: `<YYYY-MM-DD>`

## Goal

以中文摘要如何完成已定義 Spec，不增加新產品需求。

## Change Context

- Revises Feature Slice: `<ID or none>`
- Corrects Feature Slice: `<ID or none>`
- Previous Spec: `<path or none>`
- Authoritative Spec: `<path>`

## Scope

### Included

- <本次實作範圍>

### Excluded

- <本次不處理的工作>

## Current Implementation Assessment

### Existing Behavior

- <現有程式碼目前提供的行為>

### Reusable Components

- `<path>`：<可重用內容>

### Integration Points

- `<path or interface>`：<整合方式>

### Gaps Against Spec

- <現有實作與 Spec 的落差>

### Preserved Behavior

- <修改後仍必須維持的既有行為>

### Regression Risks

- <可能受影響的舊功能與 Acceptance>

### Compatibility / Migration

- <相容性、資料或使用流程遷移；不需要時填寫 `not-applicable`>

### Constraints

- <架構、相容性、依賴或環境限制>

### Unknowns

- <無法從程式碼或文件確認的問題；若沒有填寫 `None`>

## Files

### Create

- `<path>`：<用途>

### Modify

- `<path>`：<修改原因>

### Tests

- `<path>`：<測試範圍>

不要列入目前沒有明確必要的檔案。

## Implementation Steps

1. <具體實作步驟>
2. <整合與錯誤處理>
3. <測試與文件更新>

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| <risk> | <impact> | <mitigation> |

若沒有，填寫 `None`。

## AI Implementation Tasks

- [ ] <實作工作>
- [ ] <測試工作>
- [ ] <必要文件更新>

## AI Verification

- [ ] 執行 `<build command>`
- [ ] 執行 `<test command>`
- [ ] 執行 `<lint command>`
- [ ] 執行 `<typecheck command>`
- [ ] 執行 <browser or accessibility method>
- [ ] 驗證 Target Behavior
- [ ] 回歸驗證 Preserved Behavior

刪除不適用項目或明確標示 `not-applicable`，不要臆測不存在的指令。

## Human Integration

- [ ] <外部環境或第三方服務設定；不需要時填寫 `not-applicable`>

只有使用者明確確認後才能勾選。

## Human Acceptance

- [ ] <使用者驗收步驟或結果>

只有使用者明確確認後才能勾選。

## Documentation Updates

- [ ] 更新 Slice Brief 或 blueprint 文件連結
- [ ] 更新 Spec 狀態
- [ ] 更新 Plan 狀態
- [ ] 更新 verification record
- [ ] 更新 blueprint Status、Status Note 與 Last Updated
- [ ] `change` Accepted 後將舊 Spec 設為 `superseded` 並加入 replacement link

## Commit Plan

- Commit Plan Approval: `pending`
- Approved By: `pending`
- Approved At: `pending`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| C1 | 保存已核准的 Slice 文件 | Slice Brief、Spec、Plan、blueprint | 文件一致性 | `docs(<ID>): approve <feature> specification` |
| C2 | <第一個可獨立檢視的實作目的> | `<paths>` | <checks> | `<type>(<ID>): <English summary>` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage 文件 | 文件一致性 | `docs(<ID>): record <feature> acceptance` |

Commit Plan Approval 使用 `pending`、`approved`。每個 batch 只涵蓋一個清楚目的，並保持可獨立檢視。將相關測試與實作放在同一 batch，或確保每個中間 commit 仍具合理可驗證性。

## Approval

- Approved By: `pending`
- Approved At: `pending`
- Approval Note: `pending`

## Template Rules

- 根據 Spec 產生 Plan。
- 先分析現有程式碼，再決定 Files 與 Implementation Steps。
- 不修改或覆蓋 Spec 需求。
- Spec 實質變更時同步更新 Plan。
- 只列出實際預期執行的工作。
- 核准後不自行增加 Scope。
- `change` 必須規劃 Target Behavior 與 Preserved Behavior 的驗證。
- `correction` 必須以 Authoritative Spec 為依據，不改寫原需求。
- Spec 與 Plan 核准時一併核准 Commit Plan。
- 第一個 batch 必須是 Initial Documentation Batch；完成並經使用者確認 commit 後，才進入 implementation batches。
- 不執行未列入 Commit Plan 或尚未核准的 batch。
- 只改變 batch 分組、順序或 message 時，將 Commit Plan Approval 設回 `pending`；若 Scope 也改變，依 Skill 撤銷完整 Plan 核准。
- 最終 Documentation Batch 必須位於 Human Acceptance 之後。
