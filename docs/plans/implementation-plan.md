# 點數審核系統－前端實作計畫

- 文件狀態：第一版執行基準
- 最後更新：2026-08-09
- 相關文件：
  - [產品需求](../specs/product-requirements.md)
  - [申請規則](../specs/application-rules.md)
  - [流程與權限](../specs/workflows-and-permissions.md)
  - [路由與頁面](../design/routes-and-pages.md)
  - [前端架構](../design/frontend-architecture.md)
  - [API 整合](../design/api-integration.md)
  - [測試策略](../design/testing-strategy.md)
  - [後端契約同步清單](../specs/backend-contract-changes.md)

## 1. 執行原則

- 以可操作的垂直功能切片開發，不先建立大量尚未使用的抽象層。
- 每階段都包含畫面、API／MSW、錯誤狀態、無障礙及測試。
- 後端尚未完成的契約以最終 Zod Schema 與 MSW 開發，真實串接前不得視為完成。
- 不在第一版範圍內實作草稿、學生進度查詢、自助撤回、案件指派或核准後點數異動。
- 每個 Commit 保持單一目的；文件、基礎架構與功能實作不混成無法審查的大型 Commit。

## 2. Phase 0：專案初始化

### 工作

- 使用 Vite 建立 React + TypeScript 專案。
- 安裝及設定 React Router、TanStack Query、React Hook Form、Zod。
- 設定 Vitest、Testing Library、MSW、Playwright。
- 設定 TypeScript Strict、Lint、Format、Build 及測試 Scripts。
- 建立 `src/app`、`src/features`、`src/shared`、`src/test` 基本目錄。
- 建立環境設定驗證，至少包含 API Base URL 與前端公開 URL。
- 建立 CI 基礎工作：Typecheck、Lint、Unit／Component Test、Build。

### 驗收

- Development Server 可啟動。
- Production Build 成功。
- 範例單元、元件、MSW 與 Playwright Smoke Test 可執行。
- 未設定必要環境變數時提供明確錯誤。

### 建議 Commit

```text
chore: bootstrap React frontend and test tooling
```

## 3. Phase 1：應用程式骨架與共用基礎

### 工作

- 建立 Router、公開 Layout、後台 Layout、角色 Guard、403／404／通用錯誤頁。
- 建立 Query Client、Query Key Factory 基礎及 React Query Devtools 開發環境設定。
- 建立 API Client、成功／錯誤 Envelope、Zod Response Parser、CSRF 支援。
- 建立共用 UI：Button、Input、Select、Radio、Checkbox、Textarea、Dialog、Alert、Table／Card、Pagination、Skeleton、Empty State。
- 建立無障礙表單錯誤摘要、Focus Helper、Live Region。
- 建立點數整數最小單位、日期、學年度、年級、班級與老師職稱 Helper。

### 測試

- API Error Mapping。
- 點數與日期 Helper。
- Route 403／404。
- Dialog 焦點與鍵盤行為。

### 驗收

- 所有後續 Feature 可共用一致 API、錯誤及 UI 基礎。
- 不含個資的共用元件具備鍵盤與 360px 基本驗證。

### 建議 Commits

```text
feat: add application shell and role-aware routing
feat: add API client and shared UI primitives
```

## 4. Phase 2：登入與帳號流程

### 工作

- `/login` Email／密碼表單。
- `/auth/me` 使用者、角色與權限載入。
- HttpOnly Cookie、CSRF Token 取得與 Mutation Header。
- 登出、401 清理 Cache、安全 Return URL。
- 首次啟用、申請密碼重設與設定新密碼頁。
- 登入後依角色導向；待簽深連結返回原頁。

### 測試

- 成功／失敗登入、停用帳號、401、403。
- Open Redirect 防護。
- 老師深連結登入返回。

### 驗收

- 三種後台角色只能進入自己可用的 Route。
- Session Token 不出現在前端儲存或 JavaScript Response。

### 建議 Commit

```text
feat: implement authentication and role routing
```

## 5. Phase 3：公開規則、老師與點數查詢

### 工作

- `/rules` 學年度選擇、已發布 Markdown、Sanitizer、目錄。
- `/points` 受限條件表單、URL Query、分頁、排序及遮罩結果。
- 公開老師 Query、職稱對照及姓名／職稱／系所本機搜尋元件。
- 四種類型入口 `/apply` 卡片及規則連結。

### 後端依賴

- `exhibitionPoints` 欄位。
- 公開點數最低查詢條件。
- 展覽 `applicationType=exhibition`。

### 測試

- Markdown XSS Fixture。
- 點數條件不足時不呼叫 API。
- 老師搜尋不顯示主任身份。
- 360px 卡片與桌面表格。

### 驗收

- 公開訪客可安全閱讀規則並在合法條件下查詢點數。
- 公開頁不接觸完整姓名、學號或私有檔案。

### 建議 Commit

```text
feat: add public rules advisors and points pages
```

## 6. Phase 4：申請 Wizard 共用骨架

### 工作

- 建立五步 `ApplicationWizard`、步驟驗證、預覽返回與離開警告。
- 建立共用學生／參與者 Field Array、唯一申請人及共用學年度。
- 建立申請人 Email／電話、老師選擇及附件 Metadata 元件。
- 建立 Form Model、Discriminated Union 與共用 Payload Mapper。
- 建立附件檔案檢查、Preview、Object URL 清理與 multipart Builder。
- 建立成功頁及重複送件防護。

### 測試

- 步驟切換、資料保留、離開警告。
- 多人新增／移除、重複學號、申請人唯一。
- 附件上限、格式、大小、分類及最低要求。
- 422 返回正確步驟並聚焦欄位。

### 驗收

- 可使用 MSW 送出一份最小共用申請 Payload。
- 重新整理不恢復個資，正常步驟切換不遺失資料。

### 建議 Commits

```text
feat: add public application wizard foundation
feat: add participants advisors and attachments steps
```

## 7. Phase 5：四種類型申請

### 5.1 競賽

- 公開競賽規則 Query。
- `per_person` 唯讀固定點數。
- `shared_total` 0.5 單位手動分配、動態人數上限、剩餘點數。
- 日期、獎項與類型資料。

### 5.2 參與計畫

- 計畫欄位、唯一月份 Field Array、正整數薪資。
- 公開預估 API 與前端即時顯示。
- 未滿 1,000 元阻擋送件。

### 5.3 證照

- 證照資料與非未來日期。
- 公開固定點數與累積上限提示。
- 重複證照業務錯誤顯示。

### 5.4 展覽

- `applicationType=exhibition`。
- `allowedPointsPerPerson` 離散選項。
- 展覽名稱 Other、日期與多人點數。

### 測試與驗收

- 每種類型至少一組完整 Component Flow 與 Playwright 送件流程。
- 所有點數比較使用整數最小單位。
- 找不到有效規則時不得使用本機預設值送件。

### 建議 Commits

```text
feat: implement competition application flow
feat: implement project participation application flow
feat: implement certificate application flow
feat: implement exhibition application flow
```

## 8. Phase 6：補件流程

### 工作

- 驗證補件 Token，處理無效、過期與已使用狀態。
- 以目前版本初始化同一套 Wizard。
- 鎖定 `applicationType` 與 `advisorId`。
- 顯示補件原因、期限及保留附件。
- 管理 `retainedAttachmentPublicIds` 與新上傳附件。
- 重新提交後顯示新版本與 `pending_advisor`。

### 後端依賴

- 補件 API 禁止修改 `advisorId`。

### 測試與驗收

- 補件不能換類型或老師。
- 舊附件保留／移除與新附件配對正確。
- 過期 Token 不顯示可編輯表單。

### 建議 Commit

```text
feat: implement revision resubmission workflow
```

## 9. Phase 7：指導老師工作區

### 工作

- 待簽與歷史列表、期限排序及到期警示。
- 詳情、私有附件、版本摘要與審核時間軸。
- 老師拒絕 Dialog。
- 手寫簽名 Canvas、桌面 Modal、手機全螢幕 Dialog。
- PNG 尺寸／大小驗證、空白判斷、筆跡保留與清理。
- `confirmVersionNumber`、409 重新載入及成功導向。

### 後端依賴

- 後端簽名浮水印合成與私有讀取。

### 測試與驗收

- Email 深連結登入返回。
- 滑鼠、觸控及手機 Viewport 簽名。
- 空白、過大、逾期、版本衝突及重複送出。
- 簽名成功後申請離開待簽列表。

### 建議 Commit

```text
feat: implement advisor review and signature workflow
```

## 10. Phase 8：承辦人工作區

