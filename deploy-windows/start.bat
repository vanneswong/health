@echo off
chcp 65001 >nul
echo ========================================
echo    血压宝 (BP Buddy) 启动脚本
echo ========================================
echo.
echo 正在启动后端服务...
start "" server.exe
echo.
echo 后端服务已在端口 8080 启动
echo 请访问 http://localhost:8080 使用应用
echo.
echo 默认账号: admin / admin
echo 首次登录后请修改密码！
echo ========================================
pause