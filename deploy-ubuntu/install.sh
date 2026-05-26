#!/bin/bash
#
# 健康助手 (Health Buddy) 一键部署脚本
# 适用于 Ubuntu 20.04/22.04
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="health-buddy"
INSTALL_DIR="/opt/$APP_NAME"
DATA_DIR="/var/lib/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
SERVICE_NAME="$APP_NAME"
DEFAULT_BACKEND_PORT=8080
DEFAULT_HTTP_PORT=80

# 打印Banner
echo -e "${BLUE}"
echo "========================================"
echo "   健康助手 (Health Buddy) 一键部署脚本"
echo "========================================"
echo -e "${NC}"

# 检查root权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[错误] 请使用 root 权限运行此脚本${NC}"
    echo "使用方法: sudo bash install.sh"
    exit 1
fi

# 端口配置选择
echo -e "${YELLOW}端口配置${NC}"
echo ""
echo "  1) 默认端口 (后端 8080, HTTP 80) - 推荐"
echo "  2) 自定义端口"
echo ""
read -p "请选择 [1/2]: " PORT_CHOICE

case $PORT_CHOICE in
    2)
        echo ""
        read -p "请输入后端内部端口 (默认 $DEFAULT_BACKEND_PORT): " BACKEND_PORT
        BACKEND_PORT=${BACKEND_PORT:-$DEFAULT_BACKEND_PORT}

        read -p "请输入HTTP对外端口 (默认 $DEFAULT_HTTP_PORT): " HTTP_PORT
        HTTP_PORT=${HTTP_PORT:-$DEFAULT_HTTP_PORT}

        # 验证端口
        if ! [[ "$BACKEND_PORT" =~ ^[0-9]+$ ]] || [ "$BACKEND_PORT" -lt 1 ] || [ "$BACKEND_PORT" -gt 65535 ]; then
            echo -e "${RED}[错误] 后端端口格式错误，使用默认端口 $DEFAULT_BACKEND_PORT${NC}"
            BACKEND_PORT=$DEFAULT_BACKEND_PORT
        fi

        if ! [[ "$HTTP_PORT" =~ ^[0-9]+$ ]] || [ "$HTTP_PORT" -lt 1 ] || [ "$HTTP_PORT" -gt 65535 ]; then
            echo -e "${RED}[错误] HTTP端口格式错误，使用默认端口 $DEFAULT_HTTP_PORT${NC}"
            HTTP_PORT=$DEFAULT_HTTP_PORT
        fi
        ;;
    1|*)
        BACKEND_PORT=$DEFAULT_BACKEND_PORT
        HTTP_PORT=$DEFAULT_HTTP_PORT
        ;;
esac

echo ""
echo -e "${GREEN}[信息] 后端内部端口: $BACKEND_PORT${NC}"
echo -e "${GREEN}[信息] HTTP对外端口: $HTTP_PORT${NC}"
echo ""

# 端口参数
# 参数1: 后端内部端口 (BP_PORT)
# 参数2: Nginx对外端口 (HTTP_PORT)
# 如果命令行指定了端口参数，则使用命令行参数（跳过交互式选择）
if [ -n "$1" ] && [[ "$1" =~ ^[0-9]+$ ]]; then
    BACKEND_PORT=$1
    HTTP_PORT=${2:-$DEFAULT_HTTP_PORT}
    echo -e "${GREEN}[信息] 使用命令行参数配置端口${NC}"
fi

# 检查系统依赖
echo -e "${YELLOW}[步骤1] 检查并安装依赖...${NC}"
apt update -qq
apt install -y -qq nginx

# 创建目录
echo -e "${YELLOW}[步骤2] 创建目录结构...${NC}"
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/frontend
mkdir -p $DATA_DIR
mkdir -p $BACKUP_DIR

# 复制文件
echo -e "${YELLOW}[步骤3] 复制应用文件...${NC}"

# 检查当前目录是否有文件
if [ -f "./server" ]; then
    # 判断是否已在目标目录
    CURRENT_DIR=$(pwd)
    if [ "$CURRENT_DIR" = "$INSTALL_DIR" ]; then
        echo -e "${GREEN}[信息] 已在目标目录，跳过复制步骤${NC}"
    else
        cp ./server $INSTALL_DIR/
        cp -r ./frontend/* $INSTALL_DIR/frontend/
        echo -e "${GREEN}[信息] 文件已复制到 $INSTALL_DIR${NC}"
    fi
else
    echo -e "${RED}[错误] 请在部署包目录中运行此脚本${NC}"
    echo "确保当前目录包含: server 和 frontend/"
    echo "正确做法: 上传到 /tmp/deploy-ubuntu，然后 cd /tmp/deploy-ubuntu && sudo bash install.sh"
    exit 1
fi

# 设置权限
echo -e "${YELLOW}[步骤4] 设置文件权限...${NC}"
chmod +x $INSTALL_DIR/server
chown -R www-data:www-data $INSTALL_DIR
chown -R www-data:www-data $DATA_DIR
chown -R www-data:www-data $BACKUP_DIR

# 创建Systemd服务
echo -e "${YELLOW}[步骤5] 创建系统服务...${NC}"
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Health Buddy Backend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/server
Restart=always
RestartSec=5
Environment=GIN_MODE=release
Environment=BP_PORT=$BACKEND_PORT

[Install]
WantedBy=multi-user.target
EOF

# 创建Nginx配置
echo -e "${YELLOW}[步骤6] 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen $HTTP_PORT;
    server_name _;

    root $INSTALL_DIR/frontend;
    index index.html;

    # 前端路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 启用站点配置
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME

# 删除默认站点（可选）
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 创建备份脚本
echo -e "${YELLOW}[步骤7] 创建备份脚本...${NC}"
cat > /usr/local/bin/$APP_NAME-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/health-buddy"
DATA_DIR="/var/lib/health-buddy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
if [ -f "$DATA_DIR/health_buddy.json" ]; then
    cp $DATA_DIR/health_buddy.json $BACKUP_DIR/health_buddy_$DATE.json
    # 保留最近30天
    find $BACKUP_DIR -name "*.json" -mtime +30 -delete
fi
EOF
chmod +x /usr/local/bin/$APP_NAME-backup.sh

# 设置定时备份
(crontab -l 2>/dev/null | grep -v "$APP_NAME-backup"; echo "0 3 * * * /usr/local/bin/$APP_NAME-backup.sh") | crontab -

# 启动服务
echo -e "${YELLOW}[步骤8] 启动服务...${NC}"
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME
systemctl reload nginx

# 等待服务启动
sleep 3

# 检查服务状态
if systemctl is-active --quiet $SERVICE_NAME; then
    SERVICE_STATUS="${GREEN}运行中${NC}"
else
    SERVICE_STATUS="${RED}未运行${NC}"
fi

# 获取服务器IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# 打印完成信息
echo ""
echo -e "${GREEN}"
echo "========================================"
echo "   部署完成!"
echo "========================================"
echo -e "${NC}"
echo ""
echo -e "  应用目录: ${BLUE}$INSTALL_DIR${NC}"
echo -e "  数据目录: ${BLUE}$DATA_DIR${NC}"
echo -e "  备份目录: ${BLUE}$BACKUP_DIR${NC}"
echo -e "  后端端口: ${BLUE}$BACKEND_PORT${NC} (内部)"
echo -e "  HTTP端口: ${BLUE}$HTTP_PORT${NC} (对外访问)"
echo -e "  服务状态: $SERVICE_STATUS"
echo ""
# 构建访问URL
if [ "$HTTP_PORT" -eq 80 ]; then
    ACCESS_URL="http://$SERVER_IP"
    LOCAL_URL="http://localhost"
else
    ACCESS_URL="http://$SERVER_IP:$HTTP_PORT"
    LOCAL_URL="http://localhost:$HTTP_PORT"
fi

echo -e "  访问地址: ${BLUE}$ACCESS_URL${NC}"
echo -e "  本地访问: ${BLUE}$LOCAL_URL${NC}"
echo ""
echo -e "  默认账号: ${YELLOW}admin${NC}"
echo -e "  默认密码: ${YELLOW}admin${NC}"
echo ""
echo -e "${RED}  重要: 首次登录后请立即修改密码!${NC}"
echo ""
echo "========================================"
echo ""
echo "常用命令:"
echo "  查看状态: systemctl status $SERVICE_NAME"
echo "  重启服务: systemctl restart $SERVICE_NAME"
echo "  停止服务: systemctl stop $SERVICE_NAME"
echo "  查看日志: journalctl -u $SERVICE_NAME -f"
echo "  数据备份: $APP_NAME-backup.sh"
echo ""
echo "========================================"