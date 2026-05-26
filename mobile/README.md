# 健康助手 Android 应用

基于 React Native + Expo 的健康管理Android应用，支持血压、血糖记录和用药管理功能。

## 版本信息

- **版本**: 1.0.0
- **Expo SDK**: 55

## 功能

### 用户认证
- 登录功能（JWT Token认证）
- 自动登录（Token持久化）
- 修改密码
- 退出登录

### 血压记录管理
- 记录列表（卡片式布局）
- 下拉刷新
- 右滑编辑/删除
- 新增记录对话框

### 血糖记录管理
- 记录列表（卡片式布局）
- 下拉刷新
- 新增/编辑记录
- 测量类型选择（空腹/餐后2小时/随机/睡前）

### 趋势图表
- 血压趋势折线图
- 血糖趋势折线图
- 时间范围切换（7/30/90/365天）
- 参考标准说明

### 统计汇总
- 血压健康状态评估
- 血糖健康状态评估（中国标准）
- 平均值/最高值/最低值统计
- 记录次数统计

### 我的页面
- 用户信息
- 修改密码
- 退出登录

## 技术栈

| 技术 | 版本 |
|------|------|
| React Native | Expo SDK 55 |
| React Native Paper | Material Design UI |
| React Navigation | 底部Tab导航 |
| react-native-chart-kit | 图表展示 |
| react-native-gesture-handler | 滑动操作 |
| Axios | HTTP请求 |
| AsyncStorage | 本地存储 |

## 开发

### 环境准备

1. 安装 Node.js 18+
2. 安装 Expo CLI（可选）
3. 安装 Expo Go App（手机测试）

### 启动开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 使用隧道模式（如果局域网不通）
npx expo start --tunnel
```

### 云端编译

```bash
# 登录Expo
eas login

# 编译Android APK
eas build --platform android --profile preview

# 编译生产版本
eas build --platform android --profile production
```

## 配置

### API地址

修改 `src/services/api.ts` 或 `src/utils/config.ts`：

```typescript
const API_BASE_URL = 'http://your-server:port/api';
```

### HTTP请求支持

Android默认禁止HTTP请求，已配置 `usesCleartextTraffic: true`。

如需添加更多域名，修改 `app.json`：

```json
{
  "expo": {
    "plugins": [
      ["expo-build-properties", {
        "android": {
          "usesCleartextTraffic": true
        }
      }]
    ]
  }
}
```

## 目录结构

```
mobile/
├── App.tsx                 # 应用入口
├── app.json                # Expo配置
├── package.json            # 依赖
├── docs/                   # 文档
│   ├── development-plan.md
│   ├── api-spec.md
│   ├── prerequisites.md
│   ├── environment-check.md
│   └── icon-design-spec.md
├── src/
│   ├── screens/            # 页面
│   │   ├── LoginScreen.tsx
│   │   ├── RecordsScreen.tsx
│   │   ├── TrendScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/         # 组件
│   │   └── RecordCard.tsx
│   ├── navigation/         # 导航
│   │   └── AppNavigator.tsx
│   ├── contexts/           # Context
│   │   └── AuthContext.tsx
│   ├── services/           # API服务
│   │   └── api.ts
│   ├── utils/              # 工具
│   │   ├── health.ts
│   │   └── config.ts
│   └── types/              # 类型定义
│       └── index.ts
└── assets/                 # 资源
    ├── icon.png
    ├── adaptive-icon.png
    └── splash-icon.png
```

## 文档

- [开发规划](docs/development-plan.md)
- [API规格](docs/api-spec.md)
- [前置准备](docs/prerequisites.md)
- [环境检查](docs/environment-check.md)
- [图标设计规格](docs/icon-design-spec.md)

## 构建

### Preview版本

```bash
eas build --platform android --profile preview
```

安装链接会在构建完成后显示。

### Production版本

```bash
eas build --platform android --profile production
```

## 许可证

MIT License