### 工作

- `under_review`、`needs_revision` 頁籤與伺服器分頁。
- 審核／歷史列表及詳情。
- 申請值、規則值、核定值比較面板。
- 各類型核定限制及完整 Approve Payload。
- 要求補件、延長期限、最終不核准及核准 Dialog。
- Mutation 後精準 Invalidation。
- 多承辦人 409 處理。

### 後端依賴

- Review Queue `status` Query。
- `needs_revision` 可人工 Reject。
- 核定不得為 0。

### 測試與驗收

- 兩頁籤分頁與總數正確。
- 有調整時原因必填；四類核定限制正確。
- 補件中不允許核准或再次要求補件。
- 同時操作時第二位不會重複核准。

### 建議 Commit

```text
feat: implement reviewer queues and application review
```

## 11. Phase 9：管理員功能

### 工作順序

1. 申請與點數流水帳唯讀查詢。
2. 使用者帳號管理。
3. 指導老師與主任管理。
4. 點數規則管理。
5. 參與人數規則管理。
6. 年度申請辦法草稿、Revision、發布與顯示管理。

### 原則

- 每個寫入操作使用確認 Dialog、CSRF 與權限檢查。
- 有效期間與規則版本不允許用前端直接覆蓋歷史。
- 管理員申請頁不出現審核 Mutation。

### 測試與驗收

- 唯一啟用管理員、唯一主任與規則期間衝突錯誤。
- Draft 才能修改，已發布內容建立新 Revision。
- 查看附件及簽名走私有 API。

### 建議 Commits

```text
feat: add admin application and transaction views
feat: add admin user and advisor management
feat: add admin rule and instruction management
```

## 12. Phase 10：整合、品質與發布準備

### 工作

- 將 MSW 核心 Playwright 改接後端測試環境。
- 建立測試 Seed／Factory、測試收件匣及可控逾期設定。
- 跑完整學生送件、老師簽名、承辦核准、公開結果流程。
- 跑補件、重新簽名、拒絕、逾期、409 與權限流程。
- Chrome、Firefox、WebKit、360px、200% Zoom 與鍵盤測試。
- 檢查 Bundle、錯誤監控接點、環境設定、Cache Header 與部署文件。
- 完成後端契約同步清單的逐項驗收。

### 驗收

- Typecheck、Lint、全部 Vitest／Testing Library、三瀏覽器關鍵 Playwright、Production Build 全部通過。
- 沒有已知高風險權限、個資、點數或狀態錯誤。
- 第一版不包含項目沒有意外出現在 UI 或 Route。

### 建議 Commit

```text
test: add full application review end-to-end coverage
chore: prepare frontend for production release
```

## 13. 後端依賴 Gate

| Gate | 必須完成的後端契約 | 阻擋階段 |
| --- | --- | --- |
| G1 | `exhibition` 命名、公開展覽端點、公開點數欄位 | Phase 3、5 |
| G2 | 競賽 0.5 單位、日期、薪資、證照重複等規則 | Phase 5 真實串接 |
| G3 | 補件不可換老師 | Phase 6 真實串接 |
| G4 | 簽名浮水印 | Phase 7 驗收 |
| G5 | Reviewer Status Query、補件中 Reject、核定不得為 0 | Phase 8 真實串接 |
| G6 | 公開點數最低查詢條件 | Phase 3 驗收 |

Gate 未完成時可使用 MSW 開發，但不得將該階段標記為真實串接完成。

## 14. Definition of Done

每個功能完成必須同時符合：

- 需求與 API 契約已對應。
- Loading、Empty、Error、Success 與權限狀態已處理。
- 360px、鍵盤與基本螢幕閱讀器行為已檢查。
- 沒有將個資、Token、附件或簽名寫入不允許的儲存或 Log。
- 單元與元件測試完成；關鍵流程有 Playwright。
- Typecheck、Lint、Test、Build 通過。
- 文件或後端同步清單在契約改變時已更新。

## 15. Commit 策略

- 使用 Conventional Commits。
- 一個 Commit 只包含一個可說明的基礎或功能切片。
- 不把自動格式化大量無關檔案混入功能 Commit。
- 不在功能 Commit 中改寫既有需求決策；需求變更先更新文件。
- 每個 Phase 可由多個原子 Commit 組成，不要求一個 Phase 只有一個 Commit。
