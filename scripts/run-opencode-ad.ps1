$prompt = "用 WebSearch 搜尋 site:architecturaldigest.com 近期設計文章，選12篇，生成15頁 scroll-snap HTML 週報，繁體中文。存到 output\ARCHITECTURAL_DIGEST\，檔名 ARCHITECTURAL_DIGEST_Weekly_Design_News_YYYY-MM-DD_15p.html。不要 PDF"
$workdir = "G:\我的雲端硬碟\2026codex\2026notebookLM"
Set-Location $workdir
& "C:\Users\cjk48\AppData\Roaming\npm\opencode.cmd" run -- $prompt
