# FS-003 — Application Entry Plan

## Document Information

- Feature Slice: `FS-003`
- Change Type: `feature`
- Document Status: `draft`
- Based On Spec: `docs/specs/FS-003/FS-003-application-entry-spec.md`
- Spec Last Updated: `2026-08-10`
- Created: `2026-08-10`
- Last Updated: `2026-08-11`

## Goal

先建立足以支撐 `FS-003` 的最小 React／TypeScript／Vite 專案、Router、Provider、公開頁 Layout 與測試工具，再以 feature-local 結構完成 `/apply` 四類申請入口、必要規則資料狀態、響應式與無障礙驗證；不預建其他 Slice 尚未使用的表單、後台或共用抽象。

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-003/FS-003-application-entry-spec.md`

## Scope

### Included

- 使用 npm 建立 React、TypeScript、Vite 專案與必要 scripts。
- 安裝並設定 Tailwind CSS，作為專案標準樣式方案。
- 建立 ESLint、Vitest、Testing Library、MSW 與 Playwright 的最小設定。
- 建立根 Provider、React Router、Route Error Boundary、公開頁 Layout 與全域基礎樣式。
- 建立 `/` 至 `/apply` 的導向與 `/apply` 入口頁。
- 建立四類申請卡片、固定路由／最低附件摘要及已確認的簡短適用情境。
- 依核准後的正式契約整合目前允許人數，處理 loading、empty、failure、retry 與 success。
- 建立元件／整合測試及 Chromium browser test，覆蓋 360px、鍵盤與主要導覽。

### Excluded

- 四種五步申請表單、送件、補件與申請資料模型。
- `/rules` 頁面內容及其他公開頁面內容。
- Authentication Context、登入、後台 Layout 與角色權限。
- 完整 Design System、未出現第二個使用者的通用抽象及額外全域狀態。
- 未經核准的新後端 endpoint、臨時假契約或把文件數值硬編碼為「目前規則」。

## Current Implementation Assessment

### Existing Behavior

- Repository 為 documentation-first，沒有 `package.json`、`src/`、前端 route、頁面、樣式或測試工具。
- `/` 與 `/apply` 目前都沒有可執行行為。

### Reusable Components

- `not-applicable`；目前沒有可重用的前端元件或程式碼。

### Integration Points

- `docs/project/frontend-architecture.md`：定義 feature-oriented 目錄、Provider 順序、Query ownership 與安全限制。
- `docs/project/development-standards.md`：定義 Tailwind CSS 使用規範、共通品質要求與 Definition of Done。
- `docs/project/routes-and-pages.md`：定義 `/`、`/apply`、四個申請路由與 `/rules` 邊界。
- `docs/project/application-rules.md`：定義四類名稱、基準人數與最低附件要求。
- 待確認的公開參與人數規則契約：提供四類「目前允許人數」及 loading／empty／failure 行為所需資料。

### Gaps Against Spec

- 缺少完整可執行的前端專案、Tailwind CSS 與所有必要依賴／scripts。
- 缺少 Router、Provider、公開頁 Layout、Error Boundary 與基礎樣式。
- 缺少 `/apply` 頁面、卡片、規則資料整合與所有 Spec Acceptance。
- 缺少自動化測試、MSW、Playwright 與瀏覽器驗證能力。

### Preserved Behavior

- 保留既有需求、blueprint、Skill 與 repository 文件；實作不得改寫其產品決策。
- 不建立行銷首頁，維持 `/` 導向 `/apply` 的既定路由決策。

### Regression Risks

- 目前沒有既有前端行為可回歸；主要風險是初始化設定偏離文件架構，或過早建立其他 Slice 才需要的抽象。
- 入口頁建立的 Router、Provider 與公開 Layout 將成為後續公開 Slice 的基礎，錯誤邊界或樣式決策可能放大後續修改成本。

### Compatibility / Migration

- `not-applicable`；沒有既有 application source、package lock 或使用者流程需要遷移。

### Constraints

- 使用 React、TypeScript、Vite、React Router 與 TanStack Query；API response 以 Zod 驗證。
- 使用 Tailwind CSS 作為標準樣式方案；採 Mobile First utilities，並將全域 CSS 限制在 Tailwind 入口、theme／design tokens、瀏覽器基礎樣式與必要全域行為。
- 不以 CSS Modules 作為預設方案；只有專案架構允許的例外情境才建立 feature-local 自訂 CSS。
- 測試使用 Vitest、Testing Library、MSW 與 Playwright。
- 僅安裝 `FS-003` 實際需要的依賴；React Hook Form 等尚未使用的依賴留給後續 Slice。
- 公開頁最低支援 360px，目標 WCAG 2.2 AA，主要觸控目標至少 44 × 44px。
- 不得把 Session Token、個資或敏感資料寫入不允許的儲存空間或 Log；本 Slice 不處理此類資料。
- 操作開始時可用 Node `v24.4.1` 與 npm `11.4.2`，但專案 engines 與 CI runtime 尚未由需求指定。

### Unknowns

- 尚未定義「目前允許人數」的公開 endpoint、response schema、錯誤語意與 cache policy。
- 尚未提供四張卡片簡短適用情境的核准文案。
- Repository 尚未指定 production deploy base path；Router 與 Vite 先使用 root base，若部署環境不同需在實作前確認。

## Files

### Create

- `package.json`：npm scripts 與 `FS-003` 必要 runtime／development dependencies。
- `package-lock.json`：鎖定已安裝依賴。
- `index.html`：Vite application entry。
- `.gitignore`：排除 dependencies、build 與測試產物。
- `tsconfig.json`、`tsconfig.app.json`、`tsconfig.node.json`：瀏覽器與工具 TypeScript 設定。
- `vite.config.ts`：Vite、Tailwind CSS 與 Vitest 設定入口。
- `eslint.config.js`：TypeScript／React lint 設定。
- `playwright.config.ts`：Chromium 與本機 web server 測試設定。
- `src/main.tsx`：React root entry。
- `src/app/app.tsx`：根應用程式組合。
- `src/app/providers/app-providers.tsx`：Query Client 與後續 Provider 擴充邊界。
- `src/app/router/router.tsx`：`/` redirect、`/apply` 與已知目的路由邊界。
- `src/app/error-boundaries/route-error-page.tsx`：route-level 可重試／返回錯誤畫面。
- `src/app/layouts/public-layout.tsx`：公開頁共同結構。
- `src/app/styles/global.css`：Tailwind 入口、共用 theme／design tokens、Mobile First 基礎樣式與 focus 行為。
- `src/features/applications/entry/application-entry-page.tsx`：入口頁 composition、資料狀態與 Tailwind utility 樣式。
- `src/features/applications/entry/application-entry-card.tsx`：單一類型卡片與 Tailwind utility 樣式。
- `src/features/applications/entry/application-entry.config.ts`：已核准的名稱、文案、路由與最低附件摘要；不保存目前人數。
- `src/features/applications/entry/application-entry.schema.ts`：核准後的人數規則 response schema。
- `src/features/applications/entry/application-entry.query.ts`：目前人數資料取得與 Query 設定。
- `src/test/setup.ts`：Testing Library 與 MSW 測試初始化。
- `src/test/mocks/server.ts`：MSW server。
- `src/test/mocks/handlers/application-entry.ts`：核准契約的成功 fixture handler。
- `src/app/app.test.tsx`：基礎應用程式可啟動與公開 Layout smoke test。
- `src/app/router/router.test.tsx`：redirect 與 route 邊界測試。
- `src/features/applications/entry/application-entry-page.test.tsx`：卡片、狀態、連結與 accessibility 測試。
- `e2e/application-entry.spec.ts`：桌面／360px、鍵盤、導覽與 overflow browser test。

### Modify

- `AGENTS.md`：加入實際可用的 install、dev、build、typecheck、lint、test 與 e2e commands。

### Tests

- `src/app/app.test.tsx`：專案初始化後的 root Provider 與公開 Layout smoke test。
- `src/app/router/router.test.tsx`：`/` 導向 `/apply` 與公開 route 邊界。
- `src/features/applications/entry/application-entry-page.test.tsx`：四卡內容、目前人數、最低附件、loading／empty／failure／retry／success 與連結。
- `e2e/application-entry.spec.ts`：Chromium 360px／desktop、鍵盤順序、44px targets、無水平溢位與 route navigation。

## Implementation Steps

1. 以 npm 建立最小 Vite React TypeScript 專案，加入 requirements 指定且本 Slice 必要的 Router、Query、Zod、Tailwind CSS、Vitest、Testing Library、MSW、Playwright 與 ESLint，選擇彼此相容的 Tailwind 套件與 Vite 整合方式，由 `package-lock.json` 鎖定版本，並定義可重複執行的 scripts。
2. 建立 `src/app/` 根 entry、Query Provider、Router、Route Error Boundary、Public Layout 與 Tailwind 入口；在 `global.css` 保留共用 theme／design tokens、Mobile First 基礎樣式與 focus 行為，先以最小 placeholder route 保持 buildable。
3. 在契約與卡片文案確認後，建立 feature-local config、Zod schema、Query 與 MSW fixtures，不把目前人數放入本機 fallback。
4. 使用 Tailwind utilities 建立 `/apply` 頁面與語意化卡片，輸出四個申請 route 及 `/rules` 連結，完成 loading、empty、failure、retry 與 success UI；不為一般版面建立 CSS Module。
5. 使用 Testing Library 驗證卡片內容、route、資料狀態、鍵盤與可存取名稱；禁止未處理的 MSW request 靜默通過。
6. 使用 Playwright 驗證 Chromium desktop／360px 版面、觸控目標、鍵盤導覽、無水平溢位與 route navigation。
7. 更新實際 commands 文件並執行 typecheck、lint、unit／integration tests、production build 與 targeted Playwright。

## Risks / Open Issues

| Risk / Issue | Impact | Mitigation / Decision Needed |
|---|---|---|
| 目前允許人數沒有已定義公開 API | 無法安全實作 success／loading／error contract，I2 不得用硬編碼取代 | 在核准 Spec／Plan 前確認既有 endpoint，或另行核准 `docs/project/api-integration.md` 與相關需求文件變更 |
| 四張卡片適用情境沒有核准文案 | UI copy 與 Human Acceptance 無法形成穩定基準 | 使用者提供文案，或明確授權採用後續提案並同步修訂 Spec／Plan |
| production base path 未指定 | 非 root 部署可能導致 asset 與 route 失效 | 實作前確認部署使用 root；若不是 root，更新 Plan 的 Router／Vite 設定 |
| 第一個 Slice 承擔專案初始化 | 設定範圍容易膨脹或預建未使用架構 | I1 僅建立 `FS-003` 必要能力，其他 Provider、表單與後台架構延後 |

## AI Implementation Tasks

- [ ] 建立最小 npm／Vite／React／TypeScript／Tailwind CSS 專案與 scripts。
- [ ] 建立 Router、Query Provider、Error Boundary、Public Layout、Tailwind 入口與全域基礎樣式。
- [ ] 依核准契約建立目前人數 Schema、Query 與 MSW fixture。
- [ ] 建立四類申請入口卡片及完整資料狀態。
- [ ] 建立元件／整合與 Playwright tests。
- [ ] 更新實際開發 commands 文件。

## AI Verification

- [ ] 執行 `npm run build`
- [ ] 執行 `npm run test`
- [ ] 執行 `npm run lint`
- [ ] 執行 `npm run typecheck`
- [ ] 執行 `npm run test:e2e -- e2e/application-entry.spec.ts --project=chromium`
- [ ] 以 Playwright 驗證 desktop 與 360px、鍵盤、44 × 44px targets 及無水平溢位
- [ ] 驗證 Target Behavior
- [ ] 回歸驗證 repository 文件未被產品實作分析改寫

## Human Integration

- [ ] 使用者或後端團隊提供並確認「目前允許人數」公開契約與可用測試環境。
- [ ] 使用者確認四張卡片的簡短適用情境文案。
- [ ] 使用者確認 production 使用 root base path，或提供實際 base path。

只有使用者明確確認後才能勾選。

## Human Acceptance

- [ ] 在桌面與 360px viewport 確認四張卡片資訊清楚且版面可用。
- [ ] 確認四種適用情境、目前人數與最低附件摘要能協助正確選擇。
- [ ] 逐一確認申請與辦法連結前往正確路由。
- [ ] 確認規則資料失敗訊息與重試操作清楚。

只有使用者明確確認後才能勾選。

## Documentation Updates

- [ ] 確認已核准的 `docs/project/frontend-architecture.md` 與 `docs/project/development-standards.md` Tailwind CSS 標準已反映於實作與驗證。
- [ ] 確認需求文件、Slice Brief、Spec 與 Plan 一致。
- [ ] 更新 Slice Brief 或 blueprint 文件連結。
- [ ] 更新 Spec 狀態。
- [ ] 更新 Plan 狀態。
- [ ] 更新 verification record。
- [ ] 更新 blueprint Status、Status Note 與 Last Updated。
- [ ] `not-applicable`：本 Slice 不是 `change`，不需 supersession lineage。

## Commit Plan

Draft Documentation Batch 由使用者建立 Spec / Plan 的明確要求授權，建立本文件後直接以 `docs(FS-003): draft application entry specification` 提交，不受下列尚為 `pending` 的 Commit Plan 限制。

- Commit Plan Approval: `pending`
- Approved By: `pending`
- Approved At: `pending`

| Batch | Purpose | Files | Required Verification | Proposed Message |
|---|---|---|---|---|
| Approval | 保存已核准的需求與 Slice 文件 | Slice Brief、Spec、Plan、blueprint | 文件一致性、`git diff --check` | `docs(FS-003): approve application entry specification` |
| I1 | 建立 `FS-003` 所需且可獨立執行的 Tailwind 前端基礎 | package／lock、Vite／Tailwind／TypeScript／ESLint／Playwright configs、`src/main.tsx`、`src/app/**`、`src/test/setup.ts`、`AGENTS.md` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` | `chore(FS-003): scaffold frontend application foundation` |
| I2 | 完成公開申請入口與直接相關測試 | `src/features/applications/entry/**`、`src/test/mocks/**`、`src/app/router/router.tsx`、相關 tests、`e2e/application-entry.spec.ts` | `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、targeted Chromium Playwright | `feat(FS-003): add public application entry` |
| Verification | 保存完整 AI Verification 與適當狀態 | Plan、Verification、blueprint | 完整 AI Verification 證據、`git diff --check` | `docs(FS-003): record application entry verification` |
| Final | 記錄最終驗收與狀態 | Spec、Plan、Verification、blueprint | 文件一致性、`git diff --check` | `docs(FS-003): record application entry acceptance` |

Commit Plan Approval 使用 `pending`、`approved`。每個 batch 只涵蓋一個清楚目的，並保持可獨立檢視。I2 必須在公開人數契約與卡片文案確認後才能開始。

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
