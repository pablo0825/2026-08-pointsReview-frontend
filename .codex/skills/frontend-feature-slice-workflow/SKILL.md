---
name: frontend-feature-slice-workflow
description: Analyze frontend requirement documents to create, review, revise, or reconcile an implementation blueprint, then execute one Feature Slice at a time through Spec and Plan creation, explicit work authorization, AI implementation and verification, automatically committed scoped Git checkpoints, human integration and acceptance, and final documentation updates. Use when Codex needs to structure or revise Feature Slices, or plan, implement, verify, accept, or commit frontend work identified by Feature Slice IDs.
---

# Frontend Feature Slice Workflow

使用需求文件建立 Feature Slice blueprint，並以明確的核准關卡逐一完成前端功能。

## 核心原則

- 使用中文撰寫專案文件。
- 使用英文命名檔案、路徑、程式名稱、API、指令、ID、slug 與狀態值。
- 以通俗、可審查的方式撰寫文件。
- 將 `docs/blueprint/feature-slice-blueprint.md` 視為 Feature Slice 狀態的唯一權威來源。
- 一次只處理一個 Feature Slice；使用者明確核准且本質上涉及多個 Slice 的 Blueprint Revision 除外。
- 只從需求文件定義產品需求，不從現有程式碼推論產品需求。
- 將 `docs/project/` 視為產品需求來源；Spec 討論結果不代表已授權修改需求文件。
- 修改 `docs/project/` 前，先提出明確變更並取得使用者核准；修改後保持需求文件、blueprint、Slice Brief、Spec 與 Plan 一致。
- 只在 Plan 階段分析現有程式碼，以決定實作方式。
- 同時產生 Spec 與 Plan，但先完成 Spec，再根據 Spec 產生 Plan。
- 在使用者明確核准 Spec 與 Plan 前，不得修改實作程式碼。
- 將 AI Verification 與 Human Acceptance 分開。
- 不得將未實際執行的檢查標示為通過。
- 只有使用者能確認 Human Integration 與 Human Acceptance。
- 將 committed、AI verified 與 human accepted 視為三種不同事實；commit 不代表驗證或驗收通過。
- 將使用者對操作、Proposal、Spec / Plan、下一個 implementation batch 或 Human Acceptance 結果的明確授權視為對應 commit 的授權；Spec 與 Plan 的核准同時涵蓋其內含 Commit Plan 與 Approval Documentation commit，不另行詢問；完成核准工作並通過必要檢查後直接 commit。
- 每個自動 commit 後停止；下一個 implementation batch 仍須由使用者明確要求開始或繼續。
- 完成目前操作後停止，不自行開始下一個 Feature Slice。
- 保留與目前 Feature Slice 無關的既有變更。
- 不 push Git commit。

## 讀取適用指示

開始任何操作前：

1. 確認專案根目錄。
2. 讀取適用範圍內的 `AGENTS.md` 與其他專案指示。
3. 確認需求文件目錄 `docs/project/` 是否存在。
4. 確認 blueprint 是否存在。
5. 檢查目前是否有其他正在處理的 Feature Slice。
6. 記錄操作前的 working tree 與 staged 狀態，辨識與目前工作無關的既有變更及使用者已修改的目標檔案。

若 `docs/project/` 不存在或無法辨識需求文件，停止並詢問使用者需求文件的位置。

不得覆寫、還原或提交與目前 Feature Slice 無關的使用者變更。不得自動提交操作開始前已存在的使用者修改；若目標檔案已有修改且無法安全分離，停止。只有使用者明確要求採納並提交其修改時，才能將該修改納入目前已授權操作。

## 支援的操作

依使用者要求執行下列其中一種操作：

1. 建立或同步 blueprint。
2. 審查並修改 Blueprint Feature Slice 結構。
3. 提案並套用需求文件變更。
4. 為指定 Feature Slice 建立 Spec 與 Plan。
5. 核准指定 Feature Slice 的 Spec 與 Plan。
6. 實作並執行 AI Verification。
7. 記錄 Human Integration 或 Human Acceptance。
8. 更新已變更的 Spec 與 Plan。
9. 執行並自動提交下一個已授權的 Commit Batch。

不要因為完成某一操作而自行進入下一操作。

## Feature Slice ID 與路徑

使用 `FS-001`、`FS-002`、`FS-003` 格式。保持既有 ID 穩定，不得因重新排序、重新產生 blueprint 或需求文件變更而重複使用或任意變更既有 ID。

