# 血压宝 - Windows 部署指南

## 目录结构

```
deploy-windows/
├── server.exe          # 后端可执行文件
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
├── deploy-guide.md     # 本部署指南
└── start.bat           # 启动脚本（可选）
```

## 快速启动

### 方式一：直接运行

1. 双击 `server.exe` 启动后端服务
2. 后端会在 `http://localhost:8080` 运行
3. 前端静态文件由后端托管，访问 `http://localhost:8080` 即可使用

### 方式二：使用启动脚本

创建 `start.bat` 文件：

```batch
@echo off
echo 正在启动血压宝...
start server.exe
echo 服务已启动，请访问 http://localhost:8080
pause
```

## 详细部署步骤

### 1. 准备环境

确保系统已安装：
- 无需额外依赖（Go程序独立运行）

### 2. 部署后端

```powershell
# 将 server.exe 放到目标目录
# 例如: C:\BPBuddy\server.exe

# 直接运行
.\server.exe
```

后端服务将在端口 8080 启动。

### 3. 部署前端

**方式A：后端托管静态文件**

修改 `server.exe` 所在目录，创建 `frontend` 子目录存放前端文件。

**方式B：使用 Nginx/Apache 托管**

如果需要使用独立Web服务器托管前端：

1. 安装 Nginx 或 Apache
2. 将 `frontend/` 目录内容放到Web服务器根目录
3. 配置反向代理将 `/api` 请求转发到后端

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name localhost;

    root C:/BPBuddy/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

### 4. 数据存储

数据文件 `bp_buddy.json` 会自动创建在后端程序运行目录。

**建议**：创建专门的数据目录
```
C:\BPBuddy\
├── server.exe
├── frontend/
├── data\
│   └── bp_buddy.json    # 数据文件
```

### 5. 开机自启动

**方式A：使用任务计划程序**

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：系统启动时
4. 操作：启动程序 `C:\BPBuddy\server.exe`

**方式B：注册为Windows服务**

使用 NSSM (Non-Sucking Service Manager):
```powershell
# 下载 nssm
# 安装服务
nssm install BPBuddy C:\BPBuddy\server.exe
nssm start BPBuddy
```

### 6. 防火墙配置

如果需要远程访问，开放端口：
```powershell
netsh advfirewall firewall add rule name="BPBuddy" dir=in action=allow protocol=tcp localport=8080
```

## 默认账号

- 用户名: `admin`
- 密码: `admin`

首次登录后请及时修改密码！

## 常见问题

### Q: 启动失败？
检查端口8080是否被占用：
```powershell
netstat -ano | findstr :8080
```

### Q: 如何修改端口？
修改后端配置，重新编译。

### Q: 数据如何备份？
复制 `bp_buddy.json` 文件即可。

## 生产环境建议

1. 使用 HTTPS（配置SSL证书）
2. 定期备份 `bp_buddy.json`
3. 修改默认密码
4. 配置防火墙规则限制访问来源