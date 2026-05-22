param(
    [string]$TaskName = "Codex Design Weekly Trigger Watcher"
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$hiddenWatcher = Join-Path $workspace "scripts\RunDesignWeeklyTriggerWatcherHidden.vbs"
$triggerDirectory = Join-Path $env:USERPROFILE ".codex\design-weekly-triggers"

New-Item -ItemType Directory -Force -Path $triggerDirectory | Out-Null

$argument = "//B //NoLogo `"$hiddenWatcher`""
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument $argument -WorkingDirectory $workspace
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings

Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
Write-Host "Registered: $TaskName"
Write-Host "Trigger directory: $triggerDirectory"
