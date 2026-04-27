#!/bin/bash
#
# 血压宝 (BP Buddy) 卸载脚本
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="bp-buddy"
INSTALL_DIR="/opt/$APP_NAME"
DATA_DIR="/var/lib/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"

echo -e "${YELLOW}"
echo "========================================"
echo "   血压宝卸载脚本"
echo "========================================"
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[错误] 请使用 root 权限运行${NC}"
    exit 1
fi

echo -e "${RED}警告: 此操作将删除所有数据和配置!${NC}"
echo ""
read -p "是否保留数据备份? (y/n): " KEEP_BACKUP

echo ""
echo -e "${YELLOW}[步骤1] 停止服务...${NC}"
systemctl stop $APP_NAME || true
systemctl disable $APP_NAME || true

echo -e "${YELLOW}[步骤2] 删除服务文件...${NC}"
rm -f /etc/systemd/system/$APP_NAME.service
systemctl daemon-reload

echo -e "${YELLOW}[步骤3] 删除Nginx配置...${NC}"
rm -f /etc/nginx/sites-available/$APP_NAME
rm -f /etc/nginx/sites-enabled/$APP_NAME
systemctl reload nginx || true

echo -e "${YELLOW}[步骤4] 删除应用文件...${NC}"
rm -rf $INSTALL_DIR

echo -e "${YELLOW}[步骤5] 删除备份脚本...${NC}"
rm -f /usr/local/bin/$APP_NAME-backup.sh
(crontab -l 2>/dev/null | grep -v "$APP_NAME-backup") | crontab - || true

echo -e "${YELLOW}[步骤6] 处理数据目录...${NC}"
if [ "$KEEP_BACKUP" = "y" ]; then
    echo "保留数据备份在: $BACKUP_DIR"
    mkdir -p $BACKUP_DIR
    if [ -f "$DATA_DIR/bp_buddy.json" ]; then
        cp $DATA_DIR/bp_buddy.json $BACKUP_DIR/bp_buddy_final_backup.json
    fi
fi
rm -rf $DATA_DIR

if [ "$KEEP_BACKUP" != "y" ]; then
    rm -rf $BACKUP_DIR
fi

echo ""
echo -e "${GREEN}卸载完成!${NC}"
echo ""