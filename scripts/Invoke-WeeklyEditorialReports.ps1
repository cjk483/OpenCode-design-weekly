param(
    [ValidateSet("Once", "CatchUp")]
    [string]$Mode = "CatchUp",
    [string[]]$Site = @(),
    [switch]$Force,
    [switch]$NoPdf
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$statusDirectory = Join-Path $workspace "output\_HTML_STATUS"
$logDirectory = Join-Path $workspace "output\_LOGS"
New-Item -ItemType Directory -Force -Path $statusDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

$today = Get-Date
$fridayTen = $today.Date.AddDays(([int][DayOfWeek]::Friday - [int]$today.DayOfWeek)).AddHours(10)
if ($fridayTen -gt $today) {
    $fridayTen = $fridayTen.AddDays(-7)
}
$issueDate = $fridayTen.ToString("yyyy-MM-dd")
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDirectory "weekly-editorial-$stamp.log"
$errorLogPath = Join-Path $logDirectory "weekly-editorial-$stamp.err.log"

$nodeScript = Join-Path $workspace "scripts\build_weekly_editorial_reports.mjs"
$arguments = @($nodeScript, "--date", $issueDate)

foreach ($siteName in $Site) {
    $arguments += @("--site", $siteName)
}
if ($Force) {
    $arguments += "--force"
}
if ($NoPdf) {
    $arguments += "--no-pdf"
}

if ($Mode -eq "CatchUp") {
    $allDone = $true
    $siteKeys = @("ARCHDAILY", "FRAME", "GOOOOD", "WALLPAPER", "ARCHITECTURAL_DIGEST", "DEZEEN", "DESIGNBOOM")
    foreach ($siteKey in $siteKeys) {
        $htmlPath = Join-Path $workspace "output\$siteKey\${siteKey}_Weekly_Design_News_${issueDate}_15p.html"
        $pdfPath = Join-Path $workspace "output\$siteKey\${siteKey}_Weekly_Design_News_${issueDate}_15p.pdf"
        if (-not (Test-Path -LiteralPath $htmlPath) -or (-not $NoPdf -and -not (Test-Path -LiteralPath $pdfPath))) {
            $allDone = $false
            break
        }
    }
    if ($allDone -and -not $Force) {
        $message = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz') | ALL | DONE | Catch-up skipped; current Friday issue already exists."
        Set-Content -Path (Join-Path $statusDirectory "ALL_latest.txt") -Value $message -Encoding UTF8
        Add-Content -Path (Join-Path $statusDirectory "weekly-html-history.log") -Value $message -Encoding UTF8
        exit 0
    }
}

$process = Start-Process -FilePath "node.exe" -ArgumentList $arguments -WorkingDirectory $workspace -NoNewWindow -Wait -PassThru -RedirectStandardOutput $logPath -RedirectStandardError $errorLogPath
if ($process.ExitCode -ne 0) {
    $errorText = ""
    if (Test-Path -LiteralPath $errorLogPath) {
        $errorText = ((Get-Content -LiteralPath $errorLogPath -Tail 20 -ErrorAction SilentlyContinue) -join " ").Trim()
    }
    throw "Weekly editorial report failed with code $($process.ExitCode). $errorText"
}
