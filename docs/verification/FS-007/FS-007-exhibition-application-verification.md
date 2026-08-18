# FS-007 — Exhibition Application Verification

## Document Information

- Feature Slice: `FS-007`
- Verification Status: `awaiting-human`
- Created: `2026-08-18`
- Last Updated: `2026-08-18`

## Implementation Summary

- 已完成 `/apply/exhibition` 五步公開申請、1～15 位參與者、API 離散點數、固定展覽名稱、老師、必要展覽照片、確認摘要與 idempotent multipart 送件。
- 類型切換會保留參與者與聯絡資料並清除全部點數；422 可依 applicant、participant、typeDetails 及 attachment client key 導回最早相關步驟，規則失效會阻擋流程直到成功重載。
- 完整 required AI Verification 已在 Node `22.23.2` 通過；系統 Node 24 的 undici `File` 與 jsdom constructor realm 不相容會造成既有 multipart Vitest 基線失敗，未改動產品程式碼規避測試 runtime 差異。
- V-006 Firefox／WebKit 為 advisory，現有 Playwright config 只定義 Chromium，因此記錄為 `not-run`；不阻擋 required Chromium release gate。

## Changed Files

| File | Change |
|---|---|
| `src/features/applications/common/components/participants-editor.tsx` | 新增保留既有預設行為的 profile-only 與空點數初始化能力。 |
| `src/features/applications/exhibition/api/**` | 建立展覽規則、Payload、成功 Response、Query 與 multipart snapshot 契約。 |
| `src/features/applications/exhibition/model/**` | 建立 Form Schema、動態學年度、字串正規化、點數 Lookup／清除及 Form-to-Wire Mapper。 |
| `src/features/applications/exhibition/components/**` | 建立展覽資料、參與者離散點數與四區確認摘要元件。 |
| `src/features/applications/exhibition/exhibition-application-page.tsx` | 組合五步流程、規則／老師 Query、附件、錯誤定位、規則失效、離開警告與正式送件狀態。 |
| `src/features/applications/exhibition/**/*.test.ts*` | 覆蓋 Wire、Model、頁面流程、錯誤狀態、multipart、Idempotency 與跨步驟定位。 |
| `src/app/router/**`、`src/test/**` | 以正式 FS-007 頁面取代 placeholder，並註冊 Router、MSW fixtures 與 handlers。 |
| `e2e/exhibition-application.spec.ts` | 覆蓋單人 fan work、多人 project work、類型切換、multipart retry 與 360px 旅程。 |

## AI Verification

| Check ID | Acceptance IDs | Gate | Applicability Evaluation | Command / Method | Result | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| V-001 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | `required` | `always` | `npm run typecheck` | passed | exit code 0 | Node 22.23.2；Strict TypeScript 含 E2E project references。 |
| V-002 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | `required` | `always` | `npm run lint` | passed | exit code 0 | 全專案 ESLint 通過。 |
| V-003 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | `required` | `always` | `npm run test` | passed | 21 files、123 tests passed | Node 22.23.2；含 exhibition、common、competition、project participation 與 Router 回歸。 |
| V-004 | AI-006, AI-007 | `required` | `always` | `npm run build` | passed | exit code 0；504 modules transformed | Vite build 成功；保留單一輸出 chunk 大於 500 kB 的非阻擋 warning。 |
| V-005 | AI-001, AI-002, AI-003, AI-004, AI-005, AI-006, AI-007 | `required` | `always` | `npm run test:e2e -- --project=chromium e2e/exhibition-application.spec.ts e2e/competition-application.spec.ts e2e/project-participation-application.spec.ts` | passed | 13 tests passed | FS-007 3 條、FS-004 6 條、FS-005 4 條；含 360px 與 multipart retry。 |
| V-006 | AI-001, AI-005 | `advisory` | `always` | `npm run test:e2e -- --project=firefox --project=webkit e2e/exhibition-application.spec.ts` | not-run | `playwright.config.ts` 只定義 `chromium` project | 未取得 Firefox／WebKit 補充證據；required Chromium、語意與響應式驗證均已通過，release gate 不受阻擋。 |

## Acceptance Evidence

| Acceptance ID | Result | Supporting Check IDs | Evidence |
|---|---|---|---|
| AI-001 | satisfied | V-001, V-002, V-003, V-005 | 五步順序、返回重驗證、離開警告、鍵盤與 360px 無水平溢出均有 page／Chromium 證據。 |
| AI-002 | satisfied | V-001, V-003, V-005 | 1～15 人、唯一申請人、聯絡資料、學號正規化、重複阻擋，以及隱藏學年度 payload 均已驗證。 |
| AI-003 | satisfied | V-001, V-003, V-005 | 七個 canonical 展覽名稱、other/null、trim／長度、日期順序與未來日期由 Model、Page 與 E2E 覆蓋。 |
| AI-004 | satisfied | V-001, V-003, V-005 | 無 Query 規則、Response Schema、載入／空白／失敗、API 離散點數及類型切換清空均已驗證。 |
| AI-005 | satisfied | V-001, V-003, V-005 | 老師狀態、展覽附件分類、必要照片、四區摘要及技術欄位隱藏均已驗證。 |
| AI-006 | satisfied | V-001, V-003, V-004, V-005 | Payload、公開 multipart、UUID Key、快照重試、422、400、409、429、未知錯誤與 201 成功頁均已驗證。 |
| AI-007 | satisfied | V-001, V-002, V-003, V-004, V-005 | 完整 Vitest、build 與 FS-004／FS-005 Chromium 回歸均通過。 |

## Human Integration

| ID | Requirement | Status | Evidence | Confirmed By | Confirmed At |
|---|---|---|---|---|---|
| HI-001 | 提供已部署 B01、B02、B10、B13 與 canonical Exhibition Payload 的真實後端，完成兩類展覽、多人、安全附件及實際建案確認。 | pending | pending | pending | pending |

## Human Acceptance Instructions

### Context

- Environment / Service: 使用已部署展覽規則、老師與公開申請契約的真實後端測試環境。
- Account / Test Data: 準備不含真實個資的單人／多人資料、兩類有效規則、可選老師及低於 5 MiB 的安全展覽照片。
- Representative Device: 桌面版 Chrome 與 360px Responsive Mode。

### High-Value Scenarios

| Acceptance IDs | Scenario | User Goal | Human Judgment |
|---|---|---|---|
| HA-001 | 在桌面與 360px 完成多人資料、類型切換、點數重選、固定／其他展覽名稱及附件確認。 | 確認五步分工與多人操作能自然完成且不易誤解。 | 判斷資訊層級、清除提示、點數卡片密度及行動版操作感是否符合期待。 |
| HA-002 | 以真實後端各完成一筆 `fan_work` 與 `project_work`，其中一筆為多人。 | 確認正式 multipart 能建立正確且可追蹤的展覽申請。 | 核對後端實際收到的名稱、點數、學年度、老師、照片與成功資訊是否可信且只建案一次。 |

### Known Limitations

- 目前沒有 Firefox／WebKit advisory 自動化證據；真實後端若無安全的錯誤或重放條件，不需人工重做 AI 已涵蓋的錯誤矩陣。

## Human Acceptance Result

- Confirmed By: `pending`
- Confirmed At: `pending`

| Acceptance IDs | Status | User Feedback |
|---|---|---|
| HA-001 | pending | pending |
| HA-002 | pending | pending |

## Remaining Issues

- V-006 Firefox／WebKit 補充流程為 `not-run`；現有設定只提供 Chromium project，release required gate 不受影響。
- HI-001、HA-001 與 HA-002 等待使用者在真實環境確認。
