# FS-001 — Staff Authentication

## Slice Information
- ID: `FS-001`
- Name: `staff-authentication`
- Type: `feature`
- Depends On: `none`
- Revises: `none`
- Corrects: `none`
- Feature Slice Status: See `docs/blueprint/feature-slice-blueprint.md`

## Goal
讓老師、承辦人與管理員安全登入、登出、啟用帳號及重設密碼，並依角色進入受保護頁面。

## User-Visible Result
後台使用者可完成帳號存取流程；未登入深連結會在登入後返回安全站內路徑，失效或無權限狀態有明確回應。

## Source Reference
- `docs/project/product-requirements.md`, sections 3, 4, 10
- `docs/project/routes-and-pages.md`, sections 1–2
- `docs/project/workflows-and-permissions.md`, sections 7–8
- `docs/project/api-integration.md`, sections 3–4, 11

## Included
- Email／密碼登入、登出、Session／CSRF、`/auth/me`、安全返回路徑、角色導向、啟用與密碼重設。

## Excluded
- 學生帳號、學校 SSO、各角色業務頁面與管理員建立帳號流程。

## AI Responsibility
- 建立受保護路由、Authentication Provider 與後台登入共用骨架，並完成相關頁面、API 整合、錯誤狀態、自動化測試與文件。

## Human Integration
- 提供可用的 Auth／Email 測試環境、三種角色帳號與有效／失效 Token。

## AI Acceptance
- 自動驗證登入狀態、角色權限、安全返回路徑、401／403 與 Token 頁面行為。

## Human Acceptance
- 使用者以三種角色及 Email Token 實際確認登入後導向、登出、啟用與重設流程。

## Template Rules

- 本文件不保存或鏡像 Status、Status Note、Last Updated 或核准狀態。
- 目前狀態以 docs/blueprint/feature-slice-blueprint.md 為唯一來源。
- 詳細 Rules、Input / Output 與 Integration Contract 留給後續 Spec。
