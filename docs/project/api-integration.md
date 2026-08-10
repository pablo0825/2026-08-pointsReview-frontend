# 點數審核系統－API 整合設計

- 文件狀態：第一版基準
- 最後更新：2026-08-09
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
- 所有 request 使用 `credentials: "include"`。
- JSON request 自動設定 `Content-Type: application/json`。
- multipart request 交由瀏覽器設定 Boundary。
- State-changing request 取得並帶入 `X-CSRF-Token`。
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

### 5.1 公開點數查詢

- 必須提供 `grade`＋`classNumber`，或至少 2 字元 `keyword`。
- `academicYear` 省略時由後端套用目前學年度。
- 篩選、排序及分頁都放入 Query Key 與 URL Search Params。
- Response 使用 `exhibitionPoints`，不使用 `externalExhibitionPoints`。

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
- Rules：點數規則與人數規則列表、建立新版本、提前停用。
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
| 409 | 關閉操作 Dialog，重新載入最新狀態 |
| 422 | 映射 `fields` 到表單並聚焦第一個錯誤 |
| 429 | 保留資料，提示稍後重試 |
| 5xx／Network | 保留資料，顯示重試 |

Mutation 不自動重試。任何不確定是否已成功的送件、簽名或核准都先重新查詢狀態，不直接重送。

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
