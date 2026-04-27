@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    BP Buddy - Blood Pressure Tracker
echo ========================================
echo.

set DEFAULT_PORT=8080

set /p USER_PORT=Enter port (default 8080): 

if """%USER_PORT%"""=="""" set USER_PORT=%DEFAULT_PORT%

echo %USER_PORT%| findstr /r "^[0-9][0-9]*$" >nul
if errorlevel 1 (
    echo [Warning] Invalid port format, using default 8080
    set USER_PORT=8080
)

if %USER_PORT% LSS 1 (
    echo [Warning] Port too small, using default 8080
    set USER_PORT=8080
)
if %USER_PORT% GTR 65535 (
    echo [Warning] Port too large, using default 8080
    set USER_PORT=8080
)

echo.
echo [Info] Using port: %USER_PORT%
echo.

netstat -ano | findstr ":%USER_PORT%" >nul
if not errorlevel 1 (
    echo [Error] Port %USER_PORT% is already in use!
    echo Please choose another port
    echo.
    pause
    exit /b 1
)

echo [Info] Starting backend service...
echo.

set BP_PORT=%USER_PORT%
start """ server.exe

ping 127.0.0.1 -n 2 >nul

echo ========================================
echo    Service started successfully!
echo ========================================
echo.
echo    URL: http://localhost:%USER_PORT%
echo.
echo    Default account: admin
echo    Default password: admin
echo.
echo    Please change password after first login!
echo ========================================
echo.
echo Press any key to close this window
pause
