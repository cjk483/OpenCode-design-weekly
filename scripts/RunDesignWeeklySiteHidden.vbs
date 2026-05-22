If WScript.Arguments.Count = 0 Then
    WScript.Quit 1
End If

site = WScript.Arguments(0)

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
launcher = fso.BuildPath(scriptDir, "Start-DesignWeeklyDeck.ps1")

command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " & Chr(34) & launcher & Chr(34) & " -Site " & Chr(34) & site & Chr(34)
shell.Run command, 0, True
