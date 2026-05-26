# 健康助手 - Ubuntu 部署指南

## 快速开始

### 步骤1: 上传部署包

使用 SFTP 工具上传整个 `deploy-ubuntu` 目录到服务器 `/tmp` 目录：

```
上传位置: /tmp/deploy-ubuntu/
```

### 步骤2: 一键部署

```bash
cd /tmp/deploy-ubuntu
sudo bash install.sh
```

执行后会提示选择端口：

```
端口配置

  1) 默认端口 (后端 8080, HTTP 80) - 推荐
  2) 自定义端口

请选择 [1/2]:
```

- 选择 **1** → 使用默认端口
- 选择 **2** → 输入自定义的后端端口和 HTTP 端口

### 命令行方式（跳过交互）

```bash
sudo bash install.sh <后端端口> <HTTP端口>

# 示例
sudo bash install.sh 9000 9001   # 后端9000, HTTP对外9001
sudo bash install.sh 8080 80     # 默认配置
```

**参数说明：**
| 参数 | 位置 | 说明 | 默认值 |
|------|------|------|--------|
| 后端端口 | 第1个 | Gin服务内部端口，不对外暴露 | 8080 |
| HTTP端口 | 第2个 | Nginx对外端口，用户浏览器访问 | 80 |

---

## 目录结构

```
deploy-ubuntu/
├── server              # Linux后端可执行文件
├── frontend/           # 前端静态文件
├── install.sh          # 一键部署脚本
├── uninstall.sh        # 卸载脚本
└── status.sh           # 状态检查脚本
```

## 部署位置

| 目录 | 路径 | 说明 |
|------|------|------|
| 应用目录 | `/opt/health-buddy/` | 程序和前端文件 |
| 数据目录 | `/var/lib/health-buddy/` | JSON数据文件 |
| 备份目录 | `/var/backups/health-buddy/` | 自动备份 |
| Nginx配置 | `/etc/nginx/sites-available/health-buddy` | Web服务器配置 |
| 服务文件 | `/etc/systemd/system/health-buddy.service` | 系统服务配置 |

---

## 常用命令

```bash
# 查看状态
sudo systemctl status health-buddy

# 启动/停止/重启
sudo systemctl start health-buddy
sudo systemctl stop health-buddy
sudo systemctl restart health-buddy

# 查看日志
sudo journalctl -u health-buddy -f

# 手动备份
sudo /usr/local/bin/health-buddy-backup.sh
```

---

## 修改端口

重新运行部署脚本即可：

```bash
cd /tmp/deploy-ubuntu
sudo bash install.sh
# 选择 "2) 自定义端口"
```

---

## HTTPS 配置

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl enable certbot.timer
```

---

## 防火墙配置

```bash
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow 80/tcp     # 或你的 HTTP 端口
sudo ufw enable
```

---

## 默认账号

- 用户名: `admin`
- 密码: `admin`

**首次登录后请立即修改密码！**

---

## 数据备份

系统每天凌晨3点自动备份，保留最近30天。

```bash
# 查看备份
ls -la /var/backups/health-buddy/

# 恢复数据
sudo systemctl stop health-buddy
sudo cp /var/backups/health-buddy/health_buddy_YYYYMMDD_HHMMSS.json /var/lib/health-buddy/health_buddy.json
sudo systemctl start health-buddy
```

---

## 卸载

```bash
cd /tmp/deploy-ubuntu
sudo bash uninstall.sh
```

---

## 故障排查

```bash
# 查看详细日志
sudo journalctl -u health-buddy -n 50

# 检查 Nginx 配置
sudo nginx -t

# 检查端口占用
sudo netstat -tlnp | grep 8080
```

---

## 架构说明

```
用户浏览器 → [Nginx :HTTP端口] → 反向代理 /api → [Gin :后端端口] → JSON数据
```

- Nginx 负责静态文件服务和 API 反向代理
- Gin 后端只在内部监听，不直接对外暴露