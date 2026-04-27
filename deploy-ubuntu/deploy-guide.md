# 血压宝 - Ubuntu 部署指南

## 目录结构

```
deploy-ubuntu/
├── server              # Linux后端可执行文件
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
└── deploy-guide.md     # 本部署指南
```

## 快速部署

### 1. 上传文件到服务器

```bash
# 使用 scp 上传
scp -r deploy-ubuntu/* user@your-server:/var/www/bp-buddy/

# 或使用 rsync
rsync -avz deploy-ubuntu/ user@your-server:/var/www/bp-buddy/
```

### 2. 基础配置

```bash
# SSH 登录服务器
ssh user@your-server

# 进入部署目录
cd /var/www/bp-buddy

# 设置权限
chmod +x server
chown -R www-data:www-data .
```

## 详细部署步骤

### 1. 安装 Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2. 创建数据目录

```bash
sudo mkdir -p /var/lib/bp-buddy
sudo chown www-data:www-data /var/lib/bp-buddy
```

### 3. 创建 Systemd 服务

```bash
sudo nano /etc/systemd/system/bp-buddy.service
```

写入以下内容：
```ini
[Unit]
Description=BP Buddy Backend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/bp-buddy
ExecStart=/var/www/bp-buddy/server
Restart=always
RestartSec=5
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable bp-buddy
sudo systemctl start bp-buddy
sudo systemctl status bp-buddy
```

### 4. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/bp-buddy
```

写入以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP

    # 前端静态文件
    root /var/www/bp-buddy/frontend;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/bp-buddy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 配置 HTTPS (推荐)

使用 Let's Encrypt 免费 SSL 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

自动续期：
```bash
sudo systemctl enable certbot.timer
```

### 6. 配置防火墙

```bash
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 7. 数据备份脚本

```bash
sudo nano /usr/local/bin/bp-buddy-backup.sh
```

写入：
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bp-buddy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/lib/bp-buddy/bp_buddy.json $BACKUP_DIR/bp_buddy_$DATE.json

# 保留最近30天
find $BACKUP_DIR -name "*.json" -mtime +30 -delete
```

设置定时备份：
```bash
sudo chmod +x /usr/local/bin/bp-buddy-backup.sh
sudo crontab -e
# 添加：每天凌晨3点备份
0 3 * * * /usr/local/bin/bp-buddy-backup.sh
```

## 默认账号

- 用户名: `admin`
- 密码: `admin`

首次登录后请及时修改密码！

## 常用命令

```bash
# 查看服务状态
sudo systemctl status bp-buddy

# 重启服务
sudo systemctl restart bp-buddy

# 查看日志
sudo journalctl -u bp-buddy -f

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 常见问题

### Q: 服务启动失败？
```bash
# 检查权限
ls -la /var/www/bp-buddy/
chmod +x /var/www/bp-buddy/server

# 检查端口
sudo netstat -tlnp | grep 8080
```

### Q: 502 Bad Gateway？
后端服务未运行，检查：
```bash
sudo systemctl status bp-buddy
```

### Q: 如何更新应用？
```bash
# 停止服务
sudo systemctl stop bp-buddy

# 替换文件
scp server user@server:/var/www/bp-buddy/
scp -r frontend/* user@server:/var/www/bp-buddy/frontend/

# 启动服务
sudo systemctl start bp-buddy
```

## 生产环境建议

1. 使用 HTTPS（Let's Encrypt）
2. 配置防火墙（UFW）
3. 定期备份数据文件
4. 修改默认密码
5. 设置日志监控