# 設計週報排程紀錄

## 排程工作

- **工作名稱**: OpenCodeDesignWeekly
- **執行時間**: 每週五 10:00
- **觸發腳本**: `run-weekly-design-reports.cmd`
- **底層腳本**: `scripts\Invoke-WeeklyEditorialReports.ps1` → `scripts\build_weekly_editorial_reports.mjs`
- **運作方式**: Node.js 直接抓 RSS + 產 HTML，不經 OpenCode CLI

## 7 站輸出

| 站點 | Site Key | 輸出資料夾 |
|------|----------|-----------|
| ArchDaily | ARCHDAILY | `output\ARCHDAILY\` |
| Dezeen | DEZEEN | `output\DEZEEN\` |
| Designboom | DESIGNBOOM | `output\DESIGNBOOM\` |
| Wallpaper\* | WALLPAPER | `output\WALLPAPER\` |
| gooood | GOOOOD | `output\GOOOOD\` |
| Architectural Digest | ARCHITECTURAL_DIGEST | `output\ARCHITECTURAL_DIGEST\` |
| FRAME | FRAME | `output\FRAME\` |

## 建立日期

2026-05-22
