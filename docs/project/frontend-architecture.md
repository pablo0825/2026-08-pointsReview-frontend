# 點數審核系統－前端架構設計

- 文件狀態：第一版基準
- 最後更新：2026-08-11
- 相關文件：[路由與頁面](routes-and-pages.md)、[API 整合](api-integration.md)、[測試策略](testing-strategy.md)

## 1. 架構目標

- 讓四類申請共用流程與元件，但不以大量條件判斷混成單一巨大表單。
- 明確分離 API Wire Model、表單 Model 與畫面 View Model。
- 以 TanStack Query 管理伺服器狀態，以 React Hook Form 管理表單狀態。
- 不引入額外全域狀態函式庫，除非後續出現跨路由、非伺服器且非表單的共享狀態。
- 安全處理公開個資、Session、CSRF、附件、簽名與 Markdown。

## 2. 建議目錄

```text
src/
├─ app/
│  ├─ router/
│  ├─ providers/
│  ├─ layouts/
│  └─ error-boundaries/
├─ features/
│  ├─ applications/
│  │  ├─ common/
│  │  ├─ competition/
│  │  ├─ project-participation/
│  │  ├─ certificate/
│  │  └─ exhibition/
│  ├─ advisors/
│  ├─ auth/
│  ├─ reviewer/
│  ├─ admin/
│  ├─ public-points/
│  └─ rules/
├─ shared/
│  ├─ api/
│  ├─ auth/
│  ├─ config/
│  ├─ constants/
│  ├─ lib/
│  ├─ ui/
│  └─ validation/
├─ test/
└─ main.tsx
```

功能專屬元件、Schema、Mapper、Query 與測試留在對應 Feature；只有實際被多個 Feature 使用的內容才提升至 `shared`。

## 3. 應用程式 Provider

根節點依序提供：

1. Error Boundary。
2. TanStack Query Client。
3. Authentication Context（以 `/auth/me` Query 為來源）。
4. Router。
5. 全域通知與 Dialog Portal。

Authentication Context 不複製使用者資料成另一份永久狀態，只包裝 Query 結果與角色／權限 Helper。

## 4. 狀態所有權

| 狀態 | 工具 | 原則 |
| --- | --- | --- |
| API 資料 | TanStack Query | Query Cache 是唯一伺服器狀態來源 |
| 申請／管理表單 | React Hook Form | Zod Resolver 驗證 |
| URL 篩選與分頁 | React Router Search Params | 可返回、重新整理與分享 |
| Dialog、展開狀態 | React local state | 不放入全域 Store |
| 未送出申請 | React 記憶體 | 第一版不持久化 |

## 5. 申請表架構

- 共用 `ApplicationWizard` 負責步驟、離開警告、預覽及送件狀態。
- 各類型提供自己的 `typeDetails` Schema、預設值、步驟內容、點數計算與 Mapper。
- 共用參與者、老師與附件元件不得知道類型專屬後端資料表。
- 使用 Discriminated Union 表示四種表單及 API payload。
- 學年度、申請人及參與者一致性集中在共用 Mapper 驗證。
- 切換步驟不觸發 API 建立；正式送出只有一次 Mutation。

## 6. 點數運算

- API 點數一律是兩位小數字串。
- 前端解析為百分之一點的整數，例如 `"10.00" -> 1000`、`"0.50" -> 50`。
- 加總、比較、是否為 0.5 倍數等操作只使用整數。
- 格式化 Helper 統一輸出兩位小數字串。
- 薪資使用安全整數元；超過 JavaScript Safe Integer 時停止計算並顯示驗證錯誤。

## 7. TanStack Query

- Query Key Factory 依角色及資源分組。
- Key 包含所有影響結果的狀態、篩選、排序與分頁。
- Mutation 成功後只 invalidate 受影響資源，不清空整個 Cache。
- 審核狀態改變時同步使待審、補件中及歷史列表失效。
- Mutation 不自動重試，避免重複送件、簽名或核准。
- GET 可針對網路或 5xx 做有限重試；401、403、404、409、422 不自動重試。
- 規則與老師清單可以合理設定 Stale Time，但正式送件仍由後端重新驗證。

## 8. 表單與驗證

