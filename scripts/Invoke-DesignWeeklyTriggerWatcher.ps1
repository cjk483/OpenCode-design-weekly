param(
    [string]$TriggerDirectory = "$env:USERPROFILE\.codex\design-weekly-triggers",
    [int]$MaxRunningMinutes = 90
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$launcher = Join-Path $workspace "scripts\Start-DesignWeeklyDeck.ps1"
$outputDirectory = Join-Path $workspace "output"
$statusDirectory = Join-Path $outputDirectory "_STATUS"
$archiveDirectory = Join-Path $TriggerDirectory "archive"

New-Item -ItemType Directory -Force -Path $TriggerDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $statusDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $archiveDirectory | Out-Null

$validSites = @("ArchDaily", "ArchitecturalDigest", "Designboom", "Dezeen", "gooood", "Wallpaper")
$siteDisplayNames = @{
    ArchDaily = "ArchDaily"
    ArchitecturalDigest = "Architectural Digest"
    Designboom = "Designboom"
    Dezeen = "Dezeen"
    gooood = "gooood"
    Wallpaper = "Wallpaper*"
}

function Get-SafeName {
    param([string]$Value)

    return ($Value -replace "[^A-Za-z0-9_-]+", "_").Trim("_")
}

function Write-DesignWeeklyStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Site,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Message = ""
    )

    $siteName = $siteDisplayNames[$Site]
    if (-not $siteName) {
        $siteName = $Site
    }

    $safeSite = Get-SafeName $siteName
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
    $statusLine = "$timestamp | $siteName | $Status | $Message |  | Pages: "

    Set-Content -Path (Join-Path $statusDirectory "${safeSite}_latest.txt") -Value $statusLine -Encoding UTF8
    Add-Content -Path (Join-Path $statusDirectory "design-weekly-history.log") -Value $statusLine -Encoding UTF8
}

function Test-WeeklyProcessActive {
    try {
        $processes = Get-CimInstance Win32_Process -Filter "name = 'powershell.exe' OR name = 'pwsh.exe'" -ErrorAction Stop
    } catch {
        return $true
    }

    foreach ($process in $processes) {
        $commandLine = [string]$process.CommandLine
        if ($commandLine -match "Invoke-DesignWeeklyDeck\.ps1" -or $commandLine -match "Start-DesignWeeklyDeck\.ps1") {
            return $true
        }
    }

    return $false
}

$staleCutoff = (Get-Date).AddMinutes(-1 * $MaxRunningMinutes)
Get-ChildItem -Path $TriggerDirectory -File -Filter "*.running" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $staleCutoff } |
    ForEach-Object {
        $site = (Get-Content -LiteralPath $_.FullName -Raw).Trim()
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

        if (Test-WeeklyProcessActive) {
            return
        }

        if ($site -in $validSites) {
            Write-DesignWeeklyStatus -Site $site -Status "FAILED" -Message "Stale running trigger exceeded $MaxRunningMinutes minutes; no active weekly process was found."
        }

        Move-Item -LiteralPath $_.FullName -Destination (Join-Path $archiveDirectory "$($_.BaseName)-stale-$timestamp.txt") -Force
    }

Get-ChildItem -Path $statusDirectory -File -Filter "*_latest.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $staleCutoff } |
    ForEach-Object {
        $content = Get-Content -LiteralPath $_.FullName -Raw
        if ($content -notmatch "\|\s*RUNNING\s*\|") {
            return
        }

        if (Test-WeeklyProcessActive) {
            return
        }

        $parts = $content -split "\|"
        if ($parts.Count -lt 2) {
            return
        }

        $siteName = $parts[1].Trim()
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
        $message = "Stale RUNNING status exceeded $MaxRunningMinutes minutes; no active weekly process was found."
        $statusLine = "$timestamp | $siteName | FAILED | $message |  | Pages: "

        Set-Content -Path $_.FullName -Value $statusLine -Encoding UTF8
        Add-Content -Path (Join-Path $statusDirectory "design-weekly-history.log") -Value $statusLine -Encoding UTF8
    }

$triggers = Get-ChildItem -Path $TriggerDirectory -File -Filter "*.trigger" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime

foreach ($trigger in $triggers) {
    $queuedPath = [IO.Path]::ChangeExtension($trigger.FullName, ".queued")
    try {
        Move-Item -LiteralPath $trigger.FullName -Destination $queuedPath -ErrorAction Stop
    } catch {
        continue
    }

    $site = (Get-Content -LiteralPath $queuedPath -Raw).Trim()
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

    if ($site -notin $validSites) {
        Move-Item -LiteralPath $queuedPath -Destination (Join-Path $archiveDirectory "$($trigger.BaseName)-invalid-$timestamp.txt") -Force
        continue
    }

    try {
        Write-DesignWeeklyStatus -Site $site -Status "QUEUED" -Message "Trigger accepted; launching weekly report process."
        Start-Process -FilePath "powershell.exe" -ArgumentList @(
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-File", $launcher,
            "-Site", $site
        ) -WindowStyle Hidden
        Move-Item -LiteralPath $queuedPath -Destination (Join-Path $archiveDirectory "$($trigger.BaseName)-launched-$timestamp.txt") -Force
    } catch {
        $failedPath = Join-Path $archiveDirectory "$($trigger.BaseName)-failed-$timestamp.txt"
        @(
            "Site: $site"
            "Error: $($_.Exception.Message)"
        ) | Set-Content -Path $failedPath -Encoding UTF8
        Write-DesignWeeklyStatus -Site $site -Status "FAILED" -Message "Trigger launch failed: $($_.Exception.Message)"
        Remove-Item -LiteralPath $queuedPath -Force -ErrorAction SilentlyContinue
    }
}
