# 點數審核系統文件

本目錄保存前端專案的開發文件。不同目錄代表不同層級與生命週期，避免專案級規範、實作藍圖與單一功能文件互相混用。

## 文件目錄

| 目錄 | 用途 |
| --- | --- |
| [`project/`](project/) | 長期維護的專案級需求、規則、架構、契約與開發基準 |
| `blueprint/` | 系統實作藍圖、功能切分、相依性與建議開發順序；藍圖文件尚待建立 |
| [`specs/`](specs/) | 單一功能必須符合的行為、規則及驗收條件 |
| [`plans/`](plans/) | 單一功能依照當前程式碼所制定的實作步驟與測試安排 |
| [`notes/`](notes/) | 討論紀錄、待確認事項與決策背景 |
| [`archive/`](archive/) | 已失效但仍具追溯或參考價值的文件，不作為現行執行依據 |

## 建議工作流程

```text
project → blueprint → spec → plan → implementation → acceptance
```

1. 先以 `project/` 的文件確認專案需求與限制。
2. 由實作藍圖選擇下一項功能，確認相依功能及後端契約。
3. 為該功能建立 Spec，確認範圍、行為與驗收條件。
4. 根據 Spec 與當前程式碼建立 Plan。
5. 完成實作、測試及驗收，並同步更新受影響的文件。

## 專案級文件

- [產品需求](project/product-requirements.md)
- [申請規則](project/application-rules.md)
- [流程與權限](project/workflows-and-permissions.md)
- [路由與頁面](project/routes-and-pages.md)
- [前端架構](project/frontend-architecture.md)
- [API 整合](project/api-integration.md)
- [後端契約同步清單](project/backend-contract-changes.md)
- [測試策略](project/testing-strategy.md)
- [開發與品質基準](project/development-standards.md)

## 文件有效性

- `project/`、`blueprint/`、`specs/` 與 `plans/` 中標示為現行基準的文件，可以作為開發與驗收依據。
- `notes/` 用來保留討論脈絡，正式決策仍應回寫到對應的專案文件或功能 Spec。
- `archive/` 只供追溯，不得單獨用來判定現行需求。
