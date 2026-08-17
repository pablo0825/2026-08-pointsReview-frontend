# FS-005 — Project Participation Application Spec

## Document Information

- Feature Slice: `FS-005`
- Change Type: `feature`
- Document Status: `completed`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-16`
- Last Updated: `2026-08-17`

## Change Information

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `this document`

## Source Reference

- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1, 3, 7–8
- `docs/project/routes-and-pages.md`, section 4
- `docs/project/api-integration.md`, sections 5–6
- `docs/project/testing-strategy.md`, sections 3–7
- `docs/blueprint/slices/FS-005-project-participation-application.md`

## User Story

```text
身為未登入的學生申請人，
我希望先以參與計畫的多月薪資取得可信任的點數試算，再補齊個人、老師與附件資料，
以便確認符合資格後完成單人參與計畫申請。
```

## Behavior Change

### Current Behavior

- `not-applicable`；目前沒有可完成參與計畫正式送件的專屬頁面。

### Target Behavior

- `/apply/project-participation` 提供計畫與薪資優先的五步公開表單；申請人完成後端試算且符合資格後，填寫單一申請人、選擇老師、上傳必要薪資證明、確認資料並以 multipart 正式送件。

### Preserved Behavior

- 保留 FS-003 的公開導覽、申請入口與 `/apply/project-participation` 路由目的。
- 保留 FS-004 已建立的共用申請人欄位、老師清單、附件限制、進度導覽、離開警告、欄位錯誤、Idempotent 正式送件及成功資訊行為；不得改變 `/apply/competition`。
- 不將個資、附件、Idempotency Key 或 request 快照寫入 URL 或瀏覽器持久儲存。

## Input / Output

### Input

- 計畫名稱、計畫主持人及工作內容。
- 1～12 筆薪資月份與整數薪資金額。
- 唯一申請人的姓名、學號、年級、班級、Email 與電話。
- 公開老師清單中選取的指導老師。
- 1～10 個 PDF、JPEG 或 PNG 附件，至少一個分類為 `salary_proof`。
- 使用者明確觸發的點數試算與正式送件操作。

### Output

- 後端回傳的總薪資、兩位小數預估點數與申請資格。
- 五步表單的完成、錯誤、載入、空資料、試算失敗、送件中、結果不確定及成功狀態。
- 以動態系統學年度、唯一參與者、試算點數與附件建立的 `project_participation` multipart request。
- 成功頁顯示申請編號、等待指導老師簽核狀態、Asia/Taipei 送件時間及 Email 通知提醒。

## Rules

1. 頁面固定使用「計畫與薪資試算」、「申請人資料」、「指導老師」、「附件」、「確認送出」五步；已完成且位於目前步驟之前的進度項目可返回，目前與後續步驟不可跳轉，返回後須逐步重新驗證。
2. `projectName` 必填、trim 後不可空、最長 255；`principalInvestigator` 必填、trim 後不可空、最長 100；`workDescription` 必填、trim 後不可空、最長 1,000，使用多行輸入並顯示字數。
3. 薪資明細初始一筆空白列、至少保留一筆、最多 12 筆；只剩一筆時停用刪除，達 12 筆時停用新增。
4. 每筆薪資使用月份選擇器與金額輸入；月份不得重複或晚於 Asia/Taipei 當月，送 API 時將 `YYYY-MM` 轉為 `YYYY-MM-01`。
5. `salaryAmount` 必須是 1～50,000 的 JSON 整數；不接受零、負數、小數或超出上限的值。薪資區塊不顯示「每月 1～50,000 元，最多 12 個不同月份。」提示，欄位驗證與就地錯誤仍保留限制說明。
6. 前端不得自行實作點數公式或硬編碼總薪資門檻；只有使用者按下「試算點數」才呼叫試算 API，試算 Mutation 不自動重試。
7. 有效試算顯示後端 `totalSalary`、`estimatedPoints` 與資格；預估點數唯讀，不提供申請人輸入或修改。
8. 新增、刪除或修改任何薪資月份或金額都立即清除既有試算；目前薪資資料必須重新取得 `isEligible: true` 才能進入下一步或正式送件。
9. `isEligible: false` 是成功試算而非系統錯誤；顯示後端預估點數及「未達申請門檻」，並禁止繼續。
10. 試算 `422 validation_failed` 依 `salaryItems.{index}.salaryMonth`、`salaryItems.{index}.salaryAmount` 或 `salaryItems` 顯示於對應控制項或薪資區塊；沒有 `fields` 時顯示頂層訊息。
11. 試算 Network Error 或 5xx 顯示頁內「暫時無法試算點數，請稍後再試」與「重新試算」，保留輸入、不自動重送且禁止繼續。
12. 參與計畫固定只有一位參與者且固定為申請人；申請人資料在單一卡片填寫，不提供參與者增刪或申請人指定操作。
13. 唯一參與者沿用共用姓名、學號、年級、班級、Email 與電話規則；學號 trim 後轉大寫，`applicant.name` 取 trim 後的 `studentName`。年級顯示名稱固定為 `1`～`6` 對應「大一、大二、大三、大四、碩一、碩二」，班級顯示名稱固定為 `1`～`5` 對應「甲班、乙班、丙班、丁班、戊班」；表單值與 Wire Payload 仍使用數字代碼，FS-004 與 FS-005 必須共用同一份對照來源。
14. 學年度依 Asia/Taipei 當日與 8 月 1 日分界動態計算，不在表單或確認頁顯示，也不提供輸入；正式 payload 仍帶入 `participants[0].academicYear`。
15. 指導老師階段沿用 `GET /public/advisors`、API 回傳順序、本機搜尋、職稱對照與「未知職稱」 fallback；載入失敗或空陣列時顯示可重新載入的阻擋狀態。
16. 附件分類只提供 `salary_proof`、`official_document`、`other`；至少一個附件為 `salary_proof`，`other` 的其他名稱及共用格式、大小、數量、說明、Key、重複提示與預覽規則全部適用。
17. 確認頁依序顯示「計畫與薪資」、「申請人資料」、「指導老師」、「附件」四個唯讀摘要；申請人年級與班級使用正式顯示名稱，不直接顯示數字代碼；不顯示 `applicationType`、`academicYear`、`isApplicant`、`clientFileKey`、`Idempotency-Key` 或區塊內修改按鈕。
18. 第一版表單只保存在記憶體；使用者修改表單後離開、重新整理或關閉須警告，成功送件才解除，結果不確定時保留資料與快照。
19. 正式送件使用 `POST /public/applications` multipart、必填 UUID v4 `Idempotency-Key`，不帶 Session Cookie 或 `X-CSRF-Token`；`requestedPoints` 自動使用最近一次仍有效的 `estimatedPoints`。
20. 正式送件期間鎖定操作；Network Error、timeout、未收到明確 Response或任何 5xx 都視為結果不確定，只能以相同 Key 與完全相同的 payload、附件、檔名、MIME type、`clientFileKey` 快照手動重新確認。
21. 正式 `422` 依 `fields[].path` 返回「計畫與薪資試算」、「申請人資料」或附件區塊並就地顯示；正式點數低於 0.50 時將 `typeDetails.salaryItems` 錯誤顯示於薪資試算區塊並要求重新試算。
22. `409 idempotency_key_conflict`、`429 rate_limited`、未知 4xx、附件 400 與無法定位錯誤沿用共用安全頁內提示及 Key 處理；不得使用瀏覽器 `alert()` 或自動重試正式送件。
23. `201 Created` 後顯示 `publicId`、將 `pending_advisor` 顯示為「等待指導老師簽核」、以 Asia/Taipei 顯示 `submittedAt`，並提醒留意申請人 Email；不顯示或推測老師簽核日期。
24. 所有輸入錯誤在相關控制項下方顯示、使用紅色邊框及 `aria-invalid` 等非純色彩提示，並聚焦第一個錯誤；頁面支援鍵盤操作及 360px 版面。

## Included

- `/apply/project-participation` 單人五步公開申請。
- 計畫欄位、薪資明細增刪、月份轉換、手動後端試算、試算失效與資格阻擋。
- 單一申請人、動態隱藏學年度、老師清單、參與計畫附件、確認摘要與 multipart 正式送件。
- API Wire Schema、表單驗證、錯誤定位、Idempotent retry、成功頁、離開警告與自動化測試。

## Excluded

- 合併不同計畫或多位參與者。
- 前端點數公式、點數手動修改或管理點數規則。
- 草稿保存、學生帳號、申請進度查詢、自助撤回與瀏覽器持久化。
- 補件、其他申請類型、老師簽核、承辦審核與管理功能。

## Preliminary Integration Contract

- `POST /public/point-estimates/project-participation`：公開 JSON 試算；Request 為 `{ salaryItems: [{ salaryMonth: "YYYY-MM-01", salaryAmount: number }] }`，成功為 `{ data: { totalSalary: number, estimatedPoints: string, isEligible: boolean } }`。
- 試算資料合法但不符合資格仍回傳 `200` 與 `isEligible: false`；驗證失敗回傳 `422 validation_failed`，路徑使用 `salaryItems.{index}.*`。
- `GET /public/advisors`：公開老師清單；`200 { data: [] }` 是空狀態，不是 404。
- `POST /public/applications`：公開 multipart 正式送件；`payload.applicationType` 固定為 `project_participation`，`participants` 恰好一筆且 `isApplicant: true`，`typeDetails` 包含計畫欄位與原始薪資明細，附件檔案欄位使用 `attachments[{clientFileKey}]`。
- `requestedPoints` 取最新有效試算值，但後端正式送件時重新計算並覆寫；至少一個附件 metadata 使用 `salary_proof`。
- 正式成功為 `201 { data: { publicId, status: "pending_advisor", submittedAt } }`；驗證為 422、Key 衝突為 409、限流為 429、附件限制為 400，Network Error 或任何 5xx 為結果不確定。
- 所有 Response 先以 Zod 驗證；Response 形狀不符契約時視為安全的整合失敗，不以型別斷言繞過。

## AI Acceptance

- [x] TypeScript、ESLint、Vitest、Production Build 與相關 Chromium Playwright 全部通過。
- [x] 自動測試五步順序、進度導覽、逐步驗證、離開警告及 360px／鍵盤可用性。
- [x] 自動測試計畫欄位 trim、長度、工作內容 1,000 字及欄位內錯誤呈現。
- [x] 自動測試薪資 1～12 筆、月份轉換／重複／未來、1～50,000 整數及增刪邊界。
- [x] 自動測試只有明確操作才呼叫試算、`isEligible` 兩種成功狀態、422 路徑、Network／5xx、手動重試與薪資異動失效。
- [x] 自動測試點數唯讀、前端不自行換算、單一申請人、學號大寫及動態學年度隱藏但存在 payload。
- [x] 自動測試 FS-004 與 FS-005 共用年級／班級對照，申請人選單與確認摘要顯示正式名稱，Wire Payload 保持數字代碼。
- [x] 自動測試老師失敗／空資料／重新載入、必要 `salary_proof`、附件分類／技術限制及確認頁四區塊。
- [x] 自動測試 multipart payload、Idempotency Key、重複點擊、結果不確定快照重試、409、429、未知錯誤、附件錯誤與 201 成功頁。
- [x] 回歸驗證 `/apply` 與 `/apply/competition` 的既有行為及測試不受影響。

## Human Acceptance

- [x] 以真實後端完成合格薪資試算，確認顯示後端點數並可繼續正式送件。
- [ ] `not-run`：未以真實後端重做 `isEligible: false`、未來／重複月份與特殊錯誤條件；相關自動化測試已通過。
- [x] 完成單一申請人、老師與薪資證明附件的真實 multipart 送件，確認後端只建立一筆資料且內容正確。
- [x] 確認第一步名稱由「計畫內容與薪資試算」精簡為「計畫與薪資試算」、不顯示「每月 1～50,000 元，最多 12 個不同月份。」提示，申請人選單與確認頁以「大一～碩二」及「甲班～戊班」顯示年級／班級。
- [x] 確認確認頁四區塊、進度返回修改、動態學年度不顯示、欄位錯誤與 360px 版面可理解且可操作。
- [x] 確認成功頁申請編號、等待老師簽核、送件時間與 Email 提醒正確，且不顯示老師預計簽核日期。

## Open Questions

- `None`

## Approval

- Approved By: `user`
- Approved At: `2026-08-17`
- Approval Note: `使用者已核准 2026-08-17 修訂：精簡第一步名稱、移除薪資限制提示，並共用 FS-004 的年級／班級正式顯示名稱。`
