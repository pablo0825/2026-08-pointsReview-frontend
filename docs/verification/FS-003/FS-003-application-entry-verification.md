# FS-003 — Application Entry Verification

## Document Information

- Feature Slice: `FS-003`
- Change Type: `feature`
- Verification Status: `completed`
- Created: `2026-08-11`
- Last Updated: `2026-08-11`

## Change Context

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `docs/specs/FS-003/FS-003-application-entry-spec.md`

## Implementation Summary

- 已建立共用公開導覽，提供「開始申請」與「申請辦法」。
- `/apply` 顯示指定標題與競賽、參與計畫、證照、展覽四個大型申請類型連結。
- 已建立四個申請目的路由與 `/rules` 的最小 route boundary；各表單與申請辦法內容依 Slice 邊界仍為 placeholder。
- 入口頁不讀取 API，也不顯示適用情境、參與人數、附件摘要或個別辦法連結。

## Changed Files

| File | Change |
|---|---|
| `vite.config.ts` | 排除 `e2e/**`，避免 Vitest 誤收 Playwright suite。 |
| `src/app/layouts/public-layout.tsx` | 建立共用公開導覽、active state、鍵盤焦點與響應式排列。 |
| `src/app/router/router.tsx` | 接入正式入口頁及申請／辦法 route boundaries。 |
| `src/features/applications/entry/application-entry.config.ts` | 定義四個顯示名稱與目的路由。 |
| `src/features/applications/entry/application-entry-page.tsx` | 建立 `/apply` 標題與四個大型申請連結。 |
| `src/app/app.test.tsx` | 更新應用程式 smoke test。 |
| `src/app/router/router.test.tsx` | 驗證 redirect、共用導覽與 `/rules` 邊界。 |
| `src/features/applications/entry/application-entry-page.test.tsx` | 驗證四個入口、排除內容與鍵盤順序。 |
| `e2e/application-entry.spec.ts` | 驗證 Chromium 導覽、desktop／360px、44px targets 與水平溢位。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| Typecheck | `npm run typecheck` | passed | exit code 0 | TypeScript project references 通過。 |
| Lint | `npm run lint` | passed | exit code 0 | ESLint 無 error 或 warning。 |
| Unit / Integration Tests | `npm run test` | passed | 3 files、7 tests passed | 覆蓋 App、Router 與 Application Entry。 |
| Production Build | `npm run build` | passed | exit code 0；77 modules transformed | Vite production bundle 成功產生。 |
| Browser / Responsive | `npm run test:e2e -- e2e/application-entry.spec.ts --project=chromium` | passed | 4 tests passed | 覆蓋 redirect、route navigation、鍵盤、desktop、360px、44px targets 與無水平溢位。 |
| Target Behavior | Spec 與自動化測試逐項比對 | passed | Unit／integration 與 Playwright assertions | 未發現 Spec 落差。 |
| I1 Regression | Tests、build 與 Router static inspection | passed | App smoke test、root redirect、route boundaries、`errorElement` 與 Provider render 均保留 | 未修改 Query Provider 或 Route Error Boundary。 |

## AI Acceptance Summary

| Criterion | Result | Evidence |
|---|---|---|
| `/` 導向 `/apply` | passed | Router integration test 與 Chromium redirect test。 |
| 共用導覽提供 `/apply` 與 `/rules` | passed | Router integration test 與 Chromium navigation test。 |
| 標題與四個申請類型名稱／路由正確 | passed | Application Entry component test 與 Chromium navigation test。 |
| 入口頁不顯示文案、人數、附件摘要或個別辦法連結 | passed | Component negative assertions 與 desktop／mobile browser assertions。 |
| 鍵盤、可存取名稱、焦點與非純顏色狀態 | passed | Semantic role assertions、Tab-order browser test、`aria-current` 與 focus ring implementation。 |
| Build、typecheck、lint 與相關測試 | passed | 本次 AI Verification 全部 command exit code 0。 |
| 360px、44px targets 與無水平溢位 | passed | Chromium mobile browser test。 |

## Behavior Verification

### New / Changed Behavior

| Criterion | Result | Evidence |
|---|---|---|
| 訪客可從共用導覽前往申請入口或申請辦法 | passed | Router integration test 與 Chromium route navigation。 |
| 訪客可從 `/apply` 進入四個正確申請路由 | passed | 四個 link contract assertions 與逐一路由 Chromium test。 |
| 入口頁在桌面與 360px 保持清楚且可操作 | passed | Desktop／mobile Chromium tests。 |