使用英文 kebab-case 作為功能名稱 slug。建立文件：

```text
docs/blueprint/feature-slice-blueprint.md
docs/blueprint/slices/<ID>-<name>.md
docs/specs/<ID>/<ID>-<name>-spec.md
docs/plans/<ID>/<ID>-<name>-plan.md
docs/verification/<ID>/<ID>-<name>-verification.md
```

每個 Feature Slice ID 使用獨立的 Spec、Plan 與 Verification 資料夾。不得在已 `accepted` Slice 的資料夾內建立 `v2`、`final`、`new` 等新版文件，也不得覆寫其原始 Spec。

## Feature Slice 類型與演進關係

只使用：

- `feature`：新增使用者可見功能。
- `change`：修改已 `accepted` 功能的需求或使用者行為。
- `correction`：修正不符合既有有效 Spec 的實作，需求本身不變。

分開使用關係欄位：

- `Depends On`：實作順序或能力依賴。
- `Revises`：`change` Slice 修改或取代的已接受 Slice。
- `Corrects`：`correction` Slice 要修正的已接受 Slice。

不要使用 `Depends On` 代替 `Revises` 或 `Corrects`。

若 Slice 尚未 `accepted`，直接同步修改原 Spec 與 Plan，撤銷核准並重新審查。若 Slice 已 `accepted` 且需求或 Acceptance 改變，建立全新 ID、`change` Slice 與獨立文件資料夾。若實作違反既有 Spec，建立全新 ID 的 `correction` Slice，但保持原 Spec 有效。純錯字或不影響含義的文件修正不建立新 ID。

## Feature Slice 狀態

只使用：`proposed`、`awaiting-approval`、`approved`、`in-progress`、`awaiting-human`、`accepted`、`blocked`、`withdrawn`。

使用主要流程：

```text
proposed -> awaiting-approval -> approved -> in-progress -> awaiting-human -> accepted
```

使用 `blocked` 表示存在明確阻礙。於 `Status Note` 記錄阻礙原因、阻礙前狀態及恢復條件；解除阻礙時回到適當狀態。

使用 `withdrawn` 表示尚未實作的 Slice 因拆分、合併或規劃調整而停止使用。`withdrawn` 是終止狀態；不得刪除、重新使用或重新啟用該 ID。

將 `awaiting-approval`、`approved`、`in-progress`、`awaiting-human` 視為 active status。同一時間最多只能有一個 Feature Slice 處於 active status。`proposed`、`accepted`、`blocked`、`withdrawn` 不視為 active status。

## Blueprint Mode

執行 Blueprint Mode 時，完整讀取 [blueprint-template.md](references/blueprint-template.md) 與 [slice-brief-template.md](references/slice-brief-template.md)。

讓主 blueprint 只保存全域資料、Slice 索引、演進關係、目前狀態與文件連結。將每個 Slice 的 Goal、Scope、Source Reference、Responsibilities 與 Acceptance 保存於獨立 Slice Brief。不要在 Slice Brief 保存或鏡像目前 Status。

### 需求來源

只從以下來源辨識產品需求：

- `docs/project/` 內的需求文件。
- 使用者明確提供或確認的需求。
- 既有 blueprint 中仍可追溯到需求文件的內容。

將 `AGENTS.md`、開發規範及架構規範視為實作限制，不視為產品需求來源。

不得從現有元件、頁面、route、API client、tests、TODO、dead code、feature flag 或未被需求文件支持的現有行為推論需求。不得用現有程式碼新增、刪除或改寫 Feature Slice。

### 需求文件變更核准

若 Blueprint 或 Spec 討論顯示需要新增、修改或刪除 `docs/project/` 的產品需求，不得將討論內容直接視為修改授權。先向使用者列出：

- 修改原因。
- 受影響的需求文件與章節。
- 預計新增、修改或刪除的需求內容。
- 受影響的 Feature Slice。
- 對 Scope、Acceptance、依賴與既有行為的影響。
- 對應 Documentation Batch 的範圍與 proposed message。

停止並等待使用者明確核准。不得將「看起來可以」、「應該是這樣」、「先這樣」等模糊回覆視為核准。

取得核准後：

