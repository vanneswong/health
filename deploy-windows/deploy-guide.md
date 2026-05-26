# 健康助手 - Windows 部署指南

## 目录结构

```
deploy-windows/
├── server.exe          # 后端可执行文件
├── frontend/           # 前端静态文件
│   ├── index.html
│   └── assets/
├── start.bat           # 启动脚本（支持自定义端口）
├── stop.bat            # 停止脚本
└── deploy-guide.md     # 本部署指南
```

## 快速启动

### 一键启动

1. 双击 `start.bat`
2. 输入想要使用的端口（默认 8080）
3. 自动启动服务，显示访问地址

### 自定义端口启动

运行 `start.bat` 后，根据提示输入端口：

```
请输入运行端口 (默认 8080): 9000
```

脚本会自动：
- 验证端口格式和范围
- 检查端口是否被占用
- 设置环境变量并启动服务

### 停止服务

双击 `stop.bat` 即可停止后端服务。

## 手动启动

如果需要手动指定端口：

```powershell
# 设置端口环境变量
set BP_PORT=9000

# 启动服务
server.exe
```

## 详细部署步骤

### 1. 部署到指定目录

```powershell
# 创建目录
mkdir C:\HealthBuddy

# 复制文件
copy deploy-windows\* C:\HealthBuddy\
```

### 2. 开机自启动

**方式A：任务计划程序**

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：系统启动时
4. 操作：启动程序 `C:\HealthBuddy\start.bat`

**方式B：注册为Windows服务 (推荐)**

使用 NSSM (Non-Sucking Service Manager):

```powershell
# 下载 NSSM: https://nssm.cc/download
# 安装服务 (指定端口)
nssm install HealthBuddy C:\HealthBuddy\server.exe
nssm set HealthBuddy AppEnvironmentExtra BP_PORT=8080
nssm start HealthBuddy
```

### 3. 防火墙配置

开放端口：
```powershell
# 开放指定端口 (如 9000)
netsh advfirewall firewall add rule name="HealthBuddy" dir=in action=allow protocol=tcp localport=9000
```

### 4. 数据文件位置

数据文件 `health_buddy.json` 在程序运行目录自动创建。

**建议创建专门的数据目录：**

修改启动脚本，添加：
```batch
set BP_DATA=C:\HealthBuddy\data
```

## 端口说明

| 端口 | 说明 |
|------|------|
| 8080 | 默认端口 |
| 80 | HTTP标准端口（需管理员权限） |
| 443 | HTTPS端口（需SSL证书） |
| 自定义 | 1-65535 任意未占用端口 |

## 默认账号

- 用户名: `admin`
- 密码: `admin`

首次登录后请修改密码！

## 常见问题

### Q: 端口被占用？
运行 `start.bat` 时会自动检测并提示。

手动检查：
```powershell
netstat -ano | findstr :8080
```

### Q: 如何更换端口？
重新运行 `start.bat`，输入新端口即可。

### Q: 数据如何备份？
复制 `health_buddy.json` 文件到安全位置。

## 生产环境建议

1. 使用 NSSM 注册为服务
2. 配置防火墙规则
3. 定期备份数据文件
4. 使用 HTTPS（需配置SSL）
5. 修改默认密码