- 表單 Schema 驗證輸入格式、必填、跨欄位及當前公開規則可得的即時限制。
- API Schema 驗證 Wire Contract，與表單 Schema 分開。
- 後端 `fields[].path` 轉成 React Hook Form Path，無法可靠對應時顯示表單層級錯誤。
- 多步表單下一步只驗證該步相關欄位；最後送出前驗證完整 Schema。
- 動態陣列使用穩定 Client Key，不使用畫面 index 作為 React Key。

## 9. API Client

- 預設 `credentials: "include"`，Session Token 不進入 JavaScript。
- State-changing request 自動加入 `X-CSRF-Token`。
- 支援 JSON 與 multipart，但不手動設定 multipart `Content-Type` Boundary。
- 統一解析成功 envelope、API Error 與 Zod Response 錯誤。
- 401 使 `/auth/me` Cache 失效並導向登入。
- Safe Return URL 只能接受相對站內路徑，防止 Open Redirect。

## 10. 檔案與簽名

- 檔案先在前端檢查數量、大小、副檔名與瀏覽器 MIME，後端驗證實際內容。
- 預覽 Blob URL 使用後立即 `URL.revokeObjectURL`。
- 私有附件與簽名透過認證 API 取得，不在 HTML 暴露 storage key。
- 手寫簽名只保存在 Dialog 記憶體；送出成功或離開頁面後清除。
- Canvas Resize 必須保留筆跡，避免手機旋轉或 Dialog 尺寸改變清空簽名。

## 11. 安全與隱私

- 不將學生個資、申請內容、Token 或簽名寫入 Local Storage、Session Storage、IndexedDB 或 URL。
- Markdown 使用 Sanitizer 允許清單，禁止 Script、事件 Handler 與危險 URL。
- 錯誤畫面不顯示 Request Payload、內部 ID、SQL、Stack Trace 或 Token。
- Query Devtools 只在開發環境啟用。
- 公開頁不依賴前端遮罩；只顯示後端已遮罩欄位。
- 登出及角色變更清除受保護 Query Cache。

## 12. 樣式架構

- Tailwind CSS 是專案預設且標準的樣式方案；頁面與元件原則上在 JSX／TSX 使用 utility classes。
- 響應式樣式採 Mobile First，先定義窄螢幕基準，再使用 breakpoint utilities 擴充較寬版面。
- `src/app/styles/global.css` 是 Tailwind 入口，只保存 Tailwind 載入設定、專案共用 theme／design tokens、瀏覽器層級基礎樣式，以及無法由元件局部管理的必要全域行為。
- 不以 CSS Modules 作為預設方案。只有複雜互動、第三方元件整合、瀏覽器特殊行為，或 utilities 明顯不適合表達時，才使用 feature-local 自訂 CSS。
- 可重用的視覺模式以具語意的 React 元件封裝；只有實際被多個 Feature 使用後才提升至 `shared/ui`。
- 導入 Tailwind 不代表建立完整 Design System，也不得自行新增未經需求確認的品牌、色彩或視覺規格。
- 專案文件不固定 Tailwind 套件版本；實作時選擇彼此相容的版本，並由 `package-lock.json` 鎖定實際安裝結果。

## 13. 無障礙與響應式

- 使用語意 HTML、可見 Label 與原生控制項優先。
- Dialog 使用符合 WAI-ARIA 行為的元件實作焦點鎖定與返回。
- 非同步狀態、錯誤摘要與成功訊息使用適當 Live Region。
- 表格在手機改為卡片時保留欄位標籤及閱讀順序。
- 主要操作不只靠 Hover，支援鍵盤、觸控與 200% 放大。

## 14. 錯誤邊界

- Route Error Boundary 處理頁面載入失敗。
- Feature 內 Query Error State 提供重試。
- Mutation Error 留在操作上下文，保留使用者輸入。
- API Contract Parse Error 視為系統整合錯誤，對使用者顯示一般訊息，開發環境記錄不含敏感資料的摘要。

## 15. 未來演進

- 後端提供 OpenAPI 後評估產生 Wire Type 與 Client。
- 第二版草稿功能必須使用受控 Token 或登入後端儲存，不直接持久化個資。
- 資料量增加後，老師搜尋與後台列表可加入伺服器搜尋及虛擬化。
- 核准後點數異動啟用時，以新 Feature 實作，不混入第一版核准流程。
