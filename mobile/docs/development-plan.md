# 血压宝 Android App 开发规划

## 项目概述

血压宝Android App是基于React Native和Expo开发的移动应用，用于记录和管理血压数据。应用采用Material Design设计风格，支持云端编译，无需本地安装Android Studio。

## 技术栈

| 技术 | 版本/选择 | 说明 |
|------|----------|------|
| React Native | Expo SDK 52+ | 跨平台移动开发框架 |
| Expo | EAS Build | 云端编译服务 |
| UI库 | React Native Paper | Material Design组件库 |
| 图表 | react-native-chart-kit | 轻量级图表库 |
| 导航 | React Navigation 6+ | 官方导航解决方案 |
| HTTP | Axios | HTTP请求库 |
| 存储 | AsyncStorage | 本地数据持久化 |

## 功能模块

### 1. 用户认证
- 登录功能（用户名+密码）
- JWT Token认证
- 自动登录（Token持久化）
- 退出登录
- 修改密码

### 2. 血压记录管理
- 记录列表展示（卡片式布局）
- 分页加载
- 新增记录
- 编辑记录
- 删除记录（带确认）
- 健康等级标签显示

### 3. 趋势图表
- 血压趋势折线图
- 收缩压/舒张压/脉搏三条曲线
- 时间范围切换（7天/30天/90天/365天）
- 参考标准说明

### 4. 统计汇总
- 健康状态评估
- 健康建议显示
- 平均值统计
- 最高/最低值统计
- 记录次数统计
- 时间范围切换

### 5. 设置页面
- 用户信息展示
- 修改密码
- 退出登录
- 应用信息

## 页面结构

| 页面 | 路由 | 说明 |
|------|------|------|
| LoginScreen | /login | 登录页面 |
| RecordsScreen | /records | 血压记录列表 |
| TrendScreen | /trend | 趋势图表 |
| StatsScreen | /stats | 统计汇总 |
| SettingsScreen | /settings | 设置 |

## 导航架构

采用底部Tab导航作为主导航，包含四个Tab页：
- 血压记录（默认页）
- 趋势图表
- 统计汇总
- 设置

登录页面使用Stack导航，登录成功后进入Tab导航。

## 数据流

```
用户操作 → React组件 → API服务 → 服务端API
                ↓
         AsyncStorage（Token存储）
```

## 开发阶段

### Phase 1: 项目初始化
- 创建Expo项目
- 配置TypeScript
- 安装依赖包
- 创建目录结构

### Phase 2: 基础架构
- 配置API服务
- 实现认证Context
- 配置导航系统
- 实现登录页面

### Phase 3: 核心功能
- 实现记录列表页
- 实现添加/编辑功能
- 实现删除功能
- 实现统计汇总页

### Phase 4: 完善功能
- 实现趋势图表
- 实现设置页面
- 实现修改密码
- UI优化

### Phase 5: 测试发布
- 功能测试
- 云端编译
- APK生成
- 发布准备

## 预估工作量

| 阶段 | 时间 |
|------|------|
| Phase 1 | 30分钟 |
| Phase 2 | 1.5小时 |
| Phase 3 | 2小时 |
| Phase 4 | 1.5小时 |
| Phase 5 | 30分钟 |
| **总计** | **约5-6小时** |

## 服务端信息

- API地址：http://117.72.127.10:9000/api
- 认证方式：JWT Token
- 默认账号：admin / admin

## 注意事项

1. 网络请求需要处理超时和错误
2. Token过期后自动跳转登录页
3. 数据输入需要校验范围
4. 图表需要适配移动端尺寸
5. 需考虑离线场景（可扩展功能）