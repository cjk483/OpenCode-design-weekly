param(
    [string]$OutputDirectory = ".\output",
    [string]$Profile = "default",
    [ValidateSet("fast", "deep")]
    [string]$ResearchMode = "deep",
    [int]$MaxWaitMinutes = 20,
    [int]$PollSeconds = 30
)

$ErrorActionPreference = "Stop"

function Invoke-Nlm {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

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
    if ($match.Success) {
        return $match.Value
    }

    return $null
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
    $statusLine = "$timestamp | ArchDaily | $Status | $Message | $PdfPath | Pages: $Pages"
    $latestPath = Join-Path $statusDirectory "ArchDaily_latest.txt"
    $historyPath = Join-Path $statusDirectory "design-weekly-history.log"

    Set-Content -Path $latestPath -Value $statusLine -Encoding UTF8
    Add-Content -Path $historyPath -Value $statusLine -Encoding UTF8
}

function Get-NotebookIdByTitle {
    param([string]$Title)

    $jsonText = Invoke-Nlm -Arguments @("list", "notebooks", "--json", "--profile", $Profile)
    $items = $jsonText | ConvertFrom-Json

    $match = $items | Where-Object {
        $_.title -eq $Title -or $_.name -eq $Title
    } | Select-Object -First 1

    if ($null -eq $match) {
        return $null
    }

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
        if ($PreferredArtifactId) {
            $matched = @($artifact) | Where-Object { $_.id -eq $PreferredArtifactId } | Select-Object -First 1
            if ($matched) {
                $artifact = $matched
            }
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

function ConvertFrom-Base64Utf8 {
    param([Parameter(Mandatory = $true)][string]$Value)

    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Value))
}

$today = Get-Date
$weekStart = $today.AddDays(-7).ToString("yyyy-MM-dd")
$weekEnd = $today.ToString("yyyy-MM-dd")
$dateStamp = $today.ToString("yyyy-MM-dd")
$title = "ArchDaily $(ConvertFrom-Base64Utf8 '5q+P6YCx6Kit6KiI5paw6IGe') $dateStamp"
$safeSite = Get-SafeName "ArchDaily"
$siteFolder = $safeSite.ToUpperInvariant()
$siteOutputDirectory = Get-SiteOutputDirectory -BaseOutputDirectory $OutputDirectory -SiteFolderName $siteFolder
$safeName = "ArchDaily_Weekly_Design_News_${dateStamp}_tmp.pdf"

New-Item -ItemType Directory -Force -Path $siteOutputDirectory | Out-Null
$outputPath = Join-Path $siteOutputDirectory $safeName
Write-DesignWeeklyStatus -Status "RUNNING" -Message "NotebookLM research started"

trap {
    try {
        Write-DesignWeeklyStatus -Status "FAILED" -Message $_.Exception.Message
    } catch {
    }
    throw $_
}

$query = (@"
site:archdaily.com ArchDaily architecture design news projects interviews after:$weekStart before:$weekEnd
Only collect ArchDaily sources published or updated between $weekStart and $weekEnd.
Do not use older background articles unless they are needed only to identify context for a current-week ArchDaily news item.
"@).Trim()

$focus = ConvertFrom-Base64Utf8 "6KuL5Lul57mB6auU5Lit5paH6KO95L2c5LiA5Lu944CMQXJjaERhaWx5IOavj+mAseioreioiOaWsOiBnuOAjTIwIOmggeOAgTE2Ojkg55qEIFBERiDnsKHloLHjgIIK6KaW6Ka66aKo5qC86KuL57Ch5r2U5Lm+5reo77yM5o6l6L+R54Sh5Y2w6Imv5ZOB77ya5aSn6YeP55WZ55m944CB5L2O6aO95ZKM5Lit5oCn6Imy44CB5riF5qWa5bGk57Sa44CB6YG/5YWN6YGO5bqm6KOd6aO+44CCCuiLpeS9v+eUqOeFp+eJh++8jOiri+S9v+eUqOW9qeiJsueFp+eJh+OAguWFp+Wuueiri+iBmueEpui/keS4gOmAsSBBcmNoRGFpbHkg55qE5bu656+J44CB5a6k5YWn44CB6YO95biC44CB6Kit6KiI5paw6IGe6IiH5YC85b6X6L+96Lmk55qE6Lao5Yui44CCCuW7uuitsOe1kOani++8muWwgemdoiAxIOmggeOAgemAsemHjem7niAxIOmggeOAgeaWsOiBnueyvumBuCAxMCDpoIHjgIHotqjli6Lop4Dlr58gNCDpoIHjgIHoqK3oqIjllZ/nmbwgMyDpoIHjgIHntZDoqp4gMSDpoIHjgIIK5q+P6aCB6KuL5pyJ5riF5qWa5qiZ6aGM44CB55+t5Y+l6YeN6bue44CB5L6G5rqQ6ISI57Wh77yM5LiN6KaB5aGe5ru/5paH5a2X44CC"

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
$normalizedOutputPath = Join-Path $siteOutputDirectory "ArchDaily_Weekly_Design_News_${dateStamp}_20p.pdf"
$pageCount = & $python ".\scripts\ensure_pdf_pages.py" $outputPath $normalizedOutputPath --target-pages 20
if ($LASTEXITCODE -ne 0) {
    throw "PDF page normalization failed."
}

Remove-Item -LiteralPath $outputPath -Force -ErrorAction SilentlyContinue

Write-Host "Done."
Write-Host "Notebook ID: $notebookId"
if ($artifactId) {
    Write-Host "Artifact ID: $artifactId"
}
Write-Host "PDF: $normalizedOutputPath"
Write-Host "Pages: $pageCount"
Write-DesignWeeklyStatus -Status "DONE" -Message "PDF ready" -PdfPath $normalizedOutputPath -Pages $pageCount
