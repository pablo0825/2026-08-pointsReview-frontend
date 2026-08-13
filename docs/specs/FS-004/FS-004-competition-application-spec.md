# FS-004 — Competition Application Spec

## Document Information

- Feature Slice: `FS-004`
- Change Type: `feature`
- Document Status: `approved`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`
- Created: `2026-08-13`
- Last Updated: `2026-08-13`

## Change Information

- Revises Feature Slice: `none`
- Corrects Feature Slice: `none`
- Previous Spec: `none`
- Authoritative Spec: `this document`

## Source Reference

- `docs/project/product-requirements.md`, sections 5–7, 10, 12
- `docs/project/application-rules.md`, sections 1–2, 7–8
- `docs/project/routes-and-pages.md`, sections 4, 10–11
- `docs/project/api-integration.md`, sections 5–6, 11

## User Story

```text
身為不需登入的學生申請人，
我希望依目前有效競賽規則完成參與者、競賽、指導老師與附件資料，並確認後一次送出，
以便建立等待指導老師簽核的競賽點數申請，且能在不確定的網路結果下安全地重新確認同一次送件。
```

## Behavior Change

### Current Behavior

- `not-applicable`；本 Slice 新增競賽申請五步表單與正式送件流程。

### Target Behavior

- `/apply/competition` 提供完整五步競賽申請，依公開有效規則處理單人或多人點數、選擇指導老師、分類附件、確認資料並以 multipart 正式送件。
- 明確成功時顯示申請編號、目前狀態、台北時間送件時間與 Email 通知提醒；結果不確定時保留不可變 request 快照，讓使用者安全地重新確認同一次送件。

### Preserved Behavior

- `/apply` 的四類申請入口、共用公開導覽與 `/rules` 申請辦法頁維持既有行為。
- 競賽申請不得引入登入、Session Cookie、CSRF Token、草稿持久化、送件後進度查詢或其他申請類型表單。

## Input / Output

### Input

- 進入 `/apply/competition` 時取得的公開競賽點數規則。
- 共用學年度、1–10 位參與者、申請人身分、Email 與電話。
- 競賽等級、其他等級名稱、獎項、競賽名稱、類別與日期。
- 依有效規則產生或分配的每位參與者申請點數。
- 首次進入指導老師步驟時取得的公開老師清單及使用者選擇。
- 1–10 個 PDF、JPEG 或 PNG 附件及其分類、其他分類名稱與選填說明。
- 確認頁的正式送件操作；結果不確定時的重新確認或返回修改選擇。

### Output

- 可返回修改且資料不遺失的五步表單與唯讀確認摘要。
- 送件前完整且符合契約的競賽 payload、附件 multipart 欄位與 `Idempotency-Key`。
- 欄位、步驟、讀取、業務、Rate Limit、Idempotency 衝突及結果不確定狀態的可操作中文回饋。
- 成功頁顯示 `publicId`、`pending_advisor` 對應的目前狀態、Asia/Taipei 送件時間及 Email 通知提醒。

## Rules

1. 表單固定為學生與參與者、申請內容與點數、指導老師、附件、確認送出五步；下一步前驗證目前步驟，錯誤時聚焦第一個錯誤欄位，上一步與確認頁返回修改不得清除資料。
2. 學年度依 Asia/Taipei 當日及 8 月 1 日分界自動計算目前民國學年度，只讀顯示並在送件時複製到每位參與者；第一版不提供歷史學年度選擇。
3. 初始建立一位參與者並指定為申請人；每份競賽申請必須有 1–10 位參與者，且必須且只能有一位申請人。
4. 每位參與者必填姓名、學號、年級與班級；姓名 trim 後為 1–100 字元，學號 trim 後為 1–50 字元並轉為大寫，正規化後的學號不得重複。
5. 年級只接受 1–6，班級只接受 1–5；碩一與碩二預設甲班但仍可選甲至戊班。
6. `applicant.name` 直接使用申請參與者 trim 後的姓名。更換申請人前須確認，更換後清除 Email 與電話並要求重新輸入；目前申請人不可直接刪除，僅剩一人時維持其申請人身分。
7. 申請人 Email 必填、trim、轉小寫、最長 320 字元且符合一般 Email 格式；電話必填、trim 後不可空、最長 30 字元，只接受數字、空格、`+`、`-`、`(`、`)`。
8. 進入頁面只呼叫一次不帶 Query Parameter 的 `GET /public/competition-point-options`；切換選項、步驟、參與者或點數時不得重複查詢。
9. 規則 Response 必須包含 `competitionLevel`、`award`、`allocationMethod`、`points`、`minimumPointsPerParticipant` 與 `pointIncrement`；同一組 `competitionLevel + award` 唯一，前端只顯示 Response 實際提供的組合，不使用本機預設規則替代。
10. 規則讀取失敗時顯示「暫時無法載入競賽點數規則」，空陣列時顯示「目前沒有可申請的競賽點數規則」；兩者都提供「重新載入」並禁止繼續與送件。
11. 競賽等級顯示已定義的五種中文名稱，獎項顯示已定義的六種中文名稱；`competitionLevel = other` 時其他等級名稱必填、trim 後 1–100 字元，否則固定為 `null`。
12. 競賽名稱必填、trim 後 1–255 字元；競賽類別必填、trim 後 1–100 字元；兩者不限制一般字元。
13. 競賽日期必填且使用 `YYYY-MM-DD`，不得晚於 Asia/Taipei 今天，不設定最早日期。
14. `per_person` 顯示「每人固定點數」，每位參與者自動取得規則 `points` 且唯讀；增減參與者時依固定點數重算。
15. `shared_total` 顯示「團隊總點數分配」。單人自動取得全部 `points`；多人由使用者逐人分配，每人不得低於 0.50、必須是 0.50 的倍數，且總和必須精確等於規則 `points` 才能繼續或送件。
16. `shared_total` 的實際人數上限為競賽固定上限 10 與 `FLOOR(points / 0.50)` 的較小值；新增參與者保留既有分配並將新參與者設為 0.50，移除參與者後其點數回到未分配額。
17. 切換競賽等級或獎項時保留參與者名單但清除舊規則點數；新規則為 `per_person` 時改用新固定點數，新規則為 `shared_total` 時單人取得全部、多人才各設 0.50 後重新分配。
18. 點數加總、倍數、最低值與相等比較不得直接使用 JavaScript 浮點數，畫面與 wire payload 使用兩位小數字串。
19. 首次進入指導老師步驟時只呼叫一次不帶 Query Parameter 的 `GET /public/advisors`，返回其他步驟後沿用記憶體資料；搜尋只比對姓名、中文職稱與系所。
20. 老師顯示「姓名｜職稱｜系所」，`titleCode` 1–7 映射既定中文職稱，異常值顯示「未知職稱」；`isDirector` 不顯示且不參與搜尋，送件只傳選取老師的 `id` 為 `advisorId`。
21. 老師讀取失敗時顯示「暫時無法載入指導老師名單」，空陣列時顯示「目前沒有可選擇的指導老師」；兩者提供「重新載入」並禁止繼續。重載後原選擇不在清單時清除選擇。
22. 附件只接受 PDF、JPEG、PNG，每個檔案不得超過 5,242,880 bytes，每份申請最多 10 個；前端先依副檔名與 `File.type` 提示，正式判斷仍由後端執行。
23. 每個附件使用唯一、1–80 字元且只含英文字母、數字、底線或連字號的 `clientFileKey`，metadata 與 `attachments[{clientFileKey}]` 檔案必須一一對應；刪除附件一併移除 metadata、檔案及 Key。
24. 競賽附件分類只接受競賽辦法、海報、官網截圖、公文、參賽證明、入圍或獎狀、其他；至少須有一份 `participation_proof` 或 `finalist_or_award_certificate`。
25. 選擇附件分類 `other` 時其他名稱必填、trim 後 1–100 字元；切換離開時清除並傳 `null`。說明選填且最長 500 字元，trim 後空白傳 `null`。
26. 相同檔名、大小與 `lastModified` 的檔案再次加入時先提示可能重複，使用者可取消或仍加入；每份仍占一個附件名額。
27. JPEG 與 PNG 可縮圖或檢視，PDF 可在新分頁開啟；本機預覽 URL 在關閉、移除或表單卸載時釋放。替換檔案保留分類與說明但產生新 Key，替換檔案無效時保留原附件。
28. 確認頁以四個唯讀摘要區塊顯示申請人與參與者、競賽資料、指導老師、附件；每區提供「修改」返回對應步驟，不新增確認勾選框。
29. 送件按鈕上方提醒資料與附件將交由所選指導老師簽核；按鈕文字為「確認送出申請」，處理中顯示「送件中…」並鎖定表單與按鈕。
30. 只載入規則或老師不算表單修改；使用者輸入、增減參與者、選老師或加入附件後才啟用未送出資料警告。步驟間切換不警告，站內離開、瀏覽器上一頁、重新整理或關閉分頁須警告；成功送件後解除，結果不確定時保留。
31. 正式送件使用 `POST /public/applications` multipart，`payload` 是 JSON 字串，檔案欄位為 `attachments[{clientFileKey}]`；request 使用 `credentials: omit`，不取得或攜帶 Session、Cookie 或 `X-CSRF-Token`。
32. 每次新的邏輯送件產生 UUID v4 `Idempotency-Key`。送出前建立不可變 payload 與附件快照；明確 `201` 後清除 Key 與快照，使用者修改 payload 或附件後也廢棄舊 Key 與快照。
33. Network Error、timeout、連線中斷、未收到明確 Response 或任何 5xx 都顯示「無法確認是否送件成功」，不宣告成功或失敗且不自動重試；「重新確認送件」必須沿用相同 Key、payload、附件內容、檔名、MIME type 與 `clientFileKey`，「返回修改資料」則廢棄快照並於下次使用新 Key。
34. `409 idempotency_key_conflict` 廢棄原 Key、返回表單確認並在下次送件產生新 Key；`429 rate_limited` 保留資料且不自動重試，可讀到 `Retry-After` 時顯示等待時間並停用送件，否則顯示通用稍後再試。
35. `422 validation_failed` 依 `fields[].path` 的點號與數字索引定位欄位與步驟，不依賴錯誤順序並聚焦第一個錯誤；`Required` 顯示「此欄位為必填」，未知欄位訊息使用通用中文 fallback，沒有 `fields` 時顯示頂層 `message`。
36. 已知 `400 file_too_large`、`too_many_files` 與 `file_type_not_allowed` 顯示對應附件訊息；未知 4xx 顯示可用的非空白後端訊息或通用中文訊息，保留表單、返回確認頁、廢棄原 Key，且不自動重試。
37. 後端回報規則已失效或點數不符合最新規則時，保留其他資料、返回申請內容與點數步驟並要求手動重載；組合仍存在時依新規則重設點數，不存在時清除等級與獎項選擇。
38. 成功 Response 必須是 `201` 且包含 `publicId`、固定 `pending_advisor` 與 UTC ISO 8601 `submittedAt`；成功頁以 Asia/Taipei 顯示送件時間及 Email 通知提醒，不顯示老師簽核期限。

## Included

- `/apply/competition` 五步表單、記憶體狀態、步驟驗證與資料遺失警告。
- 競賽規則與老師清單的單次查詢、重載、loading、empty 與 failure 狀態。
- 參與者、申請人、學籍、聯絡資料、競賽資料與兩種點數分配。
- 附件選取、驗證、分類、說明、重複提示、本機預覽與清理。
- 確認摘要、multipart Mapper、公開未登入送件、Idempotency、錯誤映射與成功頁。
- 桌面、360px 手機、鍵盤、焦點、螢幕閱讀器及非純色彩狀態支援。

## Excluded

- 參與計畫、證照與展覽申請表單。
- 補件、變更指導老師、送件後進度查詢、自助撤回與學生帳號。
- 草稿儲存、重新整理後恢復、瀏覽器持久化及學生 Email 驗證。
- 指導老師簽核、承辦人審核、管理端規則管理與動態參與人數 API。
- 老師預計簽核時間或老師簽核期限顯示。
- 判斷兩次使用不同 `Idempotency-Key` 的獨立送件是否屬於相同競賽成果。

## Preliminary Integration Contract

- `GET /public/competition-point-options`：不帶 Query Parameter，成功為 `HTTP 200` 與 `{ data: CompetitionPointOption[] }`，空資料仍為 `200`。每筆包含唯一的 `competitionLevel + award`、`allocationMethod`、兩位小數字串 `points`、`minimumPointsPerParticipant` 與 `pointIncrement`。頁面進入時查詢一次，只有 empty、failure 或後端規則失效流程提供手動重載。
- `GET /public/advisors`：不帶 Query Parameter，成功為 `HTTP 200` 與 `{ data: PublicAdvisor[] }`，空資料仍為 `200`。每筆包含 `id`、`name`、`titleCode`、`department`、`isDirector`；首次進入老師步驟時查詢一次並在記憶體快取。
- `POST /public/applications`：未登入公開 multipart 送件，使用 `credentials: omit`，不帶 CSRF Token。Header 必須包含 UUID v4 `Idempotency-Key`；`payload` 符合 `CompetitionApplicationPayload`，附件欄位使用 `attachments[{clientFileKey}]`。
- 成功為 `HTTP 201` 與 `{ data: { publicId, status: "pending_advisor", submittedAt } }`。後端只記錄已 commit 的 `201` Idempotency 結果；相同 Key 與完全相同內容重試時，已 commit 案件重放相同 Response，commit 前失敗則重新執行。
- `400` 附件錯誤、`409 idempotency_key_conflict`、`422 validation_failed`、`429 rate_limited`、未知 4xx、所有 5xx 與 Network Error 依 Rules 呈現不同可操作狀態。Mutation 不自動重試。
- API Response 以 schema 驗證；無法驗證或無法解析的 Response 轉為安全錯誤，不顯示內部資訊，也不記錄 payload、附件、個資或 Idempotency Key。
- loading 時使用可辨識狀態；empty 與 failure 不混用；非同步結果、錯誤摘要與欄位訊息可由螢幕閱讀器讀出。

## AI Acceptance

- [ ] 自動測試五步導覽、逐步驗證、返回修改、記憶體保留與 dirty-state 離開警告。
- [ ] 自動測試學年度分界、1–10 人限制、申請人切換／刪除、學號 trim／大寫／重複及學籍限制。
- [ ] 自動測試規則只查詢一次、Response schema 含 `pointIncrement`、empty／failure／重載與只顯示後端組合。
- [ ] 自動測試 `per_person`、單人與多人 `shared_total`、增減參與者、切換規則、最低值、0.50 倍數與整數點數加總。
- [ ] 自動測試競賽欄位、`other` 清理、歷史日期接受與未來日期拒絕。
- [ ] 自動測試老師首次進入只查詢一次、本機搜尋、職稱 fallback、empty／failure／重載及失效選擇清除。
- [ ] 自動測試附件格式、單檔 5 MiB、10 檔、最低分類、`other`、說明、重複提示、替換、刪除、預覽與 URL 清理。
- [ ] 自動測試確認摘要、payload／multipart 對應、公開 `credentials: omit`、不取 CSRF Token 與提交鎖定。
- [ ] 自動測試 422 路徑定位、規則失效、已知／未知 4xx、429、409、所有 5xx／Network 的不可變 Idempotent retry 及成功頁。
- [ ] `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 與 FS-004 Playwright 流程通過。
- [ ] 自動化無障礙與 360px 檢查涵蓋步驟、Dialog、錯誤、附件與成功頁主要操作。

## Human Acceptance

- [ ] 在真實後端完成一筆 `per_person` 競賽申請，確認規則、老師、附件、確認頁與成功頁資料正確。
- [ ] 在真實後端完成一筆多人 `shared_total` 競賽申請，確認分配限制、總和及正式送件正確。
- [ ] 確認成功頁顯示申請編號、等待指導老師簽核狀態、台北送件時間及 Email 通知提醒，且不顯示老師簽核期限。
- [ ] 確認真實規則／老師 empty、failure、重載、Rate Limit 與結果不確定重新確認流程可理解且不造成重複案件。
- [ ] 在桌面與 360px 手機瀏覽器以鍵盤／觸控完成主要流程，確認焦點、錯誤提示、離開警告與附件操作可用。

## Open Questions

- None。

## Approval

- Approved By: `使用者`
- Approved At: `2026-08-13`
- Approval Note: `使用者已明確核准 FS-004 Spec、Plan 與 Commit Plan；實作須等待下一次明確開始要求。`
