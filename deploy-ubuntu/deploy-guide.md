# 血压宝 - Ubuntu 部署指南

## 目录结构

```
deploy-ubuntu/
├── server              # Linux后端可执行文件
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
├── install.sh          # 一键部署脚本
├── uninstall.sh        # 卸载脚本
├── status.sh           # 状态检查脚本
└── deploy-guide.md     # 本部署指南
```

## 一键部署

### 默认部署 (后端8080, HTTP 80)

```bash
sudo ./install.sh
```

### 自定义后端端口

```bash
sudo ./install.sh 9000
# 后端内部端口: 9000
# Nginx对外端口: 80
```

### 双端口配置 (推荐用于生产环境)

```bash
sudo ./install.sh 9000 9001
# 后端内部端口: 9000 (仅供Nginx代理)
# Nginx对外端口: 9001 (用户访问此端口)
```

**端口说明：**
- **后端端口**：Gin服务监听的内部端口，不直接对外暴露，由Nginx反向代理
- **HTTP端口**：Nginx监听的对外端口，用户通过浏览器访问此端口

部署脚本会自动完成：
1. 安装 Nginx
2. 创建目录 `/opt/bp-buddy`
3. 创建数据目录 `/var/lib/bp-buddy`
4. 配置 Systemd 服务
5. 配置 Nginx 反向代理
6. 设置定时备份
7. 启动服务

## 部署位置

| 目录 | 路径 | 说明 |
|------|------|------|
| 应用目录 | `/opt/bp-buddy/` | 程序和前端文件 |
| 数据目录 | `/var/lib/bp-buddy/` | JSON数据文件 |
| 备份目录 | `/var/backups/bp-buddy/` | 自动备份 |
| Nginx配置 | `/etc/nginx/sites-available/bp-buddy` | Web服务器配置 |
| 服务文件 | `/etc/systemd/system/bp-buddy.service` | 系统服务配置 |

## 常用命令

```bash
# 查看状态
sudo ./status.sh
# 或
sudo systemctl status bp-buddy

# 启动服务
sudo systemctl start bp-buddy

# 停止服务
sudo systemctl stop bp-buddy

# 重启服务
sudo systemctl restart bp-buddy

# 查看日志
sudo journalctl -u bp-buddy -f

# 手动备份
sudo /usr/local/bin/bp-buddy-backup.sh

# 检查状态
sudo ./status.sh
```

## 修改端口

### 方式一：重新部署（推荐）

```bash
sudo ./uninstall.sh
sudo ./install.sh 9000 9001
```

### 方式二：修改配置文件

```bash
# 停止服务
sudo systemctl stop bp-buddy

# 修改后端端口
sudo nano /etc/systemd/system/bp-buddy.service
# 找到 Environment=BP_PORT=8080
# 改为新端口，如 Environment=BP_PORT=9000

# 修改Nginx配置
sudo nano /etc/nginx/sites-available/bp-buddy
# 找到 listen 80; 改为 listen 9001;
# 找到 proxy_pass http://127.0.0.1:8080 改为 proxy_pass http://127.0.0.1:9000

# 重载配置
sudo systemctl daemon-reload
sudo systemctl start bp-buddy
sudo nginx -t && sudo systemctl reload nginx
```

## HTTPS 配置

使用 Let's Encrypt 免费 SSL：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书 (替换域名)
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 卸载

```bash
sudo ./uninstall.sh
```

卸载时会询问是否保留数据备份。

## 防火墙配置

```bash
# 使用 UFW
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow 9001/tcp  # 替换为你的HTTP端口
sudo ufw enable

# 或开放指定端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 默认账号

- 用户名: `admin`
- 密码: `admin`

首次登录后请修改密码！

## 数据备份

系统会每天凌晨3点自动备份，保留最近30天的备份。

手动查看备份：
```bash
ls -la /var/backups/bp-buddy/
```

恢复数据：
```bash
# 停止服务
sudo systemctl stop bp-buddy

# 复制备份文件
sudo cp /var/backups/bp-buddy/bp_buddy_YYYYMMDD_HHMMSS.json /var/lib/bp-buddy/bp_buddy.json

# 启动服务
sudo systemctl start bp-buddy
```

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
sudo journalctl -u bp-buddy -n 50

# 检查权限
ls -la /opt/bp-buddy/
sudo chown -R www-data:www-data /opt/bp-buddy

# 检查端口
sudo netstat -tlnp | grep 9000
```

### 502 Bad Gateway

后端未运行或端口配置错误：
```bash
sudo systemctl status bp-buddy
sudo ./status.sh
```

### Nginx 配置错误

```bash
sudo nginx -t
```

### 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep 9001

# 如果80端口被其他服务占用，使用其他HTTP端口
sudo ./uninstall.sh
sudo ./install.sh 9000 9001
```

## 生产环境建议

1. 配置 HTTPS (Let's Encrypt)
2. 设置防火墙 (UFW)
3. 使用非标准端口 (如 `sudo ./install.sh 9000 9001`)
4. 定期检查备份
5. 监控服务状态
6. 修改默认密码
7. 配置日志监控

## 架构说明

```
用户浏览器
    ↓
[Nginx :9001]  ← 对外HTTP端口
    ↓
反向代理 /api → [Gin :9000]  ← 后端内部端口
    ↓
/var/lib/bp-buddy/bp_buddy.json  ← 数据存储
```

- Nginx 负责静态文件服务和API反向代理
- Gin 后端只在内部监听，不直接对外暴露
- 数据存储为JSON文件，便于备份和迁移