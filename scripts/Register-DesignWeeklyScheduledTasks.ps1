param(
    [string]$TaskPrefix = "Codex Design Weekly",
    [string]$StartTime = "09:00"
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$hiddenSiteLauncher = Join-Path $workspace "scripts\RunDesignWeeklySiteHidden.vbs"

$sites = @(
    @{ Key = "ArchDaily"; Name = "ArchDaily"; OffsetMinutes = 0 },
    @{ Key = "ArchitecturalDigest"; Name = "Architectural Digest"; OffsetMinutes = 15 },
    @{ Key = "Designboom"; Name = "Designboom"; OffsetMinutes = 30 },
    @{ Key = "Dezeen"; Name = "Dezeen"; OffsetMinutes = 45 },
    @{ Key = "gooood"; Name = "gooood"; OffsetMinutes = 60 },
    @{ Key = "Wallpaper"; Name = "Wallpaper"; OffsetMinutes = 75 }
)

$baseTime = [datetime]::ParseExact($StartTime, "HH:mm", [Globalization.CultureInfo]::InvariantCulture)

foreach ($site in $sites) {
    $runTime = $baseTime.AddMinutes($site.OffsetMinutes)
    $taskName = "$TaskPrefix - $($site.Name)"
    $argument = "//B //NoLogo `"$hiddenSiteLauncher`" `"$($site.Key)`""
    $action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument $argument -WorkingDirectory $workspace
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $runTime
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
    $task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings

    Register-ScheduledTask -TaskName $taskName -InputObject $task -Force | Out-Null
    Write-Host "Registered: $taskName at $($runTime.ToString('HH:mm'))"
}
