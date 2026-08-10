# Commit Batch Workflow

將使用者對目前操作的明確授權視為對應 commit 的授權。完成該操作、確認範圍並通過必要檢查後直接建立 commit，不再要求第二次 commit 確認。

## 授權語意

- 要求建立或同步 blueprint，授權對應的 Blueprint Creation 或 Reconcile commit。
- 核准 Blueprint Revision Proposal，授權 Proposal 中的 Blueprint Revision commit。
- 核准 `docs/project/` 需求變更，授權包含該需求變更的下一個已說明 Documentation Batch。
- 要求為指定 ID 建立 Spec 與 Plan，授權 Draft Documentation commit。
- 明確核准 Spec、Plan 與 Commit Plan，授權 Approval Documentation commit，但不授權開始實作。
- 明確要求開始或繼續下一個 implementation batch，授權該 batch 完成後的 commit。
- 要求執行完整 AI Verification，授權 AI Verification Documentation commit。
- 明確提供 Human Acceptance 結果，授權 Final 或 Acceptance Feedback Documentation commit。

模糊回覆不構成需求、Blueprint、Spec / Plan、implementation 或 Human Acceptance 的工作授權。取得工作授權後，不再另問是否 commit。

## 核心語意

- `committed` 不代表 AI Verification 通過。
- AI Verification 通過不代表 Human Acceptance 通過。
- 一次只執行並提交一個 batch；commit 後停止。
- 下一個 implementation batch 必須由使用者再次明確要求開始或繼續。
- 依核准 Commit Plan 的順序執行，不跳過尚未建立的較早 batch。
- 不建立空 commit，不 push，也不改寫既有 commit history。

## 使用者修改與操作邊界

開始操作前記錄 `git status`、staged file list 與目標檔案狀態。

- 不自動 stage 或提交操作開始前已存在的使用者修改。
- 允許保留無關的 unstaged 或 untracked 變更，但不得納入目前 commit。
- 若已有 staged changes，停止並請使用者先處理，避免自動 commit 混入既有 staged 內容。
- 若 AI 必須修改已有使用者變更的同一檔案且無法安全分離，停止並說明重疊。
- 只有使用者明確要求採納並提交其修改時，才能把指定修改視為目前操作範圍。
- AI commit 後使用者新增的修改保持在 working tree，不因下一次操作自動提交。

## Batch 設計

讓每個 batch：

- 只有一個清楚目的。
- 包含明確且有限的檔案。
- 不包含其他 Feature Slice 或無關變更；已核准且本質上涉及多個 Slice 的 Blueprint batch 除外。
- 能以 Required Verification 提供合理信心。
- 儘可能保持 buildable，並將行為實作與直接相關測試放在同一 batch。
- 使用已授權操作、Blueprint Revision Proposal 或核准 Commit Plan 中的 message。

允許 message type：

```text
docs
chore
feat
test
fix
```

使用格式：

```text
<type>(<scope>): <English summary>
```

一般 batch 的 scope 使用 Feature Slice ID；跨 Slice 的 Blueprint batch 使用 `blueprint`。

## 自動建立 Commit

完成已授權 batch 後：

1. 執行 Required Verification。
2. 檢查 `git status`、實際 diff、未追蹤檔案及 staged 狀態。
3. 確認 diff 符合已授權操作、Proposal 或 Commit Plan。
4. 執行適用的 diff 格式檢查，包括 `git diff --check`。
5. 只 stage 本次操作的明確檔案。
6. 檢查 staged file list、staged diff 與排除項目。
7. 使用已授權 message 建立 commit。
8. 回報 Commit ID、message、檔案、排除項目與驗證結果。
9. 停止，不自行開始下一個操作或 batch。

若檔案、message、Scope、驗證要求或 batch 順序與授權內容不一致，停止並說明差異，不 stage 或 commit。若 stage 後才發現異常，只撤銷本次操作新增的 staging，不改動 working tree 或操作開始前的 Git 狀態，然後停止等待使用者處理。

