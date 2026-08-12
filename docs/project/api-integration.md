# 點數審核系統－API 整合設計

- 文件狀態：第一版基準
- 最後更新：2026-08-13
- 相關文件：[前端架構](frontend-architecture.md)、[後端契約異動](backend-contract-changes.md)

## 1. 契約策略

- 第一版後端尚無正式 OpenAPI，前端以 Zod 定義 Request／Response Wire Schema。
- TypeScript 型別由 `z.infer` 產生。
- Form Model、View Model 與 Wire Model 分離，以 Mapper 明確轉換。
- 後端契約變更必須先更新 Zod Schema、契約測試與本文件，再修改畫面。

## 2. 共用 Response

成功：

```json
{
  "data": {}
}
```

分頁：

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

錯誤：

```json
{
  "code": "validation_failed",
  "message": "輸入資料格式不正確。",
  "fields": [
    {
      "path": "participants.0.studentNumber",
      "message": "學號為必填欄位。"
    }
  ]
}
```

`fields` 只在有欄位資訊時出現。前端以穩定 `code` 判斷行為，以 `message` 顯示可讀內容。

## 3. API Client 責任

- Base URL 由環境設定提供。
- 除另有端點契約外，request 使用 `credentials: "include"`；未登入公開送件 `POST /public/applications` 明確使用 `credentials: "omit"`，不依賴 Session Cookie。
- JSON request 自動設定 `Content-Type: application/json`。
- multipart request 交由瀏覽器設定 Boundary。
- 依賴登入 Session Cookie 的 state-changing request 取得並帶入 `X-CSRF-Token`；未登入公開送件 `POST /public/applications` 不取得或攜帶 CSRF Token。
- 解析非 2xx Error Body；無法解析時轉為安全的 `unexpected_response`。
- 支援 `AbortSignal`，讓 Query 取消過期 request。
- 不在 Log 輸出完整 Payload、Token、附件、簽名或個資。

## 4. Auth API

| Method | Endpoint | 前端用途 |
| --- | --- | --- |
| POST | `/auth/login` | Email／密碼登入 |
| POST | `/auth/logout` | 登出並清除受保護 Cache |
| GET | `/auth/me` | 取得使用者、角色、權限 |
| GET | `/auth/csrf-token` | 取得 Session 綁定 CSRF Token |
| POST | `/auth/activation/:token` | 首次啟用與設定密碼 |
| POST | `/auth/password-reset/request` | 申請密碼重設 |
| POST | `/auth/password-reset/:token` | 設定新密碼 |

401 時清除 `/auth/me` 與受保護 Query Cache。返回網址只保存站內相對路徑。

## 5. 公開 API

| Method | Endpoint | 用途 |
| --- | --- | --- |
| GET | `/public/advisors` | 可選老師與本機搜尋資料 |
| GET | `/public/application-instructions` | 年度已發布規則文件 |
| GET | `/public/competition-point-options` | 競賽有效規則 |
| GET | `/public/exhibition-point-options` | 展覽離散點數 |
| POST | `/public/point-estimates/project-participation` | 參與計畫預估 |
| GET | `/public/point-estimates/certificate` | 證照點數與上限提示 |
| POST | `/public/applications` | multipart 正式送件 |
| GET | `/public/applications/revisions/:token` | 取得補件草稿 |
| POST | `/public/applications/revisions/:token` | multipart 補件重送 |
| GET | `/public/student-points` | 遮罩後公開點數 |

第一版不提供公開參與人數規則 API。各申請類型使用 `application-rules.md` 定義的固定人數限制，正式送件與補件仍由後端驗證；動態人數規則 API 留待第二版另行定義。

`POST /public/applications` 是未登入公開送件 API。前端直接送出 multipart request，不帶 Session Cookie 或 `X-CSRF-Token`；後端以 IP Rate Limit、Payload Schema、點數規則及附件驗證保護此端點。此例外不代表 Token 型補件 API 使用相同契約，`POST /public/applications/revisions/:token` 需於 `FS-008` 另行確認。

### 5.1 公開點數查詢

- 必須提供 `grade`＋`classNumber`，或至少 2 字元 `keyword`。
- `academicYear` 省略時由後端套用目前學年度。
- 篩選、排序及分頁都放入 Query Key 與 URL Search Params。
- Response 使用 `exhibitionPoints`，不使用 `externalExhibitionPoints`。

### 5.2 公開申請辦法

`GET /public/application-instructions` 使用下列 Query Parameters：

| Parameter | Required | Format | Behavior |
| --- | --- | --- | --- |
| `applicationType` | 是 | `competition`、`project_participation`、`certificate`、`exhibition` | 限制回傳指定申請類型的公開辦法 |
| `academicYear` | 否 | 民國學年度字串，例如 `"114"` | 提供時只回傳指定學年度；省略時回傳該申請類型的所有可見學年度 |

