param(
    [Parameter(Mandatory = $true)]
    [string]$SiteName,
    [Parameter(Mandatory = $true)]
    [string]$SiteDomain,
    [string]$TopicKeywords = "architecture design interiors urbanism projects interviews news",
    [string]$OutputDirectory = ".\output",
    [string]$Profile = "default",
    [ValidateSet("fast", "deep")]
    [string]$ResearchMode = "deep",
    [int]$TargetPages = 20,
    [int]$MaxWaitMinutes = 20,
    [int]$PollSeconds = 30
)

$ErrorActionPreference = "Stop"

function Invoke-Nlm {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $output = & nlm @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    $text = ($output | Out-String).Trim()

    if ($exitCode -ne 0) {
        throw "nlm $($Arguments -join ' ') failed with exit code $exitCode.`n$text"
    }

    return $text
}

function Get-FirstUuid {
    param([string]$Text)

    $match = [regex]::Match($Text, "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    if ($match.Success) { return $match.Value }
    return $null
}

function Get-NotebookIdByTitle {
    param([string]$Title)

    $jsonText = Invoke-Nlm -Arguments @("list", "notebooks", "--json", "--profile", $Profile)
    $items = $jsonText | ConvertFrom-Json

    $match = $items | Where-Object {
        $_.title -eq $Title -or $_.name -eq $Title
    } | Select-Object -First 1

    if ($null -eq $match) { return $null }
    if ($match.id) { return $match.id }
    if ($match.notebook_id) { return $match.notebook_id }
    if ($match.uuid) { return $match.uuid }
    return $null
}

function Get-LatestSlideDeckArtifact {
    param([Parameter(Mandatory = $true)][string]$NotebookId)

    $jsonText = Invoke-Nlm -Arguments @("list", "artifacts", $NotebookId, "--full", "--json", "--profile", $Profile)
    $items = @($jsonText | ConvertFrom-Json)

    return $items |
        Where-Object { $_.type -eq "slide_deck" } |
        Sort-Object -Property created_at -Descending |
        Select-Object -First 1
}

function Wait-SlideDeckArtifact {
    param(
        [Parameter(Mandatory = $true)][string]$NotebookId,
        [string]$PreferredArtifactId
    )

    $deadline = (Get-Date).AddMinutes($MaxWaitMinutes)
    do {
        $artifact = Get-LatestSlideDeckArtifact -NotebookId $NotebookId
        if ($PreferredArtifactId -and $artifact -and $artifact.id -ne $PreferredArtifactId) {
            $preferred = @($artifact) | Where-Object { $_.id -eq $PreferredArtifactId } | Select-Object -First 1
            if ($preferred) { $artifact = $preferred }
        }

        if ($artifact -and $artifact.status -in @("complete", "completed", "ready")) {
            return $artifact
        }

        if ($artifact -and $artifact.status -in @("failed", "error")) {
            throw "Slide deck artifact failed. Artifact ID: $($artifact.id)"
        }

        $status = if ($artifact) { $artifact.status } else { "not_found" }
        Write-Host "Waiting for slide deck artifact. Status: $status"
        Start-Sleep -Seconds $PollSeconds
    } while ((Get-Date) -lt $deadline)

    throw "Timed out waiting for slide deck artifact after $MaxWaitMinutes minutes."
}

function Get-SafeName {
    param([string]$Value)

    return ($Value -replace "[^A-Za-z0-9_-]+", "_").Trim("_")
}

function Get-SiteOutputDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$BaseOutputDirectory,
        [Parameter(Mandatory = $true)][string]$SiteFolderName
    )

    $leaf = Split-Path -Leaf $BaseOutputDirectory
    if ($leaf -and ($leaf.ToUpperInvariant() -eq $SiteFolderName.ToUpperInvariant())) {
        return $BaseOutputDirectory
    }

    return (Join-Path $BaseOutputDirectory $SiteFolderName)
}

function Write-DesignWeeklyStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Message = "",
        [string]$PdfPath = "",
        [string]$Pages = ""
    )

    $statusDirectory = Join-Path $OutputDirectory "_STATUS"
    New-Item -ItemType Directory -Force -Path $statusDirectory | Out-Null

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
    $statusLine = "$timestamp | $SiteName | $Status | $Message | $PdfPath | Pages: $Pages"
    $latestPath = Join-Path $statusDirectory "${safeSite}_latest.txt"
    $historyPath = Join-Path $statusDirectory "design-weekly-history.log"

    Set-Content -Path $latestPath -Value $statusLine -Encoding UTF8
    Add-Content -Path $historyPath -Value $statusLine -Encoding UTF8
}