### Preserved Behavior Regression

| Criterion | Result | Evidence |
|---|---|---|
| 不建立行銷首頁，保留 `/` redirect | passed | Root redirect integration 與 browser tests。 |
| 保留 I1 Provider、Error Boundary 與公開 Layout 基礎 | passed | App smoke test、build 與 Router static inspection。 |
| Production 使用根路徑 `/` | passed | Vite build 與 root-path Chromium navigation。 |

## Commit Batch Verification

| Batch | Purpose | Required Verification | Result | Planned Message |
|---|---|---|---|---|
| I1 | 建立 Tailwind 前端基礎 | typecheck、lint、test、build | passed | `chore(FS-003): scaffold frontend application foundation` |
| I2 | 完成共用公開導覽與申請入口 | typecheck、lint、test、build、targeted Chromium Playwright | passed | `feat(FS-003): add public application entry` |
| Verification | 保存完整 AI Verification 與狀態 | 完整證據、文件一致性、`git diff --check` | passed | `docs(FS-003): record application entry verification` |

## Human Integration

### Required Work

1. Human Integration: `not-applicable`；入口頁不依賴 credentials、secrets、environment variables、第三方服務或真實後端資料，production 根路徑 `/` 已由使用者確認。

### Result

- Status: `not-applicable`
- Confirmed By: `使用者`
- Confirmed At: `2026-08-11`
- Notes: `使用者已確認第一版不使用公開人數 API，且 production 使用根路徑。`

## Human Acceptance Instructions

### Preconditions

- 已執行 `npm install`。
- 以 `npm run dev` 啟動本機應用程式。

### Test Data

- `not-applicable`；本 Slice 不讀取資料。

### Browser / Device / Viewport

- Desktop Chrome，建議 1280 × 720。
- Chrome responsive mode，360 × 800。

### Steps and Expected Results

| Step | Action | Expected Result |
|---|---|---|
| 1 | 開啟 `/`。 | 自動導向 `/apply`，顯示「請選擇申請類型」。 |
| 2 | 檢查頁首與入口頁。 | 頁首顯示「開始申請」、「申請辦法」；主內容只顯示四個申請入口，沒有額外摘要。 |
| 3 | 逐一開啟四個申請入口。 | 分別前往 competition、project-participation、certificate、exhibition 路由。 |
| 4 | 點選頁首「申請辦法」。 | 前往 `/rules`；目前顯示由 `FS-002` 接續替換的 placeholder。 |
| 5 | 使用 Tab 操作並切換至 360 × 800。 | 所有連結焦點清楚、容易操作，版面沒有水平捲動。 |

### Known Limitations

- 四種申請表單內容不屬於本 Slice，目前由 route placeholder 表示，後續由 `FS-004` 至 `FS-007` 實作。
- `/rules` 內容不屬於本 Slice，目前由 route placeholder 表示，後續由 `FS-002` 實作。

## Human Acceptance Result

- Status: `passed`
- Confirmed By: `使用者`
- Confirmed At: `2026-08-11`
- User Feedback: `驗收通過。`

## Final Summary

- AI Verification: `passed；所有核准檢查均於 2026-08-11 重新執行並通過。`
- Human Integration: `not-applicable；已由使用者確認。`
- Human Acceptance: `passed；使用者已於 2026-08-11 確認驗收通過。`
- Remaining Issues: `none within approved scope；僅保留 Excluded Scope 的 route placeholders。`
- Final Feature Slice Status: `accepted`

## Document Lineage Update

- Slice Brief Link: `docs/blueprint/slices/FS-003-application-entry.md`
- Previous Spec Status: `not-applicable`
- Replacement Spec Link Added: `not-applicable`
- Blueprint Links Updated: `yes`

## Template Rules

- 將 AI Verification 與 Human Acceptance 分開記錄。
- 不將未執行檢查標示為通過。
- 不由 AI 填寫使用者尚未確認的結果。
- 將 blueprint Status 視為 Feature Slice 狀態的唯一權威來源。
- `change` 必須記錄 Target Behavior 與 Preserved Behavior 的驗證結果。
- `change` Accepted 後確認舊 Spec 已標示 `superseded` 並連到新 Spec。
- `correction` 必須確認 Authoritative Spec 仍然有效且未被標示 `superseded`。
- Commit Batch Verification 只記錄局部檢查，不取代完整 AI Verification。
- Human Acceptance 失敗後以新的 `fix` batch 記錄修正，不改寫既有 commits。
