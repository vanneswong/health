# 血压宝 (BP Buddy)

一个用于记录和追踪血压数据的Web应用，帮助用户便捷地记录血压测量结果，并通过图表和统计分析了解血压变化趋势。

## 功能特点

- 用户登录认证
- 血压记录管理（添加、编辑、删除）
- 趋势图表展示
- 统计汇总分析
- 健康提醒和建议
- 响应式设计，支持移动端

## 技术栈

- **前端**: React 18 + TypeScript + Material UI + Recharts
- **后端**: Go + Gin
- **数据存储**: JSON文件
- **认证**: JWT Token

## 项目结构

```
bp-buddy/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── pages/            # 页面
│   │   ├── services/         # API服务
│   │   ├── hooks/            # 自定义Hooks
│   │   └── utils/            # 工具函数
│   └── package.json
├── backend/                  # 后端项目
│   ├── cmd/server/main.go    # 入口文件
│   ├── internal/
│   │   ├── handlers/         # HTTP处理器
│   │   ├── models/           # 数据模型
│   │   └── middleware/       # 中间件
│   └── pkg/database/         # 数据存储
│   └── go.mod
├── docs/                     # 文档
└── README.md
```

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 18+
- npm 或 yarn

### 后端启动

```bash
cd backend
go mod tidy
go build -o server.exe ./cmd/server
./server.exe
```

后端服务将在 http://localhost:8080 启动

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动（可在 vite.config.ts 中修改端口）

### 默认账号

- 用户名: admin
- 密码: admin

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `PUT /api/auth/password` - 修改密码

### 血压记录接口
- `GET /api/records` - 获取记录列表
- `GET /api/records/:id` - 获取单条记录
- `POST /api/records` - 创建记录
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录

### 统计接口
- `GET /api/stats/summary` - 获取统计汇总
- `GET /api/stats/trend` - 获取趋势数据

## 血压健康标准

| 分类 | 收缩压(mmHg) | 舒张压(mmHg) |
|------|-------------|-------------|
| 正常血压 | <120 | <80 |
| 正常高值 | 120-139 | 80-89 |
| 高血压1级(轻度) | 140-159 | 90-99 |
| 高血压2级(中度) | 160-179 | 100-109 |
| 高血压3级(重度) | ≥180 | ≥110 |

## 数据存储

数据存储在 `backend/bp_buddy.json` 文件中，首次启动会自动创建默认用户。

## 文档

- [需求文档](docs/requirements.md)
- [开发计划](docs/development-plan.md)
- [部署指南](docs/deployment.md) - Ubuntu 和 Vercel 部署说明

## 许可证

MIT License