# FS-003 — Application Entry Plan

## Document Information

- Feature Slice: `FS-003`
- Change Type: `feature`
- Document Status: `completed`
- Based On Spec: `docs/specs/FS-003/FS-003-application-entry-spec.md`
- Spec Last Updated: `2026-08-11`
- Created: `2026-08-10`
- Last Updated: `2026-08-11`

## Goal

保留 I1 已建立的 React／TypeScript／Vite／Tailwind CSS 專案、Router、Provider、公開頁 Layout 與測試工具，再以 feature-local 結構完成共用公開導覽及 `/apply` 四個申請入口、響應式與無障礙驗證；不預建其他 Slice 尚未使用的表單、後台或共用抽象。

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-003/FS-003-application-entry-spec.md`

## Scope

### Included

- 保留 I1 已完成並提交的 React、TypeScript、Vite、Tailwind CSS、ESLint、Vitest、Testing Library、MSW、Playwright、根 Provider、Router、Route Error Boundary、公開頁 Layout 與全域基礎樣式。
- 建立 `/` 至 `/apply` 的導向與 `/apply` 入口頁。
- 在共用公開 Layout 建立「開始申請」與「申請辦法」導覽。
- 建立標題「請選擇申請類型」與四個大型申請類型連結。
- 建立元件／整合測試及 Chromium browser test，覆蓋 360px、鍵盤與主要導覽。

### Excluded

- 四種五步申請表單、送件、補件與申請資料模型。
- `/rules` 頁面內容及其他公開頁面內容。
- 類型適用情境、參與人數、最低附件摘要及公開規則資料整合。
- Authentication Context、登入、後台 Layout 與角色權限。
- 完整 Design System、未出現第二個使用者的通用抽象及額外全域狀態。
- 參與人數規則 API、管理功能或任何第一版不需要的遠端入口資料。

## Current Implementation Assessment

### Existing Behavior

- I1 已於 commit `bba2849` 建立可執行的 React／TypeScript／Vite／Tailwind CSS 專案與必要 scripts。
- Router 已提供 `/` 至 `/apply` 的導向、`/apply` placeholder 及四個申請目的 route placeholder。
- Public Layout、Route Error Boundary、Query Provider、Vitest、Testing Library、MSW 基礎設定及 Playwright 設定已存在。

### Reusable Components

- `src/app/layouts/public-layout.tsx`：加入共用公開導覽的既有頁面骨架。
- `src/app/router/router.tsx`：保留既有 redirect 與 route placeholder，將 `/apply` placeholder 換成入口頁。
- `src/app/styles/global.css`：既有 Tailwind CSS 入口、theme tokens 與全域 focus 基礎。

### Integration Points

- `docs/project/frontend-architecture.md`：定義 feature-oriented 目錄、Provider 順序、Query ownership 與安全限制。
- `docs/project/development-standards.md`：定義 Tailwind CSS 使用規範、共通品質要求與 Definition of Done。
- `docs/project/testing-strategy.md`：定義入口連結、鍵盤、響應式與 browser test 的驗證層級。
- `docs/project/routes-and-pages.md`：定義 `/`、`/apply`、四個申請路由與 `/rules` 邊界。
- `docs/project/application-rules.md`：定義四類名稱及第一版固定人數；入口頁不顯示或取得人數。

### Gaps Against Spec

- 缺少共用公開導覽列。
- `/apply` 仍是 placeholder，缺少標題與四個申請類型連結。
- 缺少入口頁直接相關的元件／整合與 Playwright 測試。

### Preserved Behavior

- 保留既有需求、blueprint、Skill 與 repository 文件；實作不得改寫其產品決策。
- 不建立行銷首頁，維持 `/` 導向 `/apply` 的既定路由決策。

### Regression Risks

- I1 基礎已被既有 smoke tests 覆蓋；I2 必須避免破壞 redirect、目的 route placeholder、Error Boundary 與 Provider 組合。
- 公開導覽會成為後續公開 Slice 的共用入口，語意、active state 與窄螢幕排列需保持穩定。

### Compatibility / Migration

- 不修改 I1 commit history；在現有 source 上追加 I2，保留 package lock 與既有 scripts。

### Constraints

- 使用 React、TypeScript、Vite、React Router 與 TanStack Query；本 Slice 不讀取 API，後續 API response 仍須以 Zod 驗證。
- 使用 Tailwind CSS 作為標準樣式方案；採 Mobile First utilities，並將全域 CSS 限制在 Tailwind 入口、theme／design tokens、瀏覽器基礎樣式與必要全域行為。
- 不以 CSS Modules 作為預設方案；只有專案架構允許的例外情境才建立 feature-local 自訂 CSS。
- 測試使用 Vitest、Testing Library、MSW 與 Playwright。
- 僅安裝 `FS-003` 實際需要的依賴；React Hook Form 等尚未使用的依賴留給後續 Slice。
- 公開頁最低支援 360px，目標 WCAG 2.2 AA，主要觸控目標至少 44 × 44px。
- 不得把 Session Token、個資或敏感資料寫入不允許的儲存空間或 Log；本 Slice 不處理此類資料。
- Production 使用根路徑 `/`；現有 Vite 與 Router 設定可維持。

### Unknowns

- `none`；公開人數 API、入口文案與 production base path 均已決定。

## Files

### Create

- `src/features/applications/entry/application-entry-page.tsx`：標題、四個大型申請類型連結與 Tailwind utility 樣式。
- `src/features/applications/entry/application-entry.config.ts`：四個顯示名稱與固定目的路由；不保存文案、人數或附件摘要。
- `src/features/applications/entry/application-entry-page.test.tsx`：標題、四個連結、排除內容與 accessibility 測試。
- `e2e/application-entry.spec.ts`：桌面／360px、鍵盤、導覽與 overflow browser test。

### Modify

- `src/app/layouts/public-layout.tsx`：加入「開始申請」與「申請辦法」共用公開導覽。
- `src/app/router/router.tsx`：以正式入口頁取代 `/apply` placeholder，保留其他目的 route placeholder。
- `src/app/router/router.test.tsx`：補充 redirect、共用導覽與 route 邊界測試。

### Tests

- `src/app/router/router.test.tsx`：`/` 導向 `/apply`、共用公開導覽與目的 route 邊界。
- `src/features/applications/entry/application-entry-page.test.tsx`：標題、四個連結、排除摘要內容、鍵盤與可存取名稱。
- `e2e/application-entry.spec.ts`：Chromium 360px／desktop、鍵盤順序、44px targets、無水平溢位與 route navigation。

## Implementation Steps

1. 保留 I1 的專案與 route 基礎，在 `public-layout.tsx` 使用語意化導覽及 Tailwind utilities 加入「開始申請」與「申請辦法」。
2. 建立 feature-local config 與 `/apply` 頁面，顯示指定標題與四個大型 route links，不建立 API、Query、Schema、MSW handler 或摘要資料模型。
3. 更新 Router，以正式入口頁取代 `/apply` placeholder，並保留四個目的 route placeholder 供導覽驗證。
4. 使用 Testing Library 驗證標題、連結、共用導覽、排除內容、鍵盤與可存取名稱。
5. 使用 Playwright 驗證 Chromium desktop／360px 版面、觸控目標、鍵盤導覽、無水平溢位與 route navigation。
6. 執行 typecheck、lint、unit／integration tests、production build 與 targeted Playwright。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| 共用導覽會被後續公開頁共用 | 不一致的 route active state 或窄螢幕排列會影響後續 Slice | 使用 React Router link semantics、清楚焦點狀態與 360px browser test |
| I2 修改 I1 已建立的 Router 與 Layout | 可能回歸 redirect、Error Boundary 或目的 route placeholder | 保留既有 smoke tests 並增加針對共用導覽與各目的 route 的測試 |

## AI Implementation Tasks

- [x] 建立最小 npm／Vite／React／TypeScript／Tailwind CSS 專案與 scripts（I1，commit `bba2849`）。
- [x] 建立 Router、Query Provider、Error Boundary、Public Layout、Tailwind 入口與全域基礎樣式（I1，commit `bba2849`）。
- [x] 建立共用公開導覽。
- [x] 建立標題與四個大型申請類型連結。
- [x] 建立元件／整合與 Playwright tests。

## AI Verification

- [x] 執行 `npm run build`
- [x] 執行 `npm run test`
- [x] 執行 `npm run lint`
- [x] 執行 `npm run typecheck`
- [x] 執行 `npm run test:e2e -- e2e/application-entry.spec.ts --project=chromium`
- [x] 以 Playwright 驗證 desktop 與 360px、鍵盤、44 × 44px targets 及無水平溢位
- [x] 驗證 Target Behavior
- [x] 回歸驗證 I1 的 redirect、route placeholder、Provider 與 Error Boundary 行為

## Human Integration

- `not-applicable`；入口頁不依賴外部資料，且 production 根路徑 `/` 已確認。

只有使用者明確確認後才能勾選。

## Human Acceptance

- [x] 在桌面與 360px viewport 確認共用導覽與四個申請入口清楚且版面可用。
- [x] 逐一確認四個申請入口前往正確路由。
- [x] 確認共用導覽的「開始申請」與「申請辦法」前往正確路由。

只有使用者明確確認後才能勾選。

## Documentation Updates

- [x] 確認已核准的 `docs/project/frontend-architecture.md` 與 `docs/project/development-standards.md` Tailwind CSS 標準已反映於實作與驗證。
- [x] 確認需求文件、Slice Brief、Spec 與 Plan 一致。
- [x] 更新 Slice Brief 或 blueprint 文件連結。
- [x] 更新 Spec 狀態。
- [x] 更新 Plan 狀態。
- [x] 更新 verification record。
- [x] 更新 blueprint Status、Status Note 與 Last Updated。
- [x] `not-applicable`：本 Slice 不是 `change`，不需 supersession lineage。

## Commit Plan

Draft Documentation Batch 由使用者建立 Spec / Plan 的明確要求授權，建立本文件後直接以 `docs(FS-003): draft application entry specification` 提交，不受下列尚為 `pending` 的 Commit Plan 限制。

- Commit Plan Approval: `approved`
- Approved By: `使用者`
- Approved At: `2026-08-11`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存已核准的需求與 Slice 文件 | Slice Brief、Spec、Plan、blueprint | 文件一致性、`git diff --check` | `docs(FS-003): approve application entry specification` |
| I1 | 建立 `FS-003` 所需且可獨立執行的 Tailwind 前端基礎 | package／lock、Vite／Tailwind／TypeScript／ESLint／Playwright configs、`src/main.tsx`、`src/app/**`、`src/test/setup.ts`、`AGENTS.md` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `chore(FS-003): scaffold frontend application foundation` |
| I2 | 完成共用公開導覽、申請入口與直接相關測試 | `src/features/applications/entry/**`、`src/app/layouts/public-layout.tsx`、`src/app/router/router.tsx`、相關 tests、`e2e/application-entry.spec.ts` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `feat(FS-003): add public application entry` |
| Verification | 保存完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、`git diff --check` | `docs(FS-003): record application entry verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-003): record application entry acceptance` |

Commit Plan Approval 使用 `pending`、`approved`。每個 batch 只涵蓋一個清楚目的，並保持可獨立檢視。I1 已完成並提交；需求修訂後 I2 必須等待 Spec、Plan 與 Commit Plan 重新核准。

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-11`
- Approval Note: `使用者已明確核准修訂後的 Spec、Plan 與 Commit Plan；I1 已完成，I2 等待下一次明確開始要求。`

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
- Spec 與 Plan 核准時一併核准 Commit Plan。
- Draft Documentation Batch 在 Spec / Plan 建立後自動 commit，讓使用者能以 Git diff 審查後續修改。
- 第一個已核准 batch 必須是 Approval Documentation Batch；核准後直接 commit，並停止等待使用者要求開始 implementation。
- 每個 implementation batch 只在使用者明確要求開始或繼續後執行，完成與驗證後直接 commit。
- 完整 AI Verification 後直接建立 Verification Documentation commit。
- Human Acceptance 結果授權 Final 或 Acceptance Feedback Documentation commit。
- 已授權 batch 不再要求第二次 commit 確認。
- 不執行未列入 Commit Plan 或尚未核准的 batch。
- 只改變 batch 分組、順序或 message 時，將 Commit Plan Approval 設回 `pending`；若 Scope 也改變，依 Skill 撤銷完整 Plan 核准。
- 最終 Documentation Batch 必須位於 Human Acceptance 之後。