例如：

```http
GET /public/application-instructions?applicationType=competition&academicYear=114
```

省略 `academicYear`：

```http
GET /public/application-instructions?applicationType=competition
```

成功 Response 使用陣列：

```json
{
  "data": [
    {
      "academicYear": "115",
      "revisionNumber": 1,
      "sectionKey": "competition_rules",
      "title": "競賽成果申請辦法",
      "content": "辦法內容……",
      "displayOrder": 1,
      "effectiveFrom": "2026-08-01",
      "effectiveTo": null
    },
    {
      "academicYear": "114",
      "revisionNumber": 2,
      "sectionKey": "competition_rules",
      "title": "競賽成果申請辦法",
      "content": "辦法內容……",
      "displayOrder": 1,
      "effectiveFrom": "2025-08-01",
      "effectiveTo": "2026-07-31"
    }
  ]
}
```

每筆資料包含：

- `academicYear`：民國學年度字串。
- `revisionNumber`：修訂版號數字。
- `sectionKey`：section 的穩定識別字串。
- `title`：section 標題。
- `content`：Markdown 內容。
- `displayOrder`：同一 `applicationType` 與 `academicYear` 內的 section 顯示順序數字；後端依此欄位升冪排列 Response。
- `effectiveFrom`：`YYYY-MM-DD` 生效日期字串。
- `effectiveTo`：`YYYY-MM-DD` 失效日期字串或 `null`。

同一 `applicationType` 與 `academicYear` 可以包含多筆 sections；後端保證 Response 已依 `displayOrder` 由小到大排列，前端保留 API 陣列順序，不自行排序。省略 `academicYear` 時，Response 可用來取得該 `applicationType` 的所有公開學年度及其 sections；提供 `academicYear` 時，`data` 只包含該學年度的 sections。前端仍須以 Zod 驗證每筆資料，並在呈現前清理 Markdown。

查無符合條件的公開 sections 時，後端固定回傳 `HTTP 200 OK` 與空陣列，不回傳 `404`：

```json
{
  "data": []
}
```

公開端點的後端查詢只回傳符合 `status = published`、`isVisible = true`，且 `effectiveFrom` 不晚於 Asia/Taipei 當日的 sections。公開 Response 不提供 `status` 或 `isVisible` 管理欄位，前端直接信任公開端點的篩選結果，不自行判斷發布、可見或生效狀態。

目前後端不使用 `effectiveTo` 排除內容，因此只能保證回傳內容「已發布、可見且已生效」，不能保證內容尚未超過失效日期。前端不依 `effectiveTo` 自行排除 API 已回傳的 section；即使 `effectiveTo` 早於今天，仍依 Response 呈現並安全清理 Markdown。

## 6. 正式申請 multipart

`payload` 為 JSON 字串，檔案欄位使用 `attachments[{clientFileKey}]`。每個 metadata 必須剛好對應一個檔案。

```typescript
const formData = new FormData();
formData.set("payload", JSON.stringify(payload));

for (const attachment of attachments) {
  formData.set(
    `attachments[${attachment.clientFileKey}]`,
    attachment.file,
  );
}
```

前端送出前驗證 Key 唯一、metadata 與檔案一一對應。後端仍重新驗證所有檔案與資料。

所有申請 Mapper 在建立 Wire Payload 前，必須將每筆 `participants[].studentNumber` trim 後轉成大寫，再以正規化值檢查同一 request 內的重複學號。正式送件與補件後端必須再次執行相同正規化，不信任前端；欄位錯誤路徑維持 `participants.<index>.studentNumber`。

### 6.1 正式申請 Idempotency

- `POST /public/applications` 必須帶入 UUID v4 `Idempotency-Key`；每次新的邏輯送件以 `crypto.randomUUID()` 產生新 Key。
- Network Error、timeout、連線中斷或未收到明確 Response 時，前端保留原 Key 與不可變 request 快照；由使用者確認重試後，必須沿用相同 Key、payload、附件內容、檔名、MIME type 與 `clientFileKey`。
- 第一次 request 若已成功，後端以相同 Key 與內容重放原本的 `201` Response，不重複建立案件、附件或 Email 通知。
- 收到明確 `201` 後清除 Key 並顯示成功頁；使用者修改 payload 或附件時丟棄原 Key 與快照，下一次送件使用新 Key。
- Key 缺少或不是 UUID v4 時，後端回傳 `422 validation_failed`，欄位路徑為 `headers.idempotency-key`。
- 相同 Key 搭配不同 payload 或附件時，後端回傳 `409 idempotency_key_conflict`；前端停止使用該 Key，返回表單確認內容，下一次送件產生新 Key。
- Idempotent retry 仍計入同一 IP 每小時 20 次的 Rate Limit；前端不自動重試。