1. 只修改已核准的需求文件、章節與內容。
2. 重新執行 blueprint reconcile。
3. 更新受影響的 Source Reference 與 Slice Brief。
4. 同步更新目前 Slice 的 Spec 與 Plan；若尚未建立則於後續建立時使用更新後的需求來源。
5. 檢查需求文件、blueprint、Slice Brief、Spec 與 Plan 是否一致。
6. 依 [commit-workflow.md](references/commit-workflow.md) 直接建立對應 Documentation Batch commit。
7. 回報修改、一致性檢查與 Commit ID，然後停止，不自行進入實作。

依受影響 Slice 的狀態處理：

- 尚未 `accepted`：保留原 ID 並更新已存在的 Slice Brief、Spec 與 Plan。若內容構成實質變更且 Spec、Plan 已存在，撤銷既有核准，將文件設為 `draft`，並將 blueprint 設為 `awaiting-approval`；尚未建立 Spec、Plan 時維持 `proposed`。
- 已 `accepted`：保留舊 Slice 與舊 Spec，建立新 ID 的 `change` Slice，以 `Revises` 指向原 Slice，並使用獨立文件資料夾。
- 純錯字或不影響含義的修正：不建立新 ID，也不撤銷核准，但仍修正失效的 Source Reference。

若變更影響多個 Slice，先列出所有受影響 ID 並取得整體變更核准。Blueprint reconcile 可以記錄整體影響，但處理目前 Slice 時不得自行修改其他 Slice 的 Spec 或 Plan；依各 Slice 狀態逐一處理需要實質更新的文件。若同一需求文件 diff 無法安全歸屬單一 Slice，停止並請使用者決定拆分方式或 commit 歸屬，不得直接納入目前 Slice 的 batch。

### 建立 blueprint

若 blueprint 不存在：

1. 讀取需求文件並整理需求來源。
2. 將需求拆成可逐一實作、整合及驗收的 Feature Slice，並判斷 Type。
3. 建立 Depends On、Revises 與 Corrects 關係。
4. 將所有新 Slice 設為 `proposed`。
5. 建立主 blueprint 與每個 Slice Brief。
6. 檢查文件一致性，直接建立 `docs(blueprint): create feature slice blueprint` commit。
7. 回報 Commit ID、文件與 Open Questions，然後停止。

### 同步 blueprint

若 blueprint 已存在，執行 reconcile：

1. 比對需求文件與既有 Feature Slice。
2. 保留既有 ID、狀態、Status Note、文件與演進關係。
3. 修正失效或不完整的 Source Reference。
4. 為全新需求建立 `feature` Slice。
5. 為改變已 `accepted` 行為的需求建立新 ID 的 `change` Slice，使用 `Revises` 指向舊 Slice。
6. 不覆寫已 `accepted` Slice 的舊 Slice Brief 或 Spec。
7. 將移除或無法判定的需求列為待確認問題。
8. 不自行刪除既有 Slice 或標示為 `accepted`。
9. 若有已授權且可安全提交的文件差異，直接建立 `docs(blueprint): reconcile feature slice blueprint` commit。
10. 回報差異與 Commit ID；沒有實際差異時不建立空 commit。完成後停止。

若需求變更影響已核准或已驗收的 Slice，記錄差異並詢問使用者，不自行重設狀態。

### Feature Slice 拆分原則

讓每個 Feature Slice：

- 對應一個明確的使用者目標。
- 產生可觀察、可驗收的 User-Visible Result。
- 能獨立完成或具有清楚依賴。
- 包含完成該結果所需的前端各層工作。
- 足夠小，能在一次實作週期內完成與驗收。

不要依技術層拆分 Feature Slice。建立元件、API client、type、store、tests、重構、lint、build 或樣式架構等技術工作原則上不單獨成為 Slice；將其放入相關 Slice 的 AI Responsibility 或 Plan。

若需求缺少必要資訊、彼此矛盾或無法形成可驗收結果，不自行補充需求；記錄 Open Questions，將受影響 Slice 保留為 `proposed` 或設為 `blocked`，並等待使用者釐清。

### Blueprint Slice Revision

只對 `proposed` Slice 直接執行結構調整。若使用者對 Slice 的邊界、Goal、Acceptance、依賴、拆分或合併有疑慮，先讀取主 blueprint、相關 Slice Brief 與 Source Reference，討論時不得修改文件。

提出 Blueprint Revision Proposal，至少列出：

- 修改原因。
- 修改前後的 Slice 結構。
- Goal、Included / Excluded、Acceptance 與 Depends On 的差異。
- 保留、新增及停止使用的 ID。
- 要修改或建立的 blueprint 與 Slice Brief 文件。
- 是否改變產品需求及是否需要修改 `docs/project/`。
- Blueprint Revision Batch 的範圍與 proposed message。

