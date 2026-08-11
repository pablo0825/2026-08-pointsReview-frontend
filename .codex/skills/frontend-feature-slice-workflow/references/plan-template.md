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

- [ ] 更新已核准的 `docs/project/` 需求文件；不需要時填寫 `not-applicable`
- [ ] 確認需求文件、Slice Brief、Spec 與 Plan 一致
- [ ] 更新 Slice Brief 或 blueprint 文件連結
- [ ] 更新 Spec 狀態
- [ ] 更新 Plan 狀態
- [ ] 更新 verification record
- [ ] 更新 blueprint Status、Status Note 與 Last Updated
- [ ] `change` Accepted 後將舊 Spec 設為 `superseded` 並加入 replacement link

## Commit Plan

Draft Documentation Batch 由使用者建立 Spec / Plan 的明確要求授權，建立本文件後直接以 `docs(<ID>): draft <feature> specification` 提交，不受下列尚為 `pending` 的 Commit Plan 限制。

- Commit Plan Approval: `pending`
- Approved By: `pending`
- Approved At: `pending`
- Implementation Execution: `continuous`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存已核准的需求與 Slice 文件 | 已核准的 `docs/project/` 變更（如有）、Slice Brief、Spec、Plan、blueprint | 文件一致性 | `docs(<ID>): approve <feature> specification` |
| I1 | <第一個原子實作目的> | `<specific paths>` | <batch checks> | `<type>(<module>): <English summary>` |
| I2 | <第二個原子實作目的> | `<specific paths>` | <batch checks> | `<type>(<module>): <English summary>` |
| I3 | <第三個原子實作目的；依實際需要增減 implementation rows> | `<specific paths>` | <batch checks> | `<type>(<module>): <English summary>` |
| Verification | 保存完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據 | `docs(<ID>): record <feature> verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint、必要 lineage 文件 | 文件一致性 | `docs(<ID>): record <feature> acceptance` |

Commit Plan Approval 使用 `pending`、`approved`。新 Plan 的 Implementation Execution 固定使用 `continuous`；缺少此欄位的已核准既有 Plan 視為 legacy `per-batch`，不得自動補欄位或套用新執行方式。每個 implementation batch 恰好對應一個 commit，並在 commit body 加入 `Feature-Slice: <ID>`。

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
- 只有使用者已明確核准的 `docs/project/` 變更才能列入 Files、Documentation Updates 與 Commit Plan。
- 不得將實作分析或現有程式碼推論出的行為回寫成產品需求。
- Spec 與 Plan 經使用者明確核准時，自動將 Commit Plan Approval 設為 `approved`，並使用相同的 Approved By 與 Approved At；不得另行詢問 Commit Plan 核准。
- Draft Documentation Batch 在 Spec / Plan 建立後自動 commit，讓使用者能以 Git diff 審查後續修改。
- 第一個已核准 batch 必須是 Approval Documentation Batch；Spec 與 Plan 的核准即授權此 commit，不得另行詢問 commit；建立後停止、回報 Commit ID 並詢問使用者是否開始 implementation。
- 一個 implementation batch 恰好對應一個 commit；不得在 I1 或其他單一 batch 內隱藏多個 commits。
- 依 build / dependency / tooling、test infrastructure、runtime / routing / providers、使用者可見功能、tests 與 documentation 等審查目的拆分；只有拆開會造成中間 commit 無法建置或無法合理運作時才能合併。
- 每個 batch 必須能獨立理解並合理回退，Files 使用具體且有限的路徑，並列出自己的 Required Verification；不得以 `foundation`、`setup` 或同類寬泛目的合併不同工作。
- 測試預設放入緊接對應實作的 `test` batch；若測試是讓實作 commit 可驗證或安全成立的必要部分，允許與實作同一 batch。
- Implementation message 使用 `build`、`chore`、`feat`、`fix`、`test`、`refactor` 或 `docs`，scope 使用英文模組名稱；文件 checkpoint 繼續使用 Feature Slice ID。
- 使用者明確要求開始實作後，依 I1、I2、…、In 順序連續執行所有 implementation batches；每個 batch 完成與驗證後直接 commit，批次之間不停止或詢問。
- 完成最後一個 implementation batch 後不停止詢問，直接執行完整 AI Verification 並建立 Verification Documentation commit。
- Human Acceptance 結果授權 Final 或 Acceptance Feedback Documentation commit。
- 已授權 batch 不再要求第二次 commit 確認。
- 不執行或建立未列入 Commit Plan、尚未核准或隱藏在其他 batch 內的 implementation commit；需要新增或重組 batch 時停止並重新核准 Commit Plan。
- 只改變 batch 分組、順序或 message 時，將 Commit Plan Approval 設回 `pending`；若 Scope 也改變，依 Skill 撤銷完整 Plan 核准。
- 最終 Documentation Batch 必須位於 Human Acceptance 之後。
