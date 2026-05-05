# 血压宝 API 规格说明

## 服务端信息

| 项目 | 值 |
|------|-----|
| API Base URL | http://117.72.127.10:9000/api |
| 认证方式 | JWT Token |
| Content-Type | application/json |
| Token Header | Authorization: Bearer <token> |

## 认证机制

### JWT Token
- 登录成功后服务端返回Token
- Token存储在客户端AsyncStorage
- 每次API请求在Header中携带Token
- Token过期或无效返回401状态码

### Token格式
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API端点详情

### 1. 认证接口

#### 1.1 登录
```
POST /api/auth/login
```

**请求体**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**成功响应** (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**失败响应** (401)
```json
{
  "error": "用户名或密码错误"
}
```

#### 1.2 修改密码
```
PUT /api/auth/password
```

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "old_password": "admin",
  "new_password": "newpass123"
}
```

**成功响应** (200)
```json
{
  "message": "密码修改成功"
}
```

**失败响应** (400)
```json
{
  "error": "旧密码错误"
}
```

---

### 2. 血压记录接口

#### 2.1 获取记录列表
```
GET /api/records?page=1&pageSize=10
```

**请求头**
```
Authorization: Bearer <token>
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码 |
| pageSize | int | 10 | 每页数量 |

**成功响应** (200)
```json
{
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "systolic": 120,
      "diastolic": 80,
      "pulse": 72,
      "measured_at": "2024-01-15T08:30:00Z",
      "medication": "",
      "notes": "",
      "created_at": "2024-01-15T08:30:00Z",
      "updated_at": "2024-01-15T08:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10
}
```

#### 2.2 获取单条记录
```
GET /api/records/:id
```

**成功响应** (200)
```json
{
  "id": 1,
  "user_id": 1,
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "measured_at": "2024-01-15T08:30:00Z",
  "medication": "",
  "notes": "",
  "created_at": "2024-01-15T08:30:00Z",
  "updated_at": "2024-01-15T08:30:00Z"
}
```

**失败响应** (404)
```json
{
  "error": "记录不存在"
}
```

#### 2.3 创建记录
```
POST /api/records
```

**请求体**
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "measured_at": "2024-01-15T08:30:00Z",
  "medication": "降压药",
  "notes": "饭后测量"
}
```

**字段校验**
| 字段 | 类型 | 必填 | 范围 |
|------|------|------|------|
| systolic | int | 是 | 60-250 |
| diastolic | int | 是 | 40-150 |
| pulse | int | 是 | 30-200 |
| measured_at | string | 否 | ISO格式，默认当前时间 |
| medication | string | 否 | - |
| notes | string | 否 | - |

**成功响应** (200)
返回创建的记录对象

**失败响应** (400)
```json
{
  "error": "参数错误: systolic must be between 60 and 250"
}
```

#### 2.4 更新记录
```
PUT /api/records/:id
```

请求体同创建记录

#### 2.5 删除记录
```
DELETE /api/records/:id
```

**成功响应** (200)
```json
{
  "message": "删除成功"
}
```

**失败响应** (404)
```json
{
  "error": "记录不存在"
}
```

---

### 3. 统计接口

#### 3.1 获取统计汇总
```
GET /api/stats/summary?days=30
```

**查询参数**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| days | int | 30 | 统计天数 |

**成功响应** (200)
```json
{
  "avgSystolic": 125,
  "avgDiastolic": 82,
  "avgPulse": 75,
  "maxSystolic": 145,
  "minSystolic": 110,
  "maxDiastolic": 95,
  "minDiastolic": 70,
  "maxPulse": 85,
  "minPulse": 65,
  "count": 15,
  "healthLevel": "正常高值",
  "healthAdvice": "血压偏高，建议改善生活方式..."
}
```

#### 3.2 获取趋势数据
```
GET /api/stats/trend?days=30
```

**成功响应** (200)
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "measured_at": "2024-01-15T08:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "healthLevel": "正常",
    "medication": "",
    "notes": ""
  }
]
```

---

## 健康等级标准

| 等级 | 收缩压 | 舒张压 | 颜色建议 |
|------|--------|--------|----------|
| 正常 | <120 | <80 | #4caf50 (绿色) |
| 正常高值 | 120-139 | 80-89 | #ff9800 (橙色) |
| 高血压1级 | 140-159 | 90-99 | #f44336 (红色) |
| 高血压2级 | 160-179 | 100-109 | #d32f2f (深红) |
| 高血压3级 | ≥180 | ≥110 | #b71c1c (暗红) |

---

## 错误处理

| 状态码 | 含义 | App处理 |
|--------|------|----------|
| 200 | 成功 | 正常处理 |
| 400 | 参数错误 | 显示错误提示 |
| 401 | 未授权 | 跳转登录页 |
| 404 | 资源不存在 | 显示提示 |
| 500 | 服务端错误 | 显示错误提示 |

---

## TypeScript类型定义

```typescript
// 用户信息
interface User {
  id: number;
  username: string;
}

// 登录响应
interface LoginResponse {
  token: string;
  user: User;
}

// 血压记录
interface BPRecord {
  id: number;
  user_id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  measured_at: string;
  medication?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 记录列表响应
interface RecordsResponse {
  records: BPRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 统计汇总
interface Summary {
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
  maxSystolic: number;
  minSystolic: number;
  maxDiastolic: number;
  minDiastolic: number;
  maxPulse: number;
  minPulse: number;
  count: number;
  healthLevel: string;
  healthAdvice: string;
}

// 趋势数据
interface TrendData {
  id: number;
  date: string;
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  healthLevel: string;
  medication?: string;
  notes?: string;
}

// 创建记录请求
interface CreateRecordRequest {
  systolic: number;
  diastolic: number;
  pulse: number;
  measured_at?: string;
  medication?: string;
  notes?: string;
}

// 修改密码请求
interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
```