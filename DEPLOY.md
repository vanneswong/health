# 血压宝 (BP Buddy) - 部署总览

血压宝是一个血压记录管理应用，支持多种部署方式。

## 项目架构

```
前端: React + TypeScript + Material UI + Recharts
后端: Go + Gin框架
存储: JSON文件 (bp_buddy.json)
认证: JWT Token + bcrypt密码哈希
```

## 部署方式对比

| 部署方式 | 适用场景 | 端口配置 | 特点 |
|---------|---------|---------|------|
| Windows | 本地开发/个人使用 | 用户自定义 | 简单双击启动 |
| Ubuntu | 生产服务器 | 双端口配置 | Nginx反向代理，自动备份 |
| Vercel | 云端托管 | 自动 | 免费托管，无需服务器 |

## 部署包目录

```
xueya/
├── backend/                # Go后端源码
├── frontend/               # React前端源码
├── deploy-windows/         # Windows部署包
│   ├── server.exe
│   ├── frontend/
│   ├── start.bat
│   ├── stop.bat
│   └── deploy-guide.md
├── deploy-ubuntu/          # Ubuntu部署包
│   ├── server
│   ├── frontend/
│   ├── install.sh
│   ├── uninstall.sh
│   ├── status.sh
│   └── deploy-guide.md
└── deploy-vercel/          # Vercel部署包
    └── ...
```

## 部署指南

### Windows 部署

**启动：**
```powershell
# 双击 start.bat
# 输入端口（默认8080）
# 访问 http://localhost:端口
```

**停止：**
```powershell
# 双击 stop.bat
```

详见：[deploy-windows/deploy-guide.md](../deploy-windows/deploy-guide.md)

### Ubuntu 部署

**安装：**
```bash
# 默认配置
sudo ./install.sh

# 自定义端口
sudo ./install.sh 9000 9001  # 后端9000，HTTP 9001
```

**卸载：**
```bash
sudo ./uninstall.sh
```

**状态检查：**
```bash
sudo ./status.sh
```

详见：[deploy-ubuntu/deploy-guide.md](../deploy-ubuntu/deploy-guide.md)

### Vercel 部署

详见：[deploy-vercel/README.md](../deploy-vercel/README.md)

## 端口说明

### Windows
- 用户直接访问后端端口
- 示例：`http://localhost:8080`

### Ubuntu
- **后端端口**：Gin内部监听，不对外暴露
- **HTTP端口**：Nginx对外服务，用户访问此端口
- 示例：`http://服务器IP:9001`

架构：
```
用户 → Nginx(:9001) → 反向代理 → Gin(:9000) → JSON数据
```

## 默认账号

所有部署方式使用相同的默认账号：
- 用户名: `admin`
- 密码: `admin`

**重要：首次登录后请立即修改密码！**

## 数据存储

数据保存在 `bp_buddy.json` 文件中：

| 平台 | 数据路径 |
|------|---------|
| Windows | 程序运行目录 |
| Ubuntu | `/var/lib/bp-buddy/` |

## 快速对比

| 需求 | 推荐部署 |
|------|---------|
| 本地测试 | Windows |
| 家庭服务器 | Windows |
| 云服务器生产 | Ubuntu |
| 无服务器托管 | Vercel |
| 多用户访问 | Ubuntu + HTTPS |

## 构建部署包

如需重新构建部署包：

```bash
# 后端
cd backend
go build -o ../deploy-windows/server.exe ./cmd/server
GOOS=linux go build -o ../deploy-ubuntu/server ./cmd/server

# 前端
cd frontend
npm run build
cp dist/* ../deploy-windows/frontend/
cp dist/* ../deploy-ubuntu/frontend/
```

## 技术支持

遇到问题请查看各部署包的 `deploy-guide.md` 文件。