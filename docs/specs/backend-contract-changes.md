# 後端契約同步清單

- 文件狀態：待後端專案逐項同步
- 最後更新：2026-08-09
- 用途：記錄前端需求討論後，與既有後端文件或實作計畫不同的契約。
- 相關文件：[申請規則](application-rules.md)、[流程與權限](workflows-and-permissions.md)、[API 整合](../design/api-integration.md)

## 1. 使用方式

- 本文件不是後端 Migration 或實作替代品。
- 每項完成時應同步更新後端 Schema、Service 驗證、API 文件、測試與 Seed。
- 前端在後端契約未完成前，可用 MSW 依最終契約開發，但真實串接測試必須等待對應項目完成。

## 2. 必須同步的契約

### B01 展覽申請命名

**決策**

- 中文名稱改為「展覽申請」，同時涵蓋校內與校外展。
- `applicationType`／`pointCategory` 使用 `exhibition`，不再使用 `external_exhibition`。
- 公開點數 Response 使用 `exhibitionPoints`，不再使用 `externalExhibitionPoints`。

**後端影響**

- Request／Response Schema、Zod Enum、Service、資料庫 CHECK／View、Migration、Seed、Email、文件及測試。

### B02 展覽公開離散點數欄位

**決策**

```json
{
  "exhibitionType": "fan_work",
  "allowedPointsPerPerson": ["0.50", "1.00"]
}
```

- 公開 API 不回傳最小值與最大值。
- 管理端仍可保留 `minimumPointsPerPerson`、`maximumPointsPerPerson`。
- 後端將端點轉成去重陣列，正式送件與核准只接受端點值。

### B03 競賽點數最小單位

**決策**

- `shared_total` 每位參與者點數必須大於 0 且為 0.5 的倍數。
- 合計精確等於總點數。
- 實際最多人數為人數規則上限與 `FLOOR(total / 0.5)` 的較小值。
- 第一版不接受 `other_award`。

**後端影響**

- Competition Domain、送件、補件、核准、公開選項文件與測試。

### B04 核定點數不得為零

**決策**

- 所有 `approvedPoints` 必須大於 0 且符合類型規則。
- 承辦人不能以 0 點核准參與者。
- 若參與者不應取得點數，應補件修正或整筆不核准。

**現有衝突**

- 後端流程文件中「最低可調整為 0」的敘述需移除。

### B05 補件不可更換指導老師

**決策**

- 補件不能改變 `applicationType` 或 `advisorId`。
- 要更換老師只能重新建立申請。

**現有衝突**

- 既有補件 API 文件允許改變 `advisorId`，需修改 Request 驗證及 Service。

### B06 承辦人工作佇列 Status Query

**決策**

```text
GET /reviewer/applications/review?status=under_review
GET /reviewer/applications/review?status=needs_revision
```

- `status` 省略時回傳兩種未結案案件。
- 其他值回傳 422。
- Status 必須在分頁前由後端篩選，分頁總數只計算篩選結果。

### B07 補件中可人工最終不核准

**決策**

- 允許 `needs_revision -> rejected`，原因必填。
- 用於申請人要求結束或承辦人判定不再等待補件。
- `needs_revision` 仍不可直接核准或再次要求補件。

**後端影響**

- Reject Service 狀態白名單、狀態圖、審核操作、Email 與測試。

### B08 公開點數查詢最低條件

**決策**

- 必須同時提供 `grade`＋`classNumber`，或 trim 後至少 2 字元 `keyword`。
- 只有學年度、只有年級或只有班級回傳 422。
- 條件可組合使用。

**後端影響**

- Public Query Zod、API 文件、整合測試及 Rate Limit 評估。

### B09 簽名浮水印

**決策**

- 前端上傳原始手寫 PNG。
- 後端合成「僅供本次點數審核申請使用」浮水印，以及申請編號、版本與伺服器簽署時間。
- 最終私有簽名綁定 `advisorUserId`、`applicationId`、`applicationVersionId`、`signedAt`。
- 不長期保存可被重複使用的乾淨原始簽名，具體暫存與清理方式由後端設計。

**後端影響**

- File Processing、Storage、交易失敗清理、尺寸與 1 MB 最終檔限制、私有讀取及測試。

### B10 日期與薪資限制

**決策**

- `competitionDate` 不得晚於台北今天。
- `certificateDate` 不得晚於台北今天。
- 展覽 `endDate >= startDate` 且 `endDate` 不得晚於台北今天。
- 薪資月份不得重複，只能當月或過去月份。
- 薪資金額為大於 0 的新臺幣整數。
- 參與計畫總薪資未滿 1,000 元不得正式送件。

### B11 證照重複申請

**決策**

- 暫以 `studentNumber + certificateNumber` 判斷同一學生的同一證照。
- 已有進行中、補件中或已核准申請時阻擋。
- 先前已因申請人要求結束或最終不核准時允許重新申請。
- 退回補件必須沿用原申請。

**待後端補充**

- 證照編號 trim／大小寫正規化方式。
- 併發送件時防止重複的資料庫或 Transaction 策略。

## 3. 已確認不需新增的第一版 API

- 不新增學生進度查詢 Token 或頁面。
- 不新增學生自助撤回 API 或 `withdrawn` 狀態。
- 不新增公開老師後端搜尋與分頁。
- 不新增老師簽核期限延長 API。
- 不新增承辦人案件認領或指派 API。
- 不新增管理員稽核紀錄查詢 API。
- 不啟用核准後點數異動 API。

## 4. 前端串接驗收

- 每項異動需有後端 Contract／Integration Test。
- 前端 Zod Schema 與 MSW Fixture 必須使用最終欄位名稱。
- Playwright 真實後端流程至少覆蓋展覽命名、補件不可換老師、工作佇列 Status、零點核准阻擋、手寫浮水印簽名及公開查詢最低條件。