## 文件 Checkpoints

### Blueprint Creation / Reconcile

建立完整 blueprint 與 Slice Brief 後使用：

```text
docs(blueprint): create feature slice blueprint
```

同步既有 blueprint 且有實際文件差異時使用：

```text
docs(blueprint): reconcile feature slice blueprint
```

沒有差異時不建立空 commit。

### Blueprint Revision

Blueprint Revision Proposal 核准後直接提交核准範圍。單一 Slice 使用：

```text
docs(<ID>): revise feature slice structure
```

多個 Slice 使用：

```text
docs(blueprint): revise feature slice structure
```

只包含主 blueprint、受影響 Slice Brief、新 Slice Brief，以及本次已核准且直接相關的 `docs/project/` 變更。不得包含 Spec、Plan、Verification、程式碼或測試。

### Draft Documentation

建立 draft Spec 與 Plan 的明確要求授權此 checkpoint，不受尚為 `pending` 的 Commit Plan 限制。使用：

```text
docs(<ID>): draft <feature> specification
```

包含 draft Spec、draft Plan、Slice Brief 必要更新，以及 blueprint `awaiting-approval` 狀態。

### Approval Documentation

使用者明確核准 Spec、Plan 與 Commit Plan 後使用：

```text
docs(<ID>): approve <feature> specification
```

包含 approved Spec、approved Plan、Slice Brief、blueprint `approved` 狀態，以及尚未提交且已核准的 `docs/project/` 變更。commit 後停止；只有使用者再次要求繼續時才開始第一個 implementation batch。

### Specification Revision

使用者明確授權 AI 套用審查結果或採納其文件修改後使用：

```text
docs(<ID>): revise <feature> specification
```

不得自動納入未被要求採納的使用者修改。實質變更必須撤銷既有核准並回到 `awaiting-approval`。

### Implementation

每個 implementation batch 只在使用者明確要求開始或繼續後執行。完成 Required Verification 後，使用 Commit Plan 中的 message 直接 commit；若 required check 未達到 Plan 要求，停止且不 commit。

### AI Verification Documentation

完整 AI Verification 完成並記錄實際證據後使用：

```text
docs(<ID>): record <feature> verification
```

包含 Verification、Plan 驗證結果及 blueprint 狀態。只有沒有未解決的 `failed` 時才能設為 `awaiting-human`；否則維持 `in-progress` 或依 Scope 回到 `awaiting-approval`。`failed`、`not-run` 或 `not-applicable` 可以如實提交，但不得誤標為 `passed`。

### Human Acceptance Documentation

Human Acceptance 通過後使用：

```text
docs(<ID>): record <feature> acceptance
```

包含 completed Spec / Plan、Verification、blueprint `accepted` 狀態，以及 `change` Slice 的舊 Spec lineage。

Human Acceptance 為 `failed` 或 `changes-requested` 時，先如實更新 Verification、Plan 與 blueprint，再使用：

```text
docs(<ID>): record <feature> acceptance feedback
```

commit 後停止；只有使用者明確要求修正時才開始 fix batch。

## Commit Plan 變更

若只需修改 batch 分組、順序、檔案歸屬、Required Verification 或 message：

1. 更新 Plan 的 Commit Plan。
2. 將 Commit Plan Approval 設為 `pending`。
3. 說明差異並等待使用者重新核准 Commit Plan。
4. 不執行或提交受影響 batch。

若變更同時影響實作 Scope、主要方式、核心檔案或 Acceptance，依 Skill 撤銷 Spec / Plan 核准並回到 `awaiting-approval`。

若已提交的實作需要修正，建立新的 `fix` batch。不得自行 amend、rebase、squash、reset、cherry-pick、force push 或以其他方式改寫歷史。

Git history 是 Commit IDs 的權威來源；不要讓文件記錄其自身尚未產生的 commit hash。
