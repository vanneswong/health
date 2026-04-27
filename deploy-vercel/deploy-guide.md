# 血压宝 - Vercel 部署指南

## 目录结构

```
deploy-vercel/
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
└── deploy-guide.md     # 本部署指南
```

## 重要说明

⚠️ **Vercel 仅支持前端部署**，Go 后端需要部署到其他平台。

推荐的后端部署平台：
- **Railway** (https://railway.app) - 推荐，简单易用
- **Fly.io** (https://fly.io) - 全球分布式
- **DigitalOcean App Platform**
- **自建 Ubuntu 服务器**

## 前端部署到 Vercel

### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（在 deploy-vercel/frontend 目录）
cd deploy-vercel/frontend
vercel --prod
```

### 方式二：通过 Dashboard

1. 登录 https://vercel.com
2. 点击 "New Project"
3. 选择 "Import Git Repository" 或上传文件
4. 配置：
   - Framework: Other
   - Root Directory: `frontend`
   - Build Command: 无需（已构建）
   - Output Directory: `./`

### 方式三：手动部署静态文件

如果使用已构建的文件：

1. 创建 `vercel.json` 配置文件：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## 后端部署到 Railway

### 1. 准备后端代码

Railway 需要源代码编译，不能直接使用二进制文件。

从原项目获取后端代码：
```
backend/
├── cmd/server/main.go
├── internal/
├── pkg/
├── go.mod
├── go.sum
```

### 2. 部署到 Railway

1. 登录 https://railway.app
2. 创建新项目
3. 从 GitHub 导入或上传代码
4. 设置：
   - Root Directory: `backend`
   - Build Command: `go build -o server ./cmd/server`
   - Start Command: `./server`

### 3. 配置环境变量

在 Railway 项目设置中添加：
```
GIN_MODE=release
```

### 4. 获取后端 URL

部署完成后，Railway 会分配一个 URL，例如：
```
https://bp-buddy-backend.railway.app
```

## 连接前后端

### 修改前端 API 地址

创建或修改前端配置，使 API 请求指向后端：

**方法1：修改前端代码**

在 `frontend/assets/index-*.js` 中找到 API 基础地址配置，修改为后端 URL。

**方法2：使用 Vercel 环境变量**

在 Vercel 项目设置中添加环境变量：
```
VITE_API_URL=https://bp-buddy-backend.railway.app/api
```

**方法3：配置 Vercel Rewrites**

在 `vercel.json` 中添加 API 代理：
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://bp-buddy-backend.railway.app/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 后端部署到 Fly.io

### 1. 安装 Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. 创建 fly.toml

```toml
app = "bp-buddy-backend"

[build]
  builder = "heroku/buildpacks:20"

[env]
  GIN_MODE = "release"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

### 3. 部署

```bash
fly apps create bp-buddy-backend
fly deploy
```

## 默认账号

- 用户名: `admin`
- 密码: `admin`

首次登录后请及时修改密码！

## 常见问题

### Q: 前端无法连接后端？
检查：
1. 后端服务是否正常运行
2. API 地址是否正确
3. CORS 配置（后端已配置允许跨域）

### Q: Vercel 部署后页面空白？
检查 `vercel.json` 的 rewrites 配置是否正确。

### Q: 后端数据存储？
Railway/Fly.io 容器重启后数据可能丢失。
建议：
- 使用持久化存储卷
- 或连接外部数据库

## 生产环境建议

1. 配置自定义域名
2. 使用 HTTPS（Vercel/Railway 自动配置）
3. 设置环境变量而非硬编码配置
4. 配置日志监控
5. 修改默认密码

## 完整部署架构

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Railway       │
│   (前端)        │────▶│   (后端)        │
│                 │ API │                 │
│ 静态文件托管    │     │ Go 服务运行     │
└─────────────────┘     └─────────────────┘
```

用户访问流程：
1. 用户访问 Vercel 前端 URL
2. 前端发起 API 请求
3. 请求转发到 Railway 后端
4. 后端处理并返回数据