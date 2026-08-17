# FS-005 — Project Participation Application Verification

## Document Information

- Feature Slice: `FS-005`
- Verification Status: `in-progress`
- Created: `2026-08-16`
- Last Updated: `2026-08-17`

## Implementation Summary

- 將公開老師、公開申請成功契約、附件編輯器、multipart snapshot、Idempotency 與成功／不確定狀態整理為 `applications/common`，並保留 FS-004 競賽行為。
- 完成 `/apply/project-participation` 五步表單、1～12 筆薪資、明確後端試算、異動失效、單一申請人、老師、必要薪資證明、確認摘要與公開 multipart 送件。
- 完成試算及正式 422 路徑、附件 400、409、429、未知 4xx、Network／5xx 不確定結果、不可變快照重試及 201 成功狀態。
- 2026-08-17 Human Acceptance 要求精簡第一步名稱、移除薪資限制提示，並讓 FS-005 與 FS-004 共用年級／班級正式顯示名稱；修訂尚待重新核准與實作。

## Changed Files

| File | Change |
|---|---|
| `src/shared/api/api-client.ts`、`api-client.test.ts` | 新增公開 JSON POST 與 transport／錯誤測試。 |
| `src/features/applications/common/api/**` | 共用老師、公開申請契約、FormData、不可變 snapshot 與 multipart 送件。 |
| `src/features/applications/common/components/advisor-selector.tsx`、`attachment-editor.tsx`、`application-submission-state.tsx` | 移除 competition 型別耦合，讓附件分類可設定並共用成功／不確定 UI。 |
| `src/features/applications/competition/**` | 改用 common primitives，維持既有競賽契約與可見行為。 |
| `src/features/applications/project-participation/api/**` | 試算、正式 payload、Response schemas 與 multipart wrapper。 |
| `src/features/applications/project-participation/model/**` | Form schema、薪資快照、試算有效性、正規化與 payload Mapper。 |
| `src/features/applications/project-participation/components/**` | 計畫／薪資、單一申請人與確認摘要步驟。 |
| `src/features/applications/project-participation/project-participation-application-page.tsx` | 五步流程、試算、老師、附件、送件與錯誤 orchestration。 |
| `src/features/applications/project-participation/**/*.test.ts*` | API、Model 與完整頁面整合測試。 |
| `src/app/router/router.tsx`、`router.test.tsx` | 以正式頁面取代 FS-005 placeholder 並加入 route smoke test。 |
| `src/test/**/project-participation-application.ts`、`src/test/server.ts` | FS-005 MSW fixtures、handlers 與預設註冊。 |
| `e2e/project-participation-application.spec.ts` | 正常送件、失效／不合格、Idempotent retry、360px 與離開警告。 |

## AI Verification

| Check | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|
| TypeScript | `npm run typecheck` | not-run | 等待 R1 實作 | 修訂後須重新執行。 |
| ESLint | `npm run lint` | not-run | 等待 R1 實作 | 修訂後須重新執行。 |
| Vitest | `npm run test` | not-run | 等待 R1 實作 | 修訂後須涵蓋共用學籍標籤與 FS-004 回歸。 |
| Production Build | `npm run build` | not-run | 等待 R1 實作 | 修訂後須重新執行。 |
| Chromium E2E | `npm run test:e2e -- --project=chromium e2e/project-participation-application.spec.ts e2e/competition-application.spec.ts` | not-run | 等待 R1 實作 | 修訂後須重新執行 FS-005 與 FS-004。 |
| Diff Integrity | `git diff --check` | not-run | 等待 R1 實作 | Reverification checkpoint 前執行。 |

## Acceptance Evidence

| Spec Criterion | Result | Evidence |
|---|---|---|
| 「計畫與薪資試算」名稱及薪資限制提示移除 | not-run | 等待 R1 實作與驗證。 |
| FS-004／FS-005 共用正式年級／班級名稱且 payload 保持數字 | not-run | 等待 R1 實作與跨 Slice 回歸。 |
| 五步、薪資試算、單一申請人、老師、附件、送件與成功狀態 | not-run | R1 後須執行完整回歸，不沿用前一輪報告作為本次證據。 |

## Batch Exceptions

| Batch | Exception | Resolution / Evidence |
|---|---|---|
| AI Verification | 第一次全套 Vitest 中，一個 controlled form 測試以逐字 `user.type()` 輸入時在並行負載下偶發遺失姓名。 | 改用與既有競賽測試一致的一次性 `fireEvent.change()`，提交 `0584ff6`；重新執行全套為 17 files／98 tests passed，Chromium 真實輸入流程亦通過。 |

