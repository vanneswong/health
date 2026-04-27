@echo off
echo ========================================
echo    BP Buddy - Stop Service
echo ========================================
echo.
echo Finding and stopping backend service...
taskkill /f /im server.exe 2>nul
if errorlevel 1 (
    echo [Info] No running service found
) else (
    echo [Success] Service stopped
)
echo.
pause
