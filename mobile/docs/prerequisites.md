# 血压宝 App 开发前置准备

## 开发环境要求

### 必需环境

| 项目 | 版本要求 | 检查命令 | 当前状态 |
|------|----------|----------|----------|
| Node.js | 18.x或以上 | `node -v` | ✓ v22.14.0 已安装 |
| npm | 9.x或以上 | `npm -v` | ✓ v11.4.0 已安装 |
| 手机测试设备 | Android手机 | - | 需准备 |

### 可选环境

| 项目 | 说明 | 检查命令 |
|------|------|----------|
| Expo CLI | 全局安装（可选） | `expo --version` |
| EAS CLI | 云端编译工具 | `eas --version` |

---

## 账号准备

### 1. Expo账号

云端编译需要Expo账号，请提前注册：

**注册步骤：**
1. 访问 https://expo.dev
2. 点击 "Sign Up" 注册账号
3. 填写邮箱和密码
4. 验证邮箱

**登录方式：**
```bash
# 命令行登录
npx expo login

# 或使用EAS CLI登录
npx eas login
```

### 2. EAS配置

首次使用云端编译需要配置：

```bash
# 安装EAS CLI
npm install -g eas-cli

# 登录Expo账号
eas login

# 配置项目
eas build:configure
```

---

## 测试设备准备

### 方式一：Expo Go App（开发测试）

**安装步骤：**
1. 在Android手机上打开Google Play商店
2. 搜索 "Expo Go"
3. 安装 Expo Go 应用

**使用方法：**
```bash
# 启动开发服务器
npx expo start

# 扫描二维码或输入URL连接
# 在Expo Go中打开应用进行测试
```

### 方式二：直接安装APK（发布测试）

云端编译生成APK后，可直接安装到手机测试：
```bash
# 云端编译APK
eas build --platform android

# 下载APK并安装到手机
```

---

## 网络环境检查

确保开发环境能访问服务端API：

```bash
# 测试API连接
curl http://117.72.127.10:9000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'

# 预期返回
# {"token":"xxx","user":{"id":1,"username":"admin"}}
```

或在浏览器中访问：http://117.72.127.10:9000/

---

## 开发工具推荐

### IDE选择
| 工具 | 说明 |
|------|------|
| VS Code | 推荐，有React Native插件支持 |
| WebStorm | JetBrains出品，支持React Native |
| Sublime Text | 轻量级编辑器 |

### VS Code推荐插件
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- TypeScript Hero
- Prettier - Code formatter
- ESLint

---

## 依赖包清单

项目需要安装以下主要依赖：

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.2.0",
    "react-native": "0.76.0",
    "react-native-paper": "^5.12.0",
    "react-navigation": "^6.0.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/bottom-tabs": "^6.0.0",
    "@react-navigation/native-stack": "^6.0.0",
    "react-native-safe-area-context": "^4.0.0",
    "react-native-screens": "^3.0.0",
    "axios": "^1.6.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^15.0.0",
    "expo-status-bar": "~1.12.0"
  }
}
```

---

## 快速开始

### 创建项目

```bash
# 进入项目目录
cd mobile

# 创建Expo项目（如果尚未创建）
npx create-expo-app@latest . --template blank-typescript

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 开发流程

```
1. 编写代码 → 2. Expo Go测试 → 3. 修复问题 → 4. 云端编译 → 5. APK测试
```

---

## 常见问题

### Q: Expo Go无法连接开发服务器？
检查：
- 手机和电脑是否在同一网络
- 是否有防火墙阻止连接
- 尝试使用隧道模式：`npx expo start --tunnel`

### Q: 云端编译失败？
检查：
- Expo账号是否已登录
- eas.json配置是否正确
- 项目依赖是否完整

### Q: API请求失败？
检查：
- 服务端是否正常运行
- 网络是否可访问API地址
- Token是否有效

---

## 检查清单

开发开始前请确认：

- [ ] Node.js已安装（v18+）
- [ ] npm已安装（v9+）
- [ ] Expo账号已注册
- [ ] Expo Go App已安装到手机
- [ ] 能访问服务端API http://117.72.127.10:9000/api
- [ ] VS Code或其他IDE已准备
- [ ] 熟悉React Native基础语法（可选）

---

## 下一步

环境准备完成后，即可开始项目开发：

1. 创建Expo项目结构
2. 配置API服务
3. 实现登录功能
4. 开发各功能模块
5. 测试和发布