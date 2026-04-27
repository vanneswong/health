#!/bin/bash
#
# 血压宝 (BP Buddy) 状态检查脚本
#

APP_NAME="bp-buddy"
INSTALL_DIR="/opt/$APP_NAME"
DATA_DIR="/var/lib/$APP_NAME"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "========================================"
echo "   血压宝 (BP Buddy) 状态检查"
echo "========================================"
echo -e "${NC}"

# 服务状态
echo -e "${YELLOW}服务状态:${NC}"
if systemctl is-active --quiet $APP_NAME; then
    echo -e "  后端服务: ${GREEN}运行中${NC}"
    PORT=$(cat /etc/systemd/system/$APP_NAME.service | grep BP_PORT | cut -d= -f3)
    echo -e "  运行端口: ${BLUE}$PORT${NC}"
else
    echo -e "  后端服务: ${RED}未运行${NC}"
fi

# Nginx状态
if systemctl is-active --quiet nginx; then
    echo -e "  Nginx:    ${GREEN}运行中${NC}"
else
    echo -e "  Nginx:    ${RED}未运行${NC}"
fi

# 文件检查
echo ""
echo -e "${YELLOW}文件检查:${NC}"
if [ -f "$INSTALL_DIR/server" ]; then
    echo -e "  后端程序: ${GREEN}存在${NC}"
else
    echo -e "  后端程序: ${RED}不存在${NC}"
fi

if [ -d "$INSTALL_DIR/frontend" ]; then
    echo -e "  前端文件: ${GREEN}存在${NC}"
else
    echo -e "  前端文件: ${RED}不存在${NC}"
fi

if [ -f "$DATA_DIR/bp_buddy.json" ]; then
    SIZE=$(ls -lh $DATA_DIR/bp_buddy.json | awk '{print $5}')
    echo -e "  数据文件: ${GREEN}存在${NC} ($SIZE)"
else
    echo -e "  数据文件: ${YELLOW}不存在${NC} (首次运行后创建)"
fi

# 端口检查
echo ""
echo -e "${YELLOW}端口检查:${NC}"
PORT=$(cat /etc/systemd/system/$APP_NAME.service | grep BP_PORT | cut -d= -f3 || echo "8080")
if netstat -tlnp 2>/dev/null | grep -q ":$PORT"; then
    echo -e "  端口 $PORT: ${GREEN}已监听${NC}"
else
    echo -e "  端口 $PORT: ${RED}未监听${NC}"
fi

# 访问地址
echo ""
echo -e "${YELLOW}访问地址:${NC}"
IP=$(hostname -I | awk '{print $1}')
echo -e "  本地: ${BLUE}http://localhost${NC}"
echo -e "  远程: ${BLUE}http://$IP${NC}"

# 最近日志
echo ""
echo -e "${YELLOW}最近日志 (最后5行):${NC}"
journalctl -u $APP_NAME --no-pager -n 5 2>/dev/null || echo "  无日志"

echo ""
echo "========================================"