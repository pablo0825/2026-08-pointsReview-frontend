# Feature Slice Spec Template

建立 `docs/specs/<ID>/<ID>-<name>-spec.md`，使用下列結構。

# <ID> — <Feature Name> Spec

## Document Information

- Feature Slice: `<ID>`
- Change Type: `feature | change | correction`
- Document Status: `draft`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `<YYYY-MM-DD>`
- Last Updated: `<YYYY-MM-DD>`

Document Status 使用 `draft`、`approved`、`completed`、`superseded`。

## Change Information

- Revises Feature Slice: `<ID or none>`
- Corrects Feature Slice: `<ID or none>`
- Previous Spec: `<path or none>`
- Authoritative Spec: `<path or this document>`

`feature` 將兩種關係及 Previous Spec 設為 `none`，並將 Authoritative Spec 設為本文件。`change` 填寫 Revises 與 Previous Spec。`correction` 填寫 Corrects，並將舊 Spec 設為 Authoritative Spec。

## Source Reference

- `docs/project/<file>`, section `<section>`

只列出需求來源，不列出現有程式碼。

## User Story

```text
身為 <使用者角色>，
我希望 <完成的操作或目標>，
以便 <獲得的價值或結果>。
```

## Behavior Change

### Current Behavior

- <現有正式行為；`feature` 填寫 `not-applicable`>

### Target Behavior

- <完成本 Slice 後的目標行為>

### Preserved Behavior

- <本次不得改變的既有行為；`feature` 無既有行為時填寫 `not-applicable`>

## Input / Output

### Input

- <使用者輸入、前置資料或觸發條件>

### Output

- <畫面、狀態、資料或行為結果>

## Rules

1. <功能規則>
2. <驗證規則>
3. <錯誤或邊界行為>

使用可驗收方式描述規則，避免技術實作細節。

## Included

- <本 Spec 包含的功能>

## Excluded

- <本 Spec 明確不包含的功能>

## Preliminary Integration Contract

描述其他系統、頁面或資料來源之間必須成立的必要輸入、預期輸出、錯誤類型、loading、empty、success、failure state 與對外可觀察行為。除非需求已定義不可變契約，否則不要指定元件檔案、函式、library 或詳細實作。

## AI Acceptance

- [ ] <可透過 build、test、lint、typecheck 或自動化操作驗證的條件>

## Human Acceptance

- [ ] <必須由使用者在實際瀏覽器或裝置確認的結果>

## Open Questions

- <仍需確認且可能影響需求的問題>

若沒有，填寫 `None`。

## Approval

- Approved By: `pending`
- Approved At: `pending`
- Approval Note: `pending`

## Template Rules

- 只定義「做什麼」。
- 不分析現有程式碼。
- 不以現有實作限制降低需求。
- 不寫詳細 implementation steps。
- 不自行回答會實質影響 Scope 或 Acceptance 的 Open Question。
- 每個新 Slice 使用自己的 ID 資料夾，不建立 `v2`、`final`、`new` 文件。
- 已接受需求改變時建立 `change` Spec，不覆寫舊 Spec。
- `change` 核准後只在舊 Spec 加入 `Supersession Pending`，並維持舊 Spec 為 `completed`。
- `change` Accepted 後才將舊 Spec 設為 `superseded`，並加入新文件連結。
- `correction` 不使 Authoritative Spec 過期。
