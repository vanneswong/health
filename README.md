# 血压宝 (BP Buddy)

一个用于记录和追踪血压数据的健康管理应用，支持Web端和Android移动端，帮助用户便捷地记录血压测量结果，并通过图表和统计分析了解血压变化趋势。

## 版本信息

- **当前版本**: v0.2
- **发布日期**: 2025-05-05

## 功能特点

- 用户登录认证（JWT Token）
- 血压记录管理（添加、编辑、删除）
- 趋势图表展示
- 统计汇总分析
- 健康等级评估和建议
- 响应式设计，支持Web端和移动端

## 技术栈

| 平台 | 技术栈 |
|------|--------|
| **Web前端** | React 18 + TypeScript + Material UI + Recharts |
| **移动端** | React Native + Expo SDK 55 + React Native Paper |
| **后端** | Go + Gin |
| **数据存储** | JSON文件 |
| **认证** | JWT Token |

## 项目结构

```
bp-buddy/
├── frontend/                 # Web前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── pages/            # 页面
│   │   ├── services/         # API服务
│   │   ├── hooks/            # 自定义Hooks
│   │   └── utils/            # 工具函数
│   └── package.json
├── mobile/                   # Android移动端项目
│   ├── src/
│   │   ├── screens/          # 页面
│   │   ├── components/       # 组件
│   │   ├── navigation/       # 导航配置
│   │   ├── contexts/         # React Context
│   │   ├── services/         # API服务
│   │   └── utils/            # 工具函数
│   ├── docs/                 # 移动端文档
│   └── assets/               # 资源文件
│   └── App.tsx
├── backend/                  # 后端项目
│   ├── cmd/server/main.go    # 入口文件
│   ├── internal/
│   │   ├── handlers/         # HTTP处理器
│   │   ├── models/           # 数据模型
│   │   └── middleware/       # 中间件
│   └── pkg/database/         # 数据存储
│   └── go.mod
├── deploy-windows/           # Windows部署包
├── deploy-ubuntu/            # Ubuntu部署包
├── docs/                     # 项目文档
└── README.md
```

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 18+
- npm 或 yarn
- Expo CLI（可选，可用npx）

### 后端启动

```bash
cd backend
go mod tidy
go build -o server.exe ./cmd/server
./server.exe
```

后端服务将在 http://localhost:8080 启动

### Web前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 移动端开发

```bash
cd mobile
npm install
npx expo start
```

使用Expo Go App扫描二维码即可测试

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

| 分类 | 高压(收缩压) mmHg | 低压(舒张压) mmHg |
|------|-------------|-------------|
| 正常血压 | <120 | <80 |
| 偏高 | 120-139 | 80-89 |
| 高血压1级(轻度) | 140-159 | 90-99 |
| 高血压2级(中度) | 160-179 | 100-109 |
| 高血压3级(重度) | ≥180 | ≥110 |

## 移动端功能

Android应用基于React Native + Expo开发：

- **登录页面**: 简洁现代的蓝色主题设计
- **血压记录**: 卡片列表，右滑编辑/删除
- **趋势图表**: 折线图展示血压变化
- **统计汇总**: 健康状态评估与建议
- **我的页面**: 用户信息、修改密码、退出登录

### 安装移动端应用

访问 Expo构建页面下载APK：
```
https://expo.dev/accounts/mikewong888/projects/bp-buddy
```

## 数据存储

数据存储在 `backend/bp_buddy.json` 文件中，首次启动会自动创建默认用户。

## 文档

- [需求文档](docs/requirements.md)
- [开发计划](docs/development-plan.md)
- [部署指南](docs/deployment.md)
- [移动端开发规划](mobile/docs/development-plan.md)
- [移动端API规格](mobile/docs/api-spec.md)

## 许可证

MIT License