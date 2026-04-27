@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    血压宝 (BP Buddy) 启动脚本
echo ========================================
echo.

set DEFAULT_PORT=8080

set /p USER_PORT=请输入运行端口 (默认 8080): 

if "%USER_PORT%"=="" set USER_PORT=%DEFAULT_PORT%

echo %USER_PORT%| findstr /r "^[0-9][0-9]*$" >/dev/null
if errorlevel 1 (
    echo [警告] 端口格式错误，使用默认端口 8080
    set USER_PORT=8080
)

if %USER_PORT% LSS 1 (
    echo [警告] 端口太小，使用默认端口 8080
    set USER_PORT=8080
)
if %USER_PORT% GTR 65535 (
    echo [警告] 端口太大，使用默认端口 8080
    set USER_PORT=8080
)

echo.
echo [信息] 使用端口: %USER_PORT%
echo.

netstat -ano | findstr ":%USER_PORT%" >/dev/null
if not errorlevel 1 (
    echo [错误] 端口 %USER_PORT% 已被占用!
    echo 请选择其他端口或关闭占用该端口的程序
    echo.
    pause
    exit /b 1
)

echo [信息] 正在启动后端服务...
echo.

set BP_PORT=%USER_PORT%
start "" server.exe

timeout /t 2 /nobreak >/dev/null

echo ========================================
echo    服务已启动成功!
echo ========================================
echo.
echo    访问地址: http://localhost:%USER_PORT%
echo.
echo    默认账号: admin
echo    默认密码: admin
echo.
echo    首次登录后请修改密码!
echo ========================================
echo.
echo 按任意键退出此窗口 (服务将继续运行)
pause >/dev/null