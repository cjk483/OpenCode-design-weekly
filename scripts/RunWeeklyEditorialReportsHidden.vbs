Set shell = CreateObject("WScript.Shell")
scriptPath = WScript.ScriptFullName
scriptDir = Left(scriptPath, InStrRev(scriptPath, "\") - 1)
workspace = Left(scriptDir, InStrRev(scriptDir, "\") - 1)
psScript = scriptDir & "\Invoke-WeeklyEditorialReports.ps1"
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & psScript & """ -Mode CatchUp -NoPdf"
shell.CurrentDirectory = workspace
shell.Run command, 0, False