## Human Integration

- Status: `pending`
- Confirmed By: `pending`
- Confirmed At: `pending`
- Notes: `pending`

## Human Acceptance Instructions

### Preconditions and Test Data

- 啟動可提供 `POST /public/point-estimates/project-participation`、`GET /public/advisors` 與 `POST /public/applications` 的真實後端，前端 `VITE_API_BASE_URL` 指向該服務。
- 準備至少一位可選老師、一組試算後 `isEligible: true` 的過去／當月薪資，以及可選的 `isEligible: false` 測試資料。
- 準備一個不含真實個資、低於 5 MiB 的 PDF／JPEG／PNG 薪資證明。
- 驗收資料不得使用真實學生個資；若後端沒有安全的 409、429、空老師或特定錯誤條件，對應項目標記 `not-run`。

### Browser / Device / Viewport

- 桌面版 Chrome 最新穩定版，建議 1280 × 800。
- Chrome DevTools Responsive Mode，寬度 360px、高度至少 800px。

### Steps and Expected Results

| Step | Action | Expected Result |
|---|---|---|
| 1 | 開啟 `/apply/project-participation`，尚未按「試算點數」前觀察 Network。 | 顯示「計畫與薪資試算」等五步流程、初始一筆空薪資，不顯示「每月 1～50,000 元，最多 12 個不同月份。」提示；不會自動呼叫試算 API。 |
| 2 | 填寫計畫欄位及一至多筆合法薪資，按「試算點數」。 | 只發出一次 JSON request，顯示後端 `totalSalary`、唯讀 `estimatedPoints` 與資格。 |
| 3 | 修改任一薪資月份／金額或增刪薪資列，再按「下一步」。 | 舊試算立即消失且禁止繼續；重新按試算並取得 `isEligible: true` 後才能進入申請人資料。 |
| 4 | 若有安全資料，取得 `isEligible: false`。 | 顯示後端點數及「尚未達最低申請門檻」，不將其顯示為系統錯誤且禁止繼續。 |
| 5 | 填寫姓名、小寫學號、年級、班級、Email、電話，選老師並上傳薪資證明。 | 學號畫面轉大寫；年級顯示「大一～碩二」、班級顯示「甲班～戊班」；只有一位申請人；沒有參與者增刪或申請人指定按鈕；必要附件規則可理解。 |
| 6 | 前往確認頁並使用前面已完成的進度按鈕返回，再逐步前進。 | 四個唯讀摘要完整、不顯示學年度或技術欄位；返回後資料保留，後續步驟不可跳過。 |
| 7 | 開啟 DevTools Network 後正式送件。 | Request 為公開 multipart、含 UUID v4 `Idempotency-Key`、一位 participant、動態學年度、後端試算點數及 `attachments[clientFileKey]`；後端只建立一筆申請。 |
| 8 | 檢查 201 成功畫面與後端紀錄。 | 顯示 publicId、等待指導老師簽核、Asia/Taipei 送件時間及 Email 提醒；不顯示預計簽核日期。 |
| 9 | 在 360px 重做主要欄位與附件操作，並以 Tab／Shift+Tab 操作。 | 無水平捲動；控制項、錯誤、焦點與按鈕可見且可操作。 |
| 10 | 若有安全條件，以相同 Key／相同 request 重試，再以相同 Key／不同 request 測試。 | 相同內容重放同一 201 且後端仍只有一筆；不同內容回 409，前端不再沿用該 Key。 |

### Known Limitations

- 429、真實 Network timeout／gateway 5xx、空老師及 Idempotency conflict 需要後端或測試環境提供安全條件；缺少條件時應如實標記 `not-run`。
- Production build 目前有單一 bundle 大於 500 kB 的非阻擋警告；不影響 FS-005 功能驗收。

## Human Acceptance Result

- Status: `changes-requested`
- Confirmed By: `user`
- Confirmed At: `2026-08-17`
- User Feedback: `將「計畫內容與薪資試算」改為「計畫與薪資試算」、移除薪資限制提示，並讓 FS-005 年級／班級使用 FS-004 的正式代碼對照顯示。`

## Remaining Issues

- 2026-08-17 修訂後 Spec、Plan 與 R1 Commit Plan 等待重新核准。
- R1 尚未實作與重新執行完整 AI Verification。
