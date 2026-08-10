# Commit Batch Workflow

依核准 Plan 中的 Commit Plan，逐批建立可獨立檢視的 commits。

## 核心語意

- `committed` 不代表 AI Verification 通過。
- AI Verification 通過不代表 Human Acceptance 通過。
- Commit 可以在 Slice 為 `approved`、`in-progress`、`awaiting-human` 或 `accepted` 時建立；Blueprint Revision Batch 可以在受影響 Slice 為 `proposed` 時建立。
- 不在 Spec 與 Plan 核准前建立 Slice commit；已核准的 Blueprint Revision Batch 是唯一例外。
- 不執行未核准或未列入 Commit Plan 的 batch；Blueprint Revision Batch 以已核准的 Blueprint Revision Proposal 取代 Commit Plan。
- 一次只準備、確認並建立一個 batch。
- 依 Commit Plan 順序執行，不跳過尚未建立的較早 batch。

## Batch 設計

讓每個 batch：

- 只有一個清楚目的。
- 包含明確且有限的檔案。
- 不包含其他 Feature Slice 或無關變更；已核准且本質上涉及多個 Slice 的 Blueprint Revision Batch 除外。
- 能以 Required Verification 提供合理信心。
- 儘可能保持 buildable，並將行為實作與直接相關測試放在同一 batch。
- 使用 Plan 中預先核准的 message；Blueprint Revision Batch 使用 Proposal 中核准的 message。

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

一般 batch 的 scope 使用 Feature Slice ID；多 Slice 的 Blueprint Revision Batch 可以使用 `blueprint`。

## 準備 Batch

完成 batch 對應工作後：

1. 執行該 batch 的 Required Verification。
2. 檢查 `git status` 與相關 diff。
3. 辨識無關修改、未追蹤檔案及既有 staged changes。
4. 確認 diff 符合核准 Scope 與 Commit Plan；Blueprint Revision Batch 則符合已核准 Proposal。
5. 執行適用的 diff 格式檢查。
6. 向使用者列出 Batch ID、message、預計提交檔案、明確排除檔案、diff 摘要及驗證結果。
7. 停止並等待使用者確認。

確認前不得 stage、commit、push 或改變其他 Git 狀態。

## Blueprint Revision Batch

Blueprint Revision Proposal 經使用者明確核准後，可以在 Spec 與 Plan 建立前準備此文件 batch。只包含：

- `docs/blueprint/feature-slice-blueprint.md`。
- 受影響的既有 Slice Brief。
- 核准後建立的新 Slice Brief。
- 本次已明確核准且直接相關的 `docs/project/` 變更。

不得包含 Spec、Plan、Verification、程式碼或測試。若 `docs/project/` 變更已在此 batch 提交，後續 Initial Documentation Batch 不得重複納入。

單一 Slice 使用：

```text
docs(<ID>): revise feature slice structure
```

多個 Slice 使用：

```text
docs(blueprint): revise feature slice structure
```

依一般準備流程列出 message、檔案、排除項目、diff 摘要及文件一致性檢查，停止等待使用者確認。確認後只 stage 核准檔案、建立 commit、不 push，回報 Commit ID 後停止。不得自行開始 Spec、Plan 或實作。

## Initial Documentation Batch

Spec、Plan 與 Commit Plan 核准後，先準備 Initial Documentation Batch，包含使用者已核准且尚未提交的 `docs/project/` 變更（如有）、Slice Brief、approved Spec、approved Plan 與 blueprint `approved` 狀態。

使用：

```text
docs(<ID>): approve <feature> specification
```

即使使用者同時要求開始實作，也先完成此 batch 的列出、確認與 commit。只有該 commit 成功且使用者明確要求繼續後，才開始第一個 implementation batch。

準備 batch 時，另行列出需求文件的修改章節、diff 摘要及其與 Spec、Plan 的對應關係。不得納入未取得需求變更核准的 `docs/project/` 修改。

## Initial Documentation Batch 後的需求修訂

若 Initial Documentation Batch 已提交後，才發現並取得 `docs/project/` 需求變更核准：

1. 停止實作，不修改既有 commit。
2. 依 Skill 的需求文件變更流程更新需求文件、blueprint、Slice Brief、Spec 與 Plan。
3. 依實質變更規則撤銷 Spec 與 Plan 核准，並將 Commit Plan Approval 設為 `pending`。
4. 在既有 commits 之後新增下一個 Documentation Batch，列出 purpose、files、required verification 與 proposed message。
5. 等待 Spec、Plan 與 Commit Plan 重新核准。
6. 依一般 Batch 準備流程列出 diff，等待使用者確認後建立新 commit。
7. 停止；只有使用者明確要求繼續時才恢復 implementation batch。

使用符合修改內容的 message，例如：

```text
docs(<ID>): revise <feature> requirements
```

不得以 amend、rebase、squash、reset 或其他方式將需求修訂併回已建立的 commit。

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
