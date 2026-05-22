Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
watcher = fso.BuildPath(scriptDir, "Invoke-DesignWeeklyTriggerWatcher.ps1")
triggerDirectory = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.codex\design-weekly-triggers"

command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " & Chr(34) & watcher & Chr(34) & " -TriggerDirectory " & Chr(34) & triggerDirectory & Chr(34)
shell.Run command, 0, True
