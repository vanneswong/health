# 血压宝 (BP Buddy) - 部署指南

## 目录

1. [Ubuntu 服务器部署](#1-ubuntu-服务器部署)
2. [Vercel 部署](#2-vercel-部署)
3. [生产环境配置](#3-生产环境配置)

---

## 1. Ubuntu 服务器部署

### 1.1 环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y nginx git curl

# 安装 Node.js (前端需要)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Go (后端需要)
sudo apt install -y golang-go
# 或安装最新版本
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 1.2 获取代码

```bash
# 创建项目目录
sudo mkdir -p /var/www/bp-buddy
cd /var/www/bp-buddy

# 从 Git 仓库克隆（或上传代码）
git clone <your-repo-url> .

# 或者使用 scp 上传
# scp -r ./bp-buddy user@server:/var/www/
```

### 1.3 后端部署

```bash
cd /var/www/bp-buddy/backend

# 编译后端
go mod tidy
go build -o bp-buddy-server ./cmd/server

# 创建数据目录
sudo mkdir -p /var/lib/bp-buddy
sudo chown www-data:www-data /var/lib/bp-buddy

# 修改数据文件路径（可选）
# 编辑 pkg/database/db.go 中的 dataFile 变量
# 将 "bp_buddy.json" 改为 "/var/lib/bp-buddy/bp_buddy.json"
```

### 1.4 创建 Systemd 服务

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
WorkingDirectory=/var/www/bp-buddy/backend
ExecStart=/var/www/bp-buddy/backend/bp-buddy-server
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

### 1.5 前端构建与部署

```bash
cd /var/www/bp-buddy/frontend

# 安装依赖
npm install

# 修改 API 地址（指向后端）
# 编辑 vite.config.ts 或创建 .env.production
nano .env.production
```

写入：
```
VITE_API_URL=http://localhost:8080/api
```

或修改 `src/services/api.ts`：
```typescript
const baseURL = process.env.VITE_API_URL || '/api'
```

构建前端：
```bash
npm run build
# 构建产物在 dist/ 目录
```

### 1.6 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/bp-buddy
```

写入以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    # 前端静态文件
    root /var/www/bp-buddy/frontend/dist;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
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

### 1.7 HTTPS 配置（推荐）

使用 Let's Encrypt：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

自动续期：
```bash
sudo systemctl enable certbot.timer
```

### 1.8 验证部署

```bash
# 检查服务状态
sudo systemctl status bp-buddy
sudo systemctl status nginx

# 测试 API
curl http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 查看日志
sudo journalctl -u bp-buddy -f
```

---

## 2. Vercel 部署

Vercel 仅支持前端部署，后端需要部署到其他服务。

### 2.1 前端部署到 Vercel

#### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 在前端目录执行
cd frontend
vercel
```

#### 方式二：通过 GitHub 自动部署

1. 将代码推送到 GitHub 仓库
2. 登录 [vercel.com](https://vercel.com)
3. 点击 "New Project"
4. 导入 GitHub 仓库
5. 设置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 点击 "Deploy"

### 2.2 配置环境变量

在 Vercel 项目设置中添加环境变量：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_URL` | `https://your-backend-api.com/api` |

或在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-api.com/api/$1" }
  ]
}
```

### 2.3 后端部署选项

由于 Vercel 不支持 Go 后端，后端需要部署到其他平台：

| 平台 | 特点 |
|------|------|
| **Railway** | 简单易用，支持 Go，有免费额度 |
| **Fly.io** | 全球分布式部署，支持 Go |
| **DigitalOcean App Platform** | 稳定可靠，按需付费 |
| **自建 Ubuntu 服务器** | 完全控制，成本可控 |

#### Railway 部署示例

1. 登录 [railway.app](https://railway.app)
2. 创建新项目
3. 从 GitHub 导入后端目录
4. 设置：
   - **Root Directory**: `backend`
   - **Start Command**: `./server`
5. 添加环境变量：
   - `GIN_MODE=release`
6. 部署完成后获取 API URL

### 2.4 连接前后端

确保前端 Vercel 部署的 API 地址指向后端：

修改 `frontend/src/services/api.ts`：

```typescript
const baseURL = process.env.VITE_API_URL || '/api'

const instance = axios.create({
  baseURL,
  timeout: 10000,
})
```

---

## 3. 生产环境配置

### 3.1 后端配置

#### 环境变量

```bash
# 推荐的环境变量
GIN_MODE=release           # 生产模式
JWT_SECRET=your-secret-key # JWT 密钥（修改默认值）
DATA_FILE=/var/lib/bp-buddy/bp_buddy.json  # 数据文件路径
```

#### 修改 JWT 密钥

编辑 `backend/internal/middleware/auth.go`：

```go
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))
// 或使用配置文件
```

#### 添加速率限制

```go
// 在 main.go 中添加
import "github.com/ulule/limiter/v3"

// 配置速率限制
rate := limiter.Rate{
    Period: 1 * time.Minute,
    Limit:  100,
}
```

### 3.2 前端配置

#### 构建优化

修改 `frontend/vite.config.ts`：

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'charts': ['recharts'],
        }
      }
    }
  }
})
```

#### 添加安全头

Vercel 自动处理，Ubuntu 需在 Nginx 配置。

### 3.3 数据备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/bp-buddy-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bp-buddy"
DATA_FILE="/var/lib/bp-buddy/bp_buddy.json"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DATA_FILE $BACKUP_DIR/bp_buddy_$DATE.json

# 保留最近30天的备份
find $BACKUP_DIR -name "*.json" -mtime +30 -delete
```

设置定时任务：

```bash
sudo chmod +x /usr/local/bin/bp-buddy-backup.sh
sudo crontab -e
# 添加：每天凌晨3点备份
0 3 * * * /usr/local/bin/bp-buddy-backup.sh
```

### 3.4 监控与日志

```bash
# 查看服务日志
sudo journalctl -u bp-buddy -f

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 4. 常见问题

### Q: 后端启动失败？

```bash
# 检查权限
sudo chown -R www-data:www-data /var/www/bp-buddy
sudo chown -R www-data:www-data /var/lib/bp-buddy

# 检查端口占用
sudo netstat -tlnp | grep 8080
```

### Q: 前端无法连接后端？

检查 Nginx 配置中的 proxy_pass 地址是否正确。

### Q: 如何修改默认密码？

首次登录后立即修改密码（在用户菜单中）。

### Q: 如何迁移数据？

直接复制 `bp_buddy.json` 文件即可。

---

## 5. 部署架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (80/443)                        │
│  ┌─────────────┐        ┌──────────────────────────┐    │
│  │ 静态文件    │        │ /api 代理到后端          │    │
│  │ (dist/)     │        │ → http://127.0.0.1:8080  │    │
│  └─────────────┘        └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BP Buddy Backend (:8080)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │ 认证模块    │  │ 记录模块    │  │ 统计模块     │    │
│  │ (JWT)       │  │ (CRUD)      │  │ (图表数据)   │    │
│  └─────────────┘  └─────────────┘  └──────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               bp_buddy.json (数据文件)                   │
└─────────────────────────────────────────────────────────┘
```