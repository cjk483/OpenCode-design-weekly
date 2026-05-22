param(
    [string]$TaskName = "Codex Weekly Editorial HTML Reports",
    [string]$StartTime = "10:00"
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$hiddenRunner = Join-Path $workspace "scripts\RunWeeklyEditorialReportsHidden.vbs"

$taskCommand = "wscript.exe //B //NoLogo `"$hiddenRunner`""

try {
    $weeklyAction = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "//B //NoLogo `"$hiddenRunner`"" -WorkingDirectory $workspace
    $weeklyTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At ([datetime]::ParseExact($StartTime, "HH:mm", [Globalization.CultureInfo]::InvariantCulture))
    $logonTrigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 4)
    $task = New-ScheduledTask -Action $weeklyAction -Trigger @($weeklyTrigger, $logonTrigger) -Principal $principal -Settings $settings

    Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
    Write-Host "Registered: $TaskName"
    Write-Host "Schedule: every Friday at $StartTime, plus logon catch-up check."
} catch {
    Write-Host "Register-ScheduledTask failed; falling back to schtasks.exe."

    $weeklyName = $TaskName
    $logonName = "$TaskName CatchUp"

    & schtasks.exe /Create /TN $weeklyName /SC WEEKLY /D FRI /ST $StartTime /TR $taskCommand /F | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to register weekly task with schtasks.exe."
    }

    & schtasks.exe /Create /TN $logonName /SC ONLOGON /TR $taskCommand /F | Out-Host
    if ($LASTEXITCODE -ne 0) {
        $startup = [Environment]::GetFolderPath("Startup")
        $startupFile = Join-Path $startup "CodexWeeklyEditorialReportsCatchUp.vbs"
        $startupLines = @(
            'Set shell = CreateObject("WScript.Shell")',
            ('shell.Run "wscript.exe //B //NoLogo ""{0}""", 0, False' -f $hiddenRunner)
        )
        [System.IO.File]::WriteAllLines($startupFile, [string[]]$startupLines, [System.Text.Encoding]::Unicode)
        Write-Host "Logon scheduled task was denied; created Startup catch-up launcher instead:"
        Write-Host $startupFile
    } else {
        Write-Host "Registered: $logonName"
    }

    Write-Host "Registered: $weeklyName"
    Write-Host "Schedule: every Friday at $StartTime, plus logon catch-up check."
}