## 7. 老師 API

| Method | Endpoint | 用途 |
| --- | --- | --- |
| GET | `/advisor/applications/pending` | 待簽列表 |
| GET | `/advisor/applications/pending/:publicId` | 待簽詳情 |
| POST | `/advisor/applications/pending/:publicId/approve` | 簽名同意 multipart |
| POST | `/advisor/applications/pending/:publicId/reject` | 拒絕及原因 |
| GET | `/advisor/applications/history` | 歷史列表 |
| GET | `/advisor/applications/history/:publicId` | 歷史詳情 |

簽名 request 包含 PNG `signature` 及目前 `confirmVersionNumber`。409 時清除詳情舊資料並重新查詢。

## 8. 承辦人 API

| Method | Endpoint | 用途 |
| --- | --- | --- |
| GET | `/reviewer/applications/review` | 兩種未結案工作佇列 |
| GET | `/reviewer/applications/review/:publicId` | 審核詳情 |
| POST | `/reviewer/applications/review/:publicId/request-revision` | 要求補件 |
| POST | `/reviewer/applications/review/:publicId/extend-revision` | 延長補件 |
| POST | `/reviewer/applications/review/:publicId/approve` | 核准及可選調整 |
| POST | `/reviewer/applications/review/:publicId/reject` | 最終不核准 |
| GET | `/reviewer/applications/history` | 歷史列表 |
| GET | `/reviewer/applications/history/:publicId` | 歷史詳情 |

### 8.1 工作佇列 Status

- `status=under_review`：待審核頁籤。
- `status=needs_revision`：補件中頁籤。
- 省略 `status`：回傳兩種未結案案件。
- 其他值：422。

### 8.2 核准 Request

- 無調整：只傳 `confirmVersionNumber`，`reason` 為 `null`。
- 有調整：傳完整 Participants、核定總點數、類型可調整資料及非空白原因。
- 前端摘要只是確認；後端必須重算及驗證。

## 9. 管理員 API

前端依導覽分組整合：

- Users：列表、詳情、建立、更新、啟用、停用、啟用信、重設密碼、管理員移交。
- Advisors：列表、建立、更新、啟用、停用、指派主任。
- Rules：點數規則列表、建立新版本、提前停用。
- Instructions：列表、草稿、Revision、發布、顯示與隱藏。
- Applications：全部列表與唯讀詳情。
- Transactions：學生點數流水帳查詢。

管理員申請頁不呼叫承辦人 Mutation。

## 10. 私有檔案

老師、承辦人與管理員使用各自角色 Endpoint 讀取附件或簽名。Response 是檔案 Stream，不是 JSON。

- 依 `Content-Type` 決定安全 inline 預覽或下載。
- 401／403／404 顯示對應狀態，不顯示 storage key。
- 取得的 Blob URL 在元件卸載時釋放。
- 每次查看由後端記錄稽核。

## 11. Error 對應

| HTTP | 前端行為 |
| --- | --- |
| 400 | 顯示業務錯誤，能可靠定位時標示欄位 |
| 401 | 清除登入 Cache，導向登入並保留安全返回路徑 |
| 403 | 顯示權限不足 |
| 404 | 顯示不存在、不可揭露或 Token 失效 |
| 409 | 依穩定 `code` 處理；`idempotency_key_conflict` 廢棄原 Key 並返回表單確認，後台併發衝突則關閉操作 Dialog 並重新載入最新狀態 |
| 422 | 映射 `fields` 到表單並聚焦第一個錯誤 |
| 429 | 保留資料，提示稍後重試 |
| 5xx／Network | 保留資料，顯示重試 |

Mutation 不自動重試。公開正式送件結果不確定時，因第一版沒有學生進度查詢 API，僅允許使用者以相同 `Idempotency-Key` 與完全相同的不可變 request 快照重新確認同一次送件；簽名、核准及其他沒有已確認 Idempotency 契約的 Mutation 仍先重新查詢狀態，不直接重送。

## 12. Query Key 範例

```typescript
const reviewerKeys = {
  all: ["reviewer", "applications"] as const,
  queue: (status: "under_review" | "needs_revision", filters: object) =>
    [...reviewerKeys.all, "review", status, filters] as const,
  detail: (publicId: string) =>
    [...reviewerKeys.all, "detail", publicId] as const,
  history: (filters: object) =>
    [...reviewerKeys.all, "history", filters] as const,
};
```

Filter Object 必須先正規化，避免屬性順序或空值造成不必要的重複 Cache。