停止並等待使用者明確核准。取得核准後依下列規則修改：

- 一般調整：保留原 ID，更新主 blueprint 與原 Slice Brief。
- 拆分：最接近原 Goal 的子 Slice 保留原 ID，其餘使用從未使用過的新 ID。若無法合理保留原 ID，將原 Slice 設為 `withdrawn`，並為所有替代 Slice 建立新 ID。
- 合併：由最能代表合併後 Goal 的主要 Slice 保留 ID，將其他 Slice 設為 `withdrawn`。無法判斷主要 Slice 時停止並請使用者決定。
- 撤回：將不再規劃且尚未實作的 Slice 設為 `withdrawn`。
- 所有新 Slice 初始狀態為 `proposed`；不得刪除、重新編號或重複使用既有 ID。

更新主 blueprint 的 Slice Index、Depends On、Status、Status Note、Last Updated、Documents 與 Last Reconciled。更新每個受影響 Slice Brief 的完整內容，並依 [slice-brief-template.md](references/slice-brief-template.md) 記錄 Blueprint Revision lineage。保持主 blueprint 精簡，不新增結構演進欄位；以 Status Note 提供簡短去向，詳細 lineage 只保存在 Slice Brief。

若 Revision 改變產品需求，先完成需求文件變更核准流程。若任何受影響 Slice 不是 `proposed`，不得直接套用此結構調整：已建立 Spec 或 Plan 時依實質變更規則撤銷核准並重新審查；已 `accepted` 時保留歷史文件，需求或行為改變則建立新的 `change` Slice。

修改完成後檢查需求文件、主 blueprint、所有受影響 Slice Brief 及既有 Spec / Plan 的一致性，依 [commit-workflow.md](references/commit-workflow.md) 直接建立 Blueprint Revision Batch commit，回報 Commit ID 後停止。不得自行開始 Spec、Plan 或實作。

## Feature Slice Mode

開始指定 Feature Slice 前：

1. 讀取 blueprint。
2. 確認 Feature Slice ID 存在。
3. 確認 Feature Slice 不是 `withdrawn`；`withdrawn` Slice 不得進入 Feature Slice Mode。
4. 確認沒有其他 active Slice。
5. 確認 `Depends On` 中的必要依賴已滿足。
6. 讀取該 Slice Brief 及其 Source Reference。
7. 確認要求的操作符合目前狀態。
8. 不自行處理其他 Feature Slice。

若依賴未完成，標示或維持 `blocked`，說明原因並停止。

## 建立 Spec 與 Plan

完整讀取 [spec-template.md](references/spec-template.md) 與 [plan-template.md](references/plan-template.md)。

先根據 blueprint、Slice Brief、Source Reference 及使用者已確認的補充需求建立 Spec。Spec 只定義「做什麼」，不得分析現有程式碼，或以現有程式碼限制改寫、縮減、擴張需求。若技術限制可能影響需求，記錄 Open Questions。

對 `change` Slice，在新 Spec 記錄 Previous Spec、Current Behavior、Target Behavior 與 Preserved Behavior。對 `correction` Slice，記錄 Authoritative Spec 與必須恢復的既有 Acceptance。不要在新舊 Spec 之間共用資料夾。

完成 Spec 草稿後，才分析專案結構、framework、components、routes、state、API clients、types、styles、tests、tooling、既有實作、Spec 落差、回歸風險與 working tree，並建立定義「怎麼做」的 Plan。Plan 必須包含可獨立檢視的 Commit Plan，依序包含 Approval Documentation Batch、一個以上的 implementation batches、AI Verification Documentation Batch，以及 Human Acceptance 後的 Final Documentation Batch。Draft Documentation Batch 由建立 Spec / Plan 的明確要求授權，不屬於尚未核准的 Commit Plan。

現有程式碼與 Spec 不一致時：

1. 以 Spec 表達的需求為準。
2. 在 Current Implementation Assessment 記錄差異。
3. 在 Plan 記錄需要修改的實作。
4. 若差異會改變 Scope、使用者行為或 Integration Contract，停止並詢問使用者。

建立完成後：

1. 將 Spec 與 Plan 的 `Document Status` 設為 `draft`。
2. 將 blueprint Status 設為 `awaiting-approval`。
3. 更新 Status Note 與 Last Updated。
4. 直接建立 `docs(<ID>): draft <feature> specification` commit。
5. 摘要說明 Commit ID、Scope、風險與 Open Questions。
6. 停止並等待明確核准。

若 Spec 的 Goal、User Story、Input / Output、Rules、Included / Excluded、Integration Contract、Acceptance，或 Plan 的 Scope、主要實作方式、核心檔案發生實質變更，同步修改 Plan、撤銷原核准、將文件設為 `draft`、將 blueprint 設為 `awaiting-approval`。若使用者已明確授權 AI 套用此修訂，直接建立新的 `docs(<ID>): revise <feature> specification` commit，然後停止。純文字修正、證據補充及 checkbox 更新不視為實質變更。

若只改變 Commit Batch 的分組、順序或 message，不撤銷 Spec 核准，但將 Commit Plan Approval 設回 `pending`，並在執行受影響 batch 前取得使用者明確核准。不得以調整 Commit Plan 隱藏實作 Scope 變更。

## 核准 Spec 與 Plan

只接受使用者對 Spec 與 Plan 明確表達的核准，不將「看起來不錯」、「應該可以」、「先這樣」等模糊回覆推論為核准。此核准同時核准 Plan 內的 Commit Plan，並授權建立 Approval Documentation Batch commit；不得再詢問使用者是否核准 Commit Plan、是否同意建立 commit，或是否同意繼續開發。

取得明確核准後：

1. 將 Spec 與 Plan 的 `Document Status` 設為 `approved`。
2. 將 blueprint Status 設為 `approved`。
3. 自動將 Commit Plan Approval 設為 `approved`，並沿用相同的核准者與核准時間。
4. 記錄核准日期與 Status Note。
5. 若為 `change`，在被 Revises 的舊 Spec 加入 `Supersession Pending` 提示，但維持其 `Document Status: completed`。
6. 若為 `correction`，保持原 Spec 不變且有效。
7. 直接建立 Commit Plan 中的 Approval Documentation Batch commit。
8. 回報 Commit ID 後停止；即使使用者同時要求繼續，也不在同一操作開始 implementation batch。
9. 只有使用者再次明確要求開始或繼續時，才執行第一個 implementation batch。

## AI 實作

開始前確認 blueprint 與文件皆為 `approved`，再次檢查 working tree，確認沒有無法安全保留的重疊變更，再將 blueprint 設為 `in-progress`。

只在使用者明確要求開始或繼續下一個 batch 後，執行已核准 Plan 中的 AI Implementation Tasks，並一次只處理一個 Commit Batch。不得擴張 Scope、順便實作其他 Slice、自行回答會改變需求的 Open Question、擴大重構，或覆寫無關變更。

完成一個 Commit Batch 後，執行該 batch 指定的驗證，再依 [commit-workflow.md](references/commit-workflow.md) 檢查 message、檔案、diff、排除項目與驗證結果，直接建立 commit。回報 Commit ID 後停止；只有使用者再次明確要求繼續時才開始下一個 batch。

若必須實質修改 Spec 或 Plan，停止實作，記錄發現，更新文件草稿，將 blueprint 設為 `awaiting-approval`，等待重新核准。若無關變更與本 Slice 修改同一檔案且無法安全分離，停止並詢問使用者。

## AI Verification

完整讀取 [verification-template.md](references/verification-template.md)。

只執行已核准 Plan 中的 AI Verification。依專案能力執行 build、unit、integration、end-to-end、lint、typecheck、format、accessibility、browser smoke test 或 responsive inspection。Commit Batch 的局部驗證不能取代完成所有實作後的完整 AI Verification。

只使用 `passed`、`failed`、`not-run`、`not-applicable`：

- `passed`：本次實際執行並成功。
- `failed`：本次實際執行並失敗。
- `not-run`：因環境、權限、依賴或工具限制未執行。
- `not-applicable`：此 Slice 不適用。

不得將未執行檢查、既有報告或程式碼閱讀結果標示為 `passed`，也不得將 AI browser test 視為 Human Acceptance。

為每項檢查記錄 Check、Command / Method、Result、Evidence 與 Notes。若失敗修正仍在核准範圍內，修正並重跑；若超出範圍，停止並要求重新核准。

完成所有可執行 AI 工作後：

