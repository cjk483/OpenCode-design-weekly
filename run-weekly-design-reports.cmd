@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d G:\我的雲端硬碟\2026codex\2026notebookLM
powershell -NoProfile -ExecutionPolicy Bypass -File "G:\我的雲端硬碟\2026codex\2026notebookLM\scripts\Invoke-WeeklyEditorialReports.ps1" -Mode CatchUp -NoPdf
