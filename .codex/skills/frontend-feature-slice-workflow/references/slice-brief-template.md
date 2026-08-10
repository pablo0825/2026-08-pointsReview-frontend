# Feature Slice Brief Template

建立 `docs/blueprint/slices/<ID>-<name>.md`，使用下列結構。

# <ID> — <Feature Name>

## Slice Information

- ID: `<ID>`
- Name: `<English Name>`
- Type: `feature | change | correction`
- Depends On: `<ID or none>`
- Revises: `<ID or none>`
- Corrects: `<ID or none>`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal

<以中文描述功能目標>

## User-Visible Result

<描述使用者可以觀察或完成的結果>

## Source Reference

- `docs/project/<file>`, section `<section>`

## Included

- <本 Slice 包含的需求>

## Excluded

- <明確不包含的需求>

## AI Responsibility

- <AI 負責的實作、測試及文件工作>

## Human Integration

- <需要人類完成的外部設定，或 `not-applicable`>

## AI Acceptance

- <AI 可透過編譯、測試或檢查取得證據的結果>

## Human Acceptance

- <必須由使用者實際確認的結果>

## Blueprint Revision

只有本 Slice 經過結構調整時才加入本節；否則省略。

- Action: `split | merge | withdraw`
- Derived From: `<IDs or none>`
- Replaced By: `<IDs or none>`
- Merged Into: `<ID or none>`
- Reason: <調整原因>
- Revised At: `<YYYY-MM-DD>`

## Template Rules

- 保持內容簡短，將詳細 Rules、Input / Output 與 Integration Contract 留給 Spec。
- 不在本文件保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 以主 blueprint 作為目前狀態的唯一來源。
- `feature` 的 Revises 與 Corrects 使用 `none`。
- `change` 使用 Revises 指向被修改的已接受 Slice。
- `correction` 使用 Corrects 指向實作不符合其有效 Spec 的已接受 Slice。
- Blueprint Revision lineage 只記錄拆分、合併或撤回，不鏡像主 blueprint 的目前 Status。
- 原 Slice Brief 必須保留並記錄替代去向；新 Slice Brief 記錄其來源。
