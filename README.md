# 健康助手 (Health Buddy)

一个综合性的健康管理应用，支持血压和血糖数据记录与分析，以及用药管理功能。支持Web端和Android移动端，帮助用户便捷地记录健康数据，并通过图表和统计分析了解变化趋势。

## 版本信息

- **当前版本**: v0.3
- **发布日期**: 2026-05-26

## 功能特点

- 用户登录认证（JWT Token）
- 个人资料管理（姓名、年龄、身高、体重）
- **血压管理**：记录管理、趋势图表、统计汇总、健康评估
- **血糖管理**：记录管理、趋势图表、统计汇总（中国标准）
- **用药管理**：用药计划、服药打卡、用药统计
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
health-buddy/
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

## 功能模块

### 血压管理
- 血压记录：高压/低压/脉搏、测量时间、用药备注
- 趋势图表：折线图展示血压变化趋势
- 健康评估：根据血压值给出健康等级和建议

### 血糖管理
- 血糖记录：血糖值(mmol/L)、测量类型（空腹/餐后2小时/随机/睡前）
- 趋势图表：血糖变化趋势展示
- 健康评估：采用中国标准（空腹正常3.9-6.1，餐后2小时<7.8）

### 用药管理
- 用药计划：药品名称、剂量、频率、服用时间
- 服药打卡：今日用药进度、按时服药提醒
- 用药统计：服药依从性分析

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `PUT /api/auth/password` - 修改密码

### 个人资料接口
- `GET /api/profile` - 获取个人资料
- `PUT /api/profile` - 更新个人资料

### 血压记录接口
- `GET /api/records` - 获取记录列表
- `GET /api/records/:id` - 获取单条记录
- `POST /api/records` - 创建记录
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录

### 血糖记录接口
- `GET /api/sugar` - 获取记录列表
- `GET /api/sugar/:id` - 获取单条记录
- `POST /api/sugar` - 创建记录
- `PUT /api/sugar/:id` - 更新记录
- `DELETE /api/sugar/:id` - 删除记录

### 用药管理接口
- `GET /api/medication` - 获取用药计划
- `POST /api/medication` - 创建用药计划
- `PUT /api/medication/:id` - 更新用药计划
- `DELETE /api/medication/:id` - 删除用药计划
- `GET /api/medication/logs` - 获取服药记录
- `GET /api/medication/logs/today` - 今日用药进度
- `POST /api/medication/logs` - 服药打卡

### 统计接口
- `GET /api/stats/summary` - 血压统计汇总
- `GET /api/stats/trend` - 血压趋势数据
- `GET /api/sugar/stats/summary` - 血糖统计汇总
- `GET /api/sugar/stats/trend` - 血糖趋势数据
- `GET /api/medication/stats` - 用药统计

## 健康标准参考

### 血压标准

| 分类 | 高压(收缩压) mmHg | 低压(舒张压) mmHg |
|------|-------------|-------------|
| 正常血压 | <120 | <80 |
| 正常高值 | 120-139 | 80-89 |
| 高血压1级(轻度) | 140-159 | 90-99 |
| 高血压2级(中度) | 160-179 | 100-109 |
| 高血压3级(重度) | ≥180 | ≥110 |

### 血糖标准（中国标准）

| 测量类型 | 正常范围 | 偏高 | 较高 |
|---------|---------|------|------|
| 空腹血糖 | 3.9-6.1 | 6.1-7.0 | ≥7.0 |
| 餐后2小时 | <7.8 | 7.8-11.1 | ≥11.1 |

## 数据存储

数据存储在 `backend/health_buddy.json` 文件中，首次启动会自动创建默认用户。

## 文档

- [需求文档](docs/requirements.md)
- [开发计划](docs/development-plan.md)
- [部署指南](docs/deployment.md)
- [移动端开发规划](mobile/docs/development-plan.md)
- [移动端API规格](mobile/docs/api-spec.md)

## 许可证

MIT License