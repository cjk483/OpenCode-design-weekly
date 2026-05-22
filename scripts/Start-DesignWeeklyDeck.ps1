param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("ArchDaily", "ArchitecturalDigest", "Designboom", "Dezeen", "FRAME", "gooood", "Wallpaper")]
    [string]$Site,
    [switch]$Background
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$scriptPath = Join-Path $workspace "scripts\Invoke-WeeklyEditorialReports.ps1"

$siteMap = @{
    ArchDaily = "ARCHDAILY"
    ArchitecturalDigest = "ARCHITECTURAL_DIGEST"
    Designboom = "DESIGNBOOM"
    Dezeen = "DEZEEN"
    FRAME = "FRAME"
    gooood = "GOOOOD"
    Wallpaper = "WALLPAPER"
}

$siteKey = $siteMap[$Site]
$arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $scriptPath,
    "-Mode", "CatchUp",
    "-NoPdf",
    "-Site", $siteKey
)

if ($Background) {
    $logDirectory = Join-Path $workspace "output\_LOGS"
    New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
    $runStamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $logPath = Join-Path $logDirectory "${siteKey}_${runStamp}.log"
    $errorLogPath = Join-Path $logDirectory "${siteKey}_${runStamp}.err.log"
    Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -WorkingDirectory $workspace -WindowStyle Hidden -RedirectStandardOutput $logPath -RedirectStandardError $errorLogPath | Out-Null
    Write-Host "Started $siteKey weekly HTML report in background."
    Write-Host "Status: output\_HTML_STATUS\${siteKey}_latest.txt"
    exit 0
}

& powershell.exe @arguments
exit $LASTEXITCODE