1. 建立或更新 verification 文件。
2. 更新 Plan checkbox 與驗證結果。
3. 沒有未解決的 `failed` 時將 blueprint 設為 `awaiting-human`；有未解決失敗時維持 `in-progress`，若修正超出核准 Scope 則回到 `awaiting-approval`。
4. 更新 Status Note 與 Last Updated。
5. 直接建立 AI Verification Documentation Batch commit；`failed` 或 `not-run` 可以如實提交證據，但不得標示為通過。
6. 已進入 `awaiting-human` 時提供 Commit ID、Human Integration 與 Human Acceptance 步驟；否則回報失敗、Commit ID 與重新核准需求。
7. 停止並等待使用者。

部分檢查為 `not-run` 時仍可進入 `awaiting-human`，但必須記錄原因與人類驗證方式。

## Human Integration 與 Human Acceptance

使用 Human Integration 記錄 credentials、secrets、environment variables、OAuth、webhook、真實環境、特定權限、部署平台或第三方服務等人工工作。不需要時記錄 `not-applicable`。只有使用者明確確認後才能勾選。

提供包含 Preconditions、Test Data、Steps、Expected Results、Browser / Device / Viewport、Known Limitations 的驗收方式。只有使用者能回報 Human Acceptance 為 `passed`、`failed` 或 `changes-requested`。回覆含糊時先詢問，不自行設為 `accepted`。

使用者明確確認通過後：

1. 在 verification 文件記錄 Human Integration 與 Human Acceptance。
2. 勾選使用者已確認的 Plan tasks。
3. 將 Spec 與 Plan 設為 `completed`。
4. 若為 `change`，將被 Revises 的舊 Spec 設為 `superseded`，加入 Superseded By、Superseded At 與 Replacement Spec；保持舊 Slice 的 blueprint Status 為 `accepted`。
5. 若為 `correction`，保持 Authoritative Spec 為 `completed`，不得設為 `superseded`。
6. 將目前 Slice 的 blueprint Status 設為 `accepted`。
7. 更新 Status Note 與 Last Updated。
8. 直接建立 Final Documentation Batch commit。
9. 回報 Commit ID、AI Verification、Human Acceptance 與未執行檢查。
10. 停止，不自行開始下一個 Slice。

若回報 `failed`，記錄差異並直接建立 acceptance feedback documentation commit；修正仍在核准範圍內時將 blueprint 設回 `in-progress`，但只在使用者要求修正時繼續。若需改 Spec 或 Plan，退回 `awaiting-approval`。若回報 `changes-requested`，將文件退回 `draft`，同步更新並直接建立 acceptance feedback documentation commit，然後重新等待核准。

## Commit Batches

執行任何 commit 操作前，完整讀取 [commit-workflow.md](references/commit-workflow.md)。

建立 Blueprint 的明確要求、已核准的 Blueprint Revision Proposal，以及建立 draft Spec / Plan 的明確要求，都可以在 Spec 與 Plan 核准前授權對應的文件 commit。這些 commit 只能包含該操作產生的需求與規劃文件，不得包含未核准的程式碼或測試。

Spec 與 Plan 核准後即可依 Commit Plan 自動建立文件或實作 batch；不必等待整個 Slice `accepted`。每個 batch 必須可獨立檢視、只包含本 Slice 相關變更，並在 Plan 中預先列出 purpose、files、required verification 與 proposed message。

若本 Slice 包含使用者已核准且尚未提交的 `docs/project/` 變更，將其納入 Draft、Blueprint Revision 或 Approval Documentation Batch 中最接近且已授權的文件 checkpoint；不得重複提交。

若 Approval Documentation Batch 已提交後才核准需求文件變更，停止實作，依需求文件變更流程更新文件並撤銷必要核准，將 Commit Plan Approval 設回 `pending`，直接建立新的 `docs(<ID>): revise <feature> requirements` commit。不得改寫既有 commit；完成後停止並等待重新核准。

Human Acceptance 通過後，使用最終 Documentation Commit Batch 保存 completed Spec / Plan、Verification、blueprint `accepted` 狀態，以及 `change` Slice 的舊 Spec lineage 更新。使用者的 Human Acceptance 結果即授權此 batch，完成檢查後直接 commit。

若已提交的實作需要修正，建立新的 `fix` batch；不要自行 amend、rebase、squash、reset 或改寫歷史。所有 commits 都不得 push。

完成整個 Slice 後回報所有 Commit IDs、messages、修改檔案、AI Verification、Human Integration、Human Acceptance 與最終狀態，然後停止。
