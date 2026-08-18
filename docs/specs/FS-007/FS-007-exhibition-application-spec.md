# FS-007 — Exhibition Application Spec

## Document Information

- Feature Slice: `FS-007`
- Change Type: `feature`
- Document Status: `draft`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-18`
- Last Updated: `2026-08-18`
- Shared Understanding: `confirmed`
- Boundary Gate: `passed`
- Boundary Basis: `FS-007 Slice Brief, Source References, and confirmed Shared Understanding at Draft commit`

## Change Information

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Legacy Baseline: `none`
- Authoritative Spec: `this document`

## Source Reference

- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 5, 7–8
- `docs/project/routes-and-pages.md`, section 4
- `docs/project/backend-contract-changes.md`, section 2 B01–B02, B10, B13
- `docs/project/api-integration.md`, sections 5–6, 11
- `docs/project/testing-strategy.md`, sections 3–7
- `docs/blueprint/slices/FS-007-exhibition-application.md`

## User Story

```text
身為未登入的學生申請人，
我希望依展覽類型為單人或多人選擇目前允許的每人點數，並補齊展覽、老師與附件資料，
以便完成可追蹤且不會重複建案的展覽申請。
```

## Behavior Change

### Current Behavior

- `not-applicable`；目前 `/apply/exhibition` 只有準備中 placeholder，沒有可完成展覽正式送件的專屬頁面。

### Target Behavior

- `/apply/exhibition` 提供「參與者資料」、「展覽內容與點數」、「指導老師」、「附件」、「確認送出」五步公開表單；申請人依有效規則為 1～15 位參與者選擇離散點數，確認後以 multipart 正式送件。

### Preserved Behavior

- 保留 FS-003 的公開導覽、申請入口與 `/apply/exhibition` 路由目的。
- 保留 FS-004 與 FS-005 的申請流程、學籍顯示、老師、附件、離開警告、錯誤定位、Idempotent 正式送件與成功頁行為。
- 不將學生資料、附件、Idempotency Key 或 request 快照寫入 URL 或瀏覽器持久儲存。

## Input / Output

### Input

- 1～15 位參與者的姓名、學號、年級、班級、申請人身分，以及唯一申請人的 Email 與電話。
- 公開展覽點數規則中的 `fan_work` 或 `project_work`，以及每位參與者選擇的離散點數。
- 作品名稱、固定展覽名稱與可能的其他名稱、主辦單位、展覽場地、開始與結束日期。
- 公開老師清單中選取的指導老師。
- 1～10 個 PDF、JPEG 或 PNG 附件，至少一個分類為 `exhibition_photo`。

### Output

- 五步表單的載入、空白、錯誤、編輯、確認、送件中、結果不確定與成功狀態。
- 依當前展覽類型呈現的每人離散點數選項，以及類型變更後要求重選點數的明確狀態。
- 包含動態學年度、展覽 Wire Contract、參與者點數與附件的 `exhibition` multipart request。
- 成功頁顯示申請編號、等待指導老師簽核狀態、Asia/Taipei 送件時間及 Email 通知提醒。

## Rules

1. 頁面固定使用「參與者資料」、「展覽內容與點數」、「指導老師」、「附件」、「確認送出」五步；只能返回已完成且位於目前步驟之前的進度，返回後須逐步重新驗證。
2. 初始建立一位參與者並預設指定為申請人；表單允許 1～15 人，恰好一人為申請人，申請人不可直接刪除，改選前須確認並清除 Email 與電話。
3. 參與者姓名、學號、年級、班級與申請人聯絡資料沿用共用限制；學號 trim 後轉大寫，並拒絕正規化後重複學號。
4. 學年度依 Asia/Taipei 當日與 8 月 1 日分界動態計算，不在表單或確認頁顯示，送件時複製到每位 participant。
5. 進入頁面只呼叫一次 `GET /public/exhibition-point-options` 且不帶 Query Parameter；切換類型、步驟、參與者或點數不重新查詢。
6. 規則失敗或空陣列顯示可重新載入的阻擋狀態；只顯示 API 實際回傳的 `fan_work` 或 `project_work`，不顯示沒有有效規則的類型。
7. 每位參與者必須從所選類型的 `allowedPointsPerPerson` 下拉選單選擇一值；前端不硬編碼、展開級距或提供自由輸入。
8. 已有任一點數時變更 `exhibitionType` 先顯示清除提示；確認後保留參與者、申請人與聯絡資料，清除全部 `requestedPoints`，取消時保留原類型與點數。
9. 展覽名稱只使用 canonical 固定清單的七個 API 值；`other` 時 `exhibitionNameOther` 必填、trim 後不可為空且最長 255，切換至其他名稱時清除並固定送 `null`。
10. `workName`、`organizer`、`venue` 必填、trim 後不可為空且最長 255；`startDate`、`endDate` 必填，`endDate >= startDate` 且 `endDate` 不得晚於 Asia/Taipei 今天。
11. 第二步參與者摘要唯讀顯示姓名、學號、學籍與申請人標記；身分資料只能返回第一步修改。
12. 指導老師沿用 `GET /public/advisors`、API 順序、本機搜尋、職稱對照與載入／空白／失敗狀態；送件只傳 `advisorId`。
13. 附件分類只提供 `exhibition_photo`、`exhibition_poster`、`official_document`、`other`；至少一個為 `exhibition_photo`，其餘共用檔案、metadata、預覽與限制全部適用。
14. 確認頁依序顯示「參與者與點數」、「展覽資料」、「指導老師」、「附件」四區唯讀摘要；申請人置頂並顯示聯絡資料，不顯示學年度、技術欄位或區塊內修改按鈕。
15. 表單只保存於 React 記憶體；修改後離開、重新整理或關閉須警告，成功送件才解除，結果不確定時保留資料與快照。
16. 正式送件使用 `POST /public/applications` multipart、必填 UUID v4 `Idempotency-Key`，不帶 Session Cookie 或 `X-CSRF-Token`；送件期間鎖定操作且 Mutation 不自動重試。
17. Network Error、timeout、未收到明確 Response 或任何 5xx 都是結果不確定；只能以相同 Key 與完全相同的 payload、附件、檔名、MIME type 與 `clientFileKey` 快照手動重新確認。
18. `422` 依 `fields[].path` 返回對應步驟並就地顯示；規則失效時保留其他資料、重新載入規則並要求重選全部點數。
19. `409 idempotency_key_conflict`、`429 rate_limited`、附件 400、未知 4xx 與無法定位錯誤沿用共用安全頁內提示與 Key 處理，不使用瀏覽器 `alert()`。
20. `201 Created` 後顯示 `publicId`、將 `pending_advisor` 顯示為「等待指導老師簽核」、以 Asia/Taipei 顯示 `submittedAt`，並提醒留意申請人 Email；不顯示或推測老師簽核日期。
21. 欄位錯誤顯示在相關控制項下方，使用紅色邊框、`aria-invalid` 與非純色彩狀態，並聚焦第一個錯誤；頁面支援鍵盤及 360px 版面。

## Included

- `/apply/exhibition` 單人或多人五步公開申請。
- 參與者、唯一申請人、動態隱藏學年度、固定展覽名稱、展覽資料與日期。
- 展覽規則查詢、每人離散點數、類型變更後點數重選、老師、必要展覽照片、確認摘要與正式送件。
- API Wire Schema、表單驗證、錯誤定位、Idempotent retry、成功頁、離開警告、鍵盤與 360px 自動化驗證。

## Excluded

- `external_exhibition` 與任何舊展覽名稱值。
- 前端硬編碼或自由輸入點數、自動展開點數級距、展覽名稱 API 與參與人數規則 API。
- 各展覽類型的歷史點數快取。
- 草稿保存、學生帳號、申請進度查詢、自助撤回與瀏覽器持久化。
- 補件、其他申請類型、老師簽核、承辦審核與管理功能。

## Preliminary Integration Contract

- `GET /public/exhibition-point-options`：不帶 Query Parameter；成功為 `{ data: [{ exhibitionType, allowedPointsPerPerson }] }`，類型只有 `fan_work` 或 `project_work`，點數是去重且數值升冪的兩位小數端點字串，空規則回傳 `200 { data: [] }`。
- `GET /public/advisors`：公開老師清單；`200 { data: [] }` 是空狀態。
- `POST /public/applications`：公開 multipart 正式送件；`payload.applicationType` 固定為 `exhibition`，`participants` 包含 1～15 筆及唯一申請人，`typeDetails` 使用 canonical Exhibition Payload，附件檔案欄位使用 `attachments[{clientFileKey}]`。
- `typeDetails` 包含 `exhibitionType`、`workName`、`exhibitionName`、`exhibitionNameOther`、`organizer`、`venue`、`startDate`、`endDate`；每人點數位於 `participants[].requestedPoints`。
- 附件 metadata 類型只有 `exhibition_photo`、`exhibition_poster`、`official_document`、`other`，且至少一個為 `exhibition_photo`。
- 成功為 `201 { data: { publicId, status: "pending_advisor", submittedAt } }`；驗證為 422、Key 衝突為 409、限流為 429、附件限制為 400，Network Error 或任何 5xx 為結果不確定。
- 所有 Response 先通過 Zod Wire Schema；形狀不符視為安全整合失敗，不以型別斷言繞過。

## AI Acceptance

| ID | Criterion |
|---|---|
| AI-001 | 自動驗證 `/apply/exhibition` 五步順序、進度返回與重新驗證、離開警告、鍵盤操作及 360px 版面。 |
| AI-002 | 自動驗證 1～15 位參與者、唯一申請人、聯絡資料、正式學籍名稱、學號大寫與重複阻擋，以及學年度隱藏但存在 payload。 |
| AI-003 | 自動驗證固定展覽名稱、`other` 條件與 `null` mapper、字串 trim／長度、日期順序與未來結束日期錯誤。 |
| AI-004 | 自動驗證展覽規則 Wire Schema、無 Query、載入／空白／失敗，只顯示 API 類型與離散端點，以及類型變更確認後保留參與者但清除全部點數。 |
| AI-005 | 自動驗證老師狀態、展覽附件分類與必要 `exhibition_photo`、確認頁四區摘要及技術欄位隱藏。 |
| AI-006 | 自動驗證 Exhibition Payload、multipart、未登入 transport、Idempotency Key、重複點擊、不確定快照重試、422 定位、409、429、附件 400、未知錯誤與 201 成功頁。 |
| AI-007 | 回歸驗證 `/apply`、`/rules`、`/apply/competition` 與 `/apply/project-participation` 的 accepted 行為不受共用元件調整影響。 |

## Human Acceptance

| ID | Criterion |
|---|---|
| HA-001 | 使用者在桌面與 360px 畫面確認「參與者資料」與「展覽內容與點數」分工清楚，多人點數選擇、類型變更清除提示、固定展覽名稱、附件與確認摘要可理解且可操作。 |
| HA-002 | 使用者以真實後端完成 `fan_work` 與 `project_work` 代表性申請，至少一案為多人，並確認後端收到正確展覽名稱、點數、學年度、老師與展覽照片，成功頁資訊正確。 |

## Open Questions

- `None`

## Approval

- Approved By: `pending`
- Approved At: `pending`
- Approval Note: `pending`
