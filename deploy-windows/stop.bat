@echo off
echo ========================================
echo    血压宝 (BP Buddy) 停止脚本
echo ========================================
echo.
echo 正在查找并停止后端服务...
taskkill /f /im server.exe 2>nul
if errorlevel 1 (
    echo [信息] 未找到运行中的服务
) else (
    echo [成功] 服务已停止
)
echo.
pause