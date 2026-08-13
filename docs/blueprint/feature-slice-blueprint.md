# Feature Slice Blueprint

## Document Information

- Schema Version: `1`
- Document Status: `active`
- Requirements Root: `docs/project/`
- Last Reconciled: `2026-08-13`
- Active Feature Slice: `FS-004`

## Purpose

本文件將 `docs/project/` 的第一版需求整理為可逐一實作、整合與驗收的 Feature Slice，並作為各 Slice 目前狀態的唯一權威來源。產品需求只取自下列需求文件；架構、開發與測試文件僅約束後續實作與驗證方式。每次只啟動一個 Slice，詳細目標、範圍與驗收邊界請查看對應 Slice Brief。

專案初始化與共用架構不另外建立純技術 Slice。若專案尚未初始化，第一個進入實作的 Feature Slice 必須在 Plan 中納入完成該 Slice 所需的最小專案初始化、依賴、工具與基礎設定；共用架構由第一個實際使用它的 Slice 建立，後續 Slice 再依已確認的實際需求擴充。所有初始化與共用架構工作都必須明列於 Plan、Commit Plan 與 Verification，不得視為未追蹤的隱含工作。

## Requirement Sources

| Source | Relevant Sections | Notes |
|---|---|---|
| `docs/project/product-requirements.md` | 全文 | 第一版產品目標、角色、範圍、完成條件與排除事項的主要來源。 |
| `docs/project/application-rules.md` | 全文 | 四類申請、參與者、點數、日期、附件與規則版本需求。 |
| `docs/project/workflows-and-permissions.md` | 全文 | 申請狀態、老師與承辦流程、權限、期限、版本與併發規則。 |
| `docs/project/routes-and-pages.md` | 全文 | 各角色路由、頁面內容、互動狀態、響應式與無障礙需求。 |
| `docs/project/api-integration.md` | sections 2–11 | 前端整合契約、角色 API、私有檔案與錯誤行為。 |
| `docs/project/backend-contract-changes.md` | sections 2–4 | 已決定但仍待後端同步的契約及真實串接驗收限制。 |
| `docs/project/frontend-architecture.md` | 全文 | 後續 Plan 與實作限制；不是新增產品需求的來源。 |
| `docs/project/testing-strategy.md` | 全文 | 後續 AI Verification 與真實後端驗收限制；不是獨立功能來源。 |
| `docs/project/development-standards.md` | 全文 | 後續實作、品質與 commit 限制；不是獨立功能來源。 |

## Open Questions

- `docs/project/backend-contract-changes.md` 的 B01–B13 尚未標示後端同步完成情況；各相關 Slice 可先依最終契約與 MSW 開發，但真實後端整合驗收需等待對應契約可用。
- 證照編號 trim／大小寫正規化及併發防止重複申請的後端策略尚未定案；會影響 `FS-006` 的 Integration Contract 與真實驗收資料。
- 管理端 Users、Advisors、Rules、Instructions、Applications 與 Transactions 只定義功能群組，尚缺完整 endpoint、欄位、分頁、錯誤與權限契約；會影響 `FS-015` 至 `FS-019` 的 Spec 與 Plan。

## Feature Slice Index

| ID | Name | Type | Depends On | Revises | Corrects | Status | Status Note | Last Updated |
|---|---|---|---|---|---|---|---|---|
| FS-001 | `staff-authentication` | feature | none | none | none | proposed | 已補充登入與受保護頁面共用架構責任，尚未開始 Spec。 | 2026-08-10 |
| FS-002 | `published-instructions` | feature | none | none | none | accepted | 修訂後完整 AI Verification、真實後端 Human Integration 與使用者 Human Acceptance 均已通過；桌面排版觀感列為非阻斷後續優化。 | 2026-08-12 |
| FS-003 | `application-entry` | feature | none | none | none | accepted | 完整 AI Verification 已通過，Human Integration 為 `not-applicable`，使用者已確認 Human Acceptance 通過。 | 2026-08-11 |
| FS-004 | `competition-application` | feature | FS-003 | none | none | approved | 欄位／區塊就地錯誤、紅框、頁面內系統提示及 React Hook Form 錯誤管理已核准；等待開始 R3 實作。 | 2026-08-13 |
| FS-005 | `project-participation-application` | feature | FS-003 | none | none | proposed | 已補充學號正規化、未登入送件及包含 5xx 的 Idempotency 契約，尚未開始 Spec。 | 2026-08-13 |
| FS-006 | `certificate-application` | feature | FS-003 | none | none | proposed | 已補充學號正規化、未登入送件及包含 5xx 的 Idempotency 契約；證照正規化契約待確認。 | 2026-08-13 |
| FS-007 | `exhibition-application` | feature | FS-003 | none | none | proposed | 已補充學號正規化、未登入送件及包含 5xx 的 Idempotency 契約，尚未開始 Spec。 | 2026-08-13 |
| FS-008 | `application-revision` | feature | FS-004, FS-005, FS-006, FS-007 | none | none | proposed | 已補充學號正規化契約，尚未開始 Spec。 | 2026-08-13 |
| FS-009 | `public-points-search` | feature | none | none | none | proposed | 已由第一版需求建立，尚未開始 Spec。 | 2026-08-10 |
| FS-010 | `advisor-application-workspace` | feature | FS-001, FS-004, FS-005, FS-006, FS-007 | none | none | proposed | 已補充老師工作區共用架構責任，尚未開始 Spec。 | 2026-08-10 |
| FS-011 | `advisor-application-decision` | feature | FS-010 | none | none | proposed | 已由第一版需求建立，尚未開始 Spec。 | 2026-08-10 |
| FS-012 | `reviewer-application-workspace` | feature | FS-001, FS-011 | none | none | proposed | 已補充承辦人工作區共用架構責任，尚未開始 Spec。 | 2026-08-10 |
| FS-013 | `reviewer-revision-management` | feature | FS-008, FS-012 | none | none | proposed | 已由第一版需求建立，尚未開始 Spec。 | 2026-08-10 |
| FS-014 | `reviewer-final-decision` | feature | FS-012 | none | none | proposed | 已由第一版需求建立，尚未開始 Spec。 | 2026-08-10 |
| FS-015 | `admin-application-oversight` | feature | FS-001, FS-012 | none | none | proposed | 已補充管理員工作區共用架構責任；管理端細部 API 契約待確認。 | 2026-08-10 |
| FS-016 | `admin-user-management` | feature | FS-001 | none | none | proposed | 已由第一版需求建立；管理端細部 API 契約待確認。 | 2026-08-10 |
| FS-017 | `admin-advisor-management` | feature | FS-001 | none | none | proposed | 已由第一版需求建立；管理端細部 API 契約待確認。 | 2026-08-10 |
| FS-018 | `admin-rule-management` | feature | FS-001 | none | none | proposed | 第一版範圍已限縮為點數規則管理；管理端細部 API 契約待確認。 | 2026-08-11 |
| FS-019 | `admin-instruction-management` | feature | FS-001, FS-002 | none | none | proposed | 已由第一版需求建立；管理端細部 API 契約待確認。 | 2026-08-10 |

## Documents

| ID | Slice Brief | Spec | Plan | Verification |
|---|---|---|---|---|
| FS-001 | `docs/blueprint/slices/FS-001-staff-authentication.md` | pending | pending | pending |
| FS-002 | `docs/blueprint/slices/FS-002-published-instructions.md` | `docs/specs/FS-002/FS-002-published-instructions-spec.md` | `docs/plans/FS-002/FS-002-published-instructions-plan.md` | `docs/verification/FS-002/FS-002-published-instructions-verification.md` |
| FS-003 | `docs/blueprint/slices/FS-003-application-entry.md` | `docs/specs/FS-003/FS-003-application-entry-spec.md` | `docs/plans/FS-003/FS-003-application-entry-plan.md` | `docs/verification/FS-003/FS-003-application-entry-verification.md` |
| FS-004 | `docs/blueprint/slices/FS-004-competition-application.md` | `docs/specs/FS-004/FS-004-competition-application-spec.md` | `docs/plans/FS-004/FS-004-competition-application-plan.md` | `docs/verification/FS-004/FS-004-competition-application-verification.md` |
| FS-005 | `docs/blueprint/slices/FS-005-project-participation-application.md` | pending | pending | pending |
| FS-006 | `docs/blueprint/slices/FS-006-certificate-application.md` | pending | pending | pending |
| FS-007 | `docs/blueprint/slices/FS-007-exhibition-application.md` | pending | pending | pending |
| FS-008 | `docs/blueprint/slices/FS-008-application-revision.md` | pending | pending | pending |
| FS-009 | `docs/blueprint/slices/FS-009-public-points-search.md` | pending | pending | pending |
| FS-010 | `docs/blueprint/slices/FS-010-advisor-application-workspace.md` | pending | pending | pending |
| FS-011 | `docs/blueprint/slices/FS-011-advisor-application-decision.md` | pending | pending | pending |
| FS-012 | `docs/blueprint/slices/FS-012-reviewer-application-workspace.md` | pending | pending | pending |
| FS-013 | `docs/blueprint/slices/FS-013-reviewer-revision-management.md` | pending | pending | pending |
| FS-014 | `docs/blueprint/slices/FS-014-reviewer-final-decision.md` | pending | pending | pending |
| FS-015 | `docs/blueprint/slices/FS-015-admin-application-oversight.md` | pending | pending | pending |
| FS-016 | `docs/blueprint/slices/FS-016-admin-user-management.md` | pending | pending | pending |
| FS-017 | `docs/blueprint/slices/FS-017-admin-advisor-management.md` | pending | pending | pending |
| FS-018 | `docs/blueprint/slices/FS-018-admin-rule-management.md` | pending | pending | pending |
| FS-019 | `docs/blueprint/slices/FS-019-admin-instruction-management.md` | pending | pending | pending |

## Template Rules

- 只在主 blueprint 保存目前 Status 與 Status Note。
- 不在 Slice Brief、Spec、Plan 或 Verification 鏡像權威狀態。
- 使用 Git history 保存 blueprint 內容歷史，不在主檔累積完整 Status History。
- 使用需求文件建立 Slice，不從程式碼推論需求。
- 每個 Source Reference 必須指向實際需求文件。
- 不將無法追溯的內容當成已確認需求。
- 不因 reconcile 重新編號、覆寫或刪除既有 Slice。
- 已 `accepted` 需求改變時建立新 ID 的 `change` Slice，並以 `Revises` 連結。
- 實作違反有效 Spec 時建立新 ID 的 `correction` Slice，並以 `Corrects` 連結。
- 將需求移除、衝突或無法判定的情況交由使用者確認。
