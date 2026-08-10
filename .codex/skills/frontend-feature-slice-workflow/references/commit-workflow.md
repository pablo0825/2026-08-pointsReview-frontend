# Commit Batch Workflow

依核准 Plan 中的 Commit Plan，逐批建立可獨立檢視的 commits。

## 核心語意

- `committed` 不代表 AI Verification 通過。
- AI Verification 通過不代表 Human Acceptance 通過。
- Commit 可以在 Slice 為 `approved`、`in-progress`、`awaiting-human` 或 `accepted` 時建立。
- 不在 Spec 與 Plan 核准前建立 Slice commit。
- 不執行未核准或未列入 Commit Plan 的 batch。
- 一次只準備、確認並建立一個 batch。
- 依 Commit Plan 順序執行，不跳過尚未建立的較早 batch。

## Batch 設計

讓每個 batch：

- 只有一個清楚目的。
- 包含明確且有限的檔案。
- 不包含其他 Feature Slice 或無關變更。
- 能以 Required Verification 提供合理信心。
- 儘可能保持 buildable，並將行為實作與直接相關測試放在同一 batch。
- 使用 Plan 中預先核准的 message。

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
<type>(<Feature Slice ID>): <English summary>
```

## 準備 Batch

完成 batch 對應工作後：

1. 執行該 batch 的 Required Verification。
2. 檢查 `git status` 與相關 diff。
3. 辨識無關修改、未追蹤檔案及既有 staged changes。
4. 確認 diff 符合核准 Scope 與 Commit Plan。
5. 執行適用的 diff 格式檢查。
6. 向使用者列出 Batch ID、message、預計提交檔案、明確排除檔案、diff 摘要及驗證結果。
7. 停止並等待使用者確認。

確認前不得 stage、commit、push 或改變其他 Git 狀態。

## Initial Documentation Batch

Spec、Plan 與 Commit Plan 核准後，先準備 Initial Documentation Batch，包含 Slice Brief、approved Spec、approved Plan 與 blueprint `approved` 狀態。

使用：

```text
docs(<ID>): approve <feature> specification
```

即使使用者同時要求開始實作，也先完成此 batch 的列出、確認與 commit。只有該 commit 成功且使用者明確要求繼續後，才開始第一個 implementation batch。

## 建立 Batch Commit

使用者明確確認後：

1. 只 stage 該 batch 核准的明確檔案。
2. 檢查 staged diff 與 staged file list。
3. 若包含無關或無法安全分離的修改，停止並回報。
4. 使用核准 message 建立 commit。
5. 回報 Commit ID、message、檔案及驗證結果。
6. 不 push。
7. 停止；只有使用者明確要求繼續時才開始下一個 batch。

不要自行執行 amend、rebase、squash、reset、cherry-pick、force push 或其他歷史改寫。

## Batch 變更

若只需修改 batch 分組、順序、檔案歸屬或 message：

1. 更新 Plan 的 Commit Plan。
2. 將 Commit Plan Approval 設為 `pending`。
3. 說明差異並等待使用者重新核准 Commit Plan。
4. 不必撤銷 Spec 核准。

若變更同時影響實作 Scope、主要方式、核心檔案或 Acceptance，依 Skill 撤銷 Spec / Plan 核准並回到 `awaiting-approval`。

## 驗證與驗收

- 每個 batch 執行局部 Required Verification。
- 所有 implementation batches 完成後，仍執行完整 AI Verification。
- 完整 AI Verification 完成後才進入 `awaiting-human`。
- 只有使用者能完成 Human Acceptance。
- Human Acceptance 失敗時，以新的 `fix` batch 修正；不得改寫已提交歷史。

## Final Documentation Batch

Human Acceptance 通過後：

1. 更新 Verification、Plan checkbox、Spec / Plan Document Status 及 blueprint `accepted` 狀態。
2. 對 `change` Slice 更新被取代舊 Spec 的 lineage。
3. 依一般 Batch 準備流程列出最終文件 diff。
4. 等待使用者確認後建立 `docs(<ID>): record <feature> acceptance` commit。
5. 最終回報該 Slice 的全部 Commit IDs 與 messages。

Git history 是 Commit IDs 的權威來源；不要讓文件記錄其自身尚未產生的 commit hash。
