@echo off
rem Bouira Python Studio - local launcher for Windows (double-click).
cd /d "%~dp0"
set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY where python >nul 2>nul && set "PY=python"
if not defined PY (
  echo Python 3 is required only to START the local server. Install it from https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^).
  pause & exit /b 1
)
if not exist "www\pyodide\pyodide.asm.wasm" (
  echo First start: preparing the offline Python runtime ^(internet needed ONCE, about 100 MB^)...
  %PY% scripts\fetch_pyodide.py || (echo Download failed. Check the internet connection and try again. & pause & exit /b 1)
  %PY% scripts\make_precache.py
)
echo Starting Bouira Python Studio on http://localhost:8000  - close this window to stop.
%PY% scripts\serve.py --port 8000
pause