$today = Get-Date
$weekStart = $today.AddDays(-7).ToString("yyyy-MM-dd")
$weekEnd = $today.ToString("yyyy-MM-dd")
$dateStamp = $today.ToString("yyyy-MM-dd")
$title = "$SiteName Weekly Design News $dateStamp"
$safeSite = Get-SafeName $SiteName
$siteFolder = $safeSite.ToUpperInvariant()
$siteOutputDirectory = Get-SiteOutputDirectory -BaseOutputDirectory $OutputDirectory -SiteFolderName $siteFolder
$tempName = "${safeSite}_Weekly_Design_News_${dateStamp}_tmp.pdf"

New-Item -ItemType Directory -Force -Path $siteOutputDirectory | Out-Null
$outputPath = Join-Path $siteOutputDirectory $tempName
Write-DesignWeeklyStatus -Status "RUNNING" -Message "NotebookLM research started"

trap {
    try {
        Write-DesignWeeklyStatus -Status "FAILED" -Message $_.Exception.Message
    } catch {
    }
    throw $_
}

$query = (@"
site:$SiteDomain $SiteName $TopicKeywords after:$weekStart before:$weekEnd
Only collect $SiteName sources published or updated between $weekStart and $weekEnd.
Do not use older background articles unless they are needed only to identify context for a current-week $SiteName news item.
"@).Trim()

$focus = @"
Create a $TargetPages-page, 16:9 PDF slide deck in Traditional Chinese about the weekly design news from $SiteName.
Use a clean, minimal, quiet style similar to MUJI: generous whitespace, neutral low-saturation colors, clear hierarchy, and restrained decoration.
Use color photos when photos are available.
Focus only on $SiteName architecture, interior, urbanism, product/design, and creative industry news published or updated during the last 7 days.
Suggested structure: 1 cover page, 1 weekly highlights page, 10 selected news pages, 4 trend observation pages, 3 design inspiration pages, and 1 closing page.
Each page should have a clear title, concise key points, and source context. Avoid dense text.
"@.Trim()

Write-Host "Starting NotebookLM research: $title"
$researchOutput = Invoke-Nlm -Arguments @(
    "research", "start", $query,
    "--source", "web",
    "--mode", $ResearchMode,
    "--title", $title,
    "--auto-import",
    "--profile", $Profile
)

$notebookId = Get-FirstUuid -Text $researchOutput
if (-not $notebookId) {
    $notebookId = Get-NotebookIdByTitle -Title $title
}
if (-not $notebookId) {
    throw "Could not determine NotebookLM notebook ID from research output or notebook list.`n$researchOutput"
}

Write-Host "Creating slide deck in notebook: $notebookId"
$slidesOutput = Invoke-Nlm -Arguments @(
    "slides", "create", $notebookId,
    "--format", "detailed_deck",
    "--length", "default",
    "--language", "zh-TW",
    "--focus", $focus,
    "--confirm",
    "--profile", $Profile
)

$artifactId = Get-FirstUuid -Text $slidesOutput
$artifact = Wait-SlideDeckArtifact -NotebookId $notebookId -PreferredArtifactId $artifactId
$artifactId = $artifact.id

$downloadArgs = @(
    "download", "slide-deck", $notebookId,
    "--format", "pdf",
    "--output", $outputPath,
    "--no-progress"
)
if ($artifactId) {
    $downloadArgs += @("--id", $artifactId)
}

Write-Host "Downloading PDF: $outputPath"
$downloadOutput = Invoke-Nlm -Arguments $downloadArgs

$pythonCandidates = @(
    "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe",
    "python"
)
$python = $pythonCandidates | Where-Object { $_ -eq "python" -or (Test-Path $_) } | Select-Object -First 1
$normalizedOutputPath = Join-Path $siteOutputDirectory "${safeSite}_Weekly_Design_News_${dateStamp}_${TargetPages}p.pdf"
$pageCount = & $python ".\scripts\ensure_pdf_pages.py" $outputPath $normalizedOutputPath --target-pages $TargetPages
if ($LASTEXITCODE -ne 0) {
    throw "PDF page normalization failed."
}

Remove-Item -LiteralPath $outputPath -Force -ErrorAction SilentlyContinue

Write-Host "Done."
Write-Host "Notebook ID: $notebookId"
if ($artifactId) { Write-Host "Artifact ID: $artifactId" }
Write-Host "PDF: $normalizedOutputPath"
Write-Host "Pages: $pageCount"
Write-DesignWeeklyStatus -Status "DONE" -Message "PDF ready" -PdfPath $normalizedOutputPath -Pages $pageCount
