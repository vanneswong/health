# 健康助手 (Health Buddy) - 后端 API 文档

## 基础信息

- **基础URL**: `http://localhost:8080/api`
- **认证方式**: JWT Token (Bearer Token)
- **数据格式**: JSON
- **时区**: 北京时间 (UTC+8)

## 认证说明

除登录接口外，所有API请求需要在Header中携带JWT Token：

```
Authorization: Bearer <token>
```

Token通过登录接口获取，有效期7天。

---

## 1. 认证接口 `/api/auth`

### 1.1 用户登录

**POST** `/api/auth/login`

无需认证。

**请求体**:
```json
{
  "username": "admin",
  "password": "admin"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "profile": {
      "name": "张三",
      "age": 45,
      "height": 170,
      "weight": 65,
      "gender": "男"
    }
  }
}
```

**错误响应**:
- `400`: 参数错误
- `401`: 用户名或密码错误

---

### 1.2 修改密码

**PUT** `/api/auth/password`

需要认证。

**请求体**:
```json
{
  "old_password": "admin",
  "new_password": "newpassword123"
}
```

**响应**:
```json
{
  "message": "密码修改成功"
}
```

**错误响应**:
- `400`: 参数错误
- `401`: 原密码错误

---

## 2. 个人资料接口 `/api/profile`

### 2.1 获取个人资料

**GET** `/api/profile`

需要认证。

**响应**:
```json
{
  "name": "张三",
  "age": 45,
  "height": 170,
  "weight": 65,
  "gender": "男"
}
```

---

### 2.2 更新个人资料

**PUT** `/api/profile`

需要认证。

**请求体**:
```json
{
  "name": "张三",
  "age": 45,
  "height": 170,
  "weight": 65,
  "gender": "男"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 姓名 |
| age | integer | 否 | 年龄 (0-150) |
| height | integer | 否 | 身高cm (0-300) |
| weight | integer | 否 | 体重kg (0-500) |
| gender | string | 否 | 性别 |

**响应**:
```json
{
  "id": 1,
  "username": "admin",
  "profile": {
    "name": "张三",
    "age": 45,
    "height": 170,
    "weight": 65,
    "gender": "男"
  },
  "updated_at": "2026-05-26T12:00:00+08:00"
}
```

---

## 3. 血压记录接口 `/api/records`

### 3.1 获取记录列表

**GET** `/api/records`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| page | integer | 1 | 页码 |
| pageSize | integer | 10 | 每页数量 (最大100) |

**响应**:
```json
{
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "systolic": 125,
      "diastolic": 85,
      "pulse": 72,
      "measured_at": "2026-05-26T08:30:00+08:00",
      "medication": "",
      "notes": "",
      "created_at": "2026-05-26T08:30:00+08:00",
      "updated_at": "2026-05-26T08:30:00+08:00"
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 10
}
```

---

### 3.2 获取单条记录

**GET** `/api/records/:id`

需要认证。

**响应**:
```json
{
  "id": 1,
  "user_id": 1,
  "systolic": 125,
  "diastolic": 85,
  "pulse": 72,
  "measured_at": "2026-05-26T08:30:00+08:00",
  "medication": "",
  "notes": "",
  "created_at": "2026-05-26T08:30:00+08:00",
  "updated_at": "2026-05-26T08:30:00+08:00"
}
```

**错误响应**:
- `404`: 记录不存在

---

### 3.3 创建记录

**POST** `/api/records`

需要认证。

**请求体**:
```json
{
  "systolic": 125,
  "diastolic": 85,
  "pulse": 72,
  "measured_at": "2026-05-26T08:30:00+08:00",
  "medication": "阿司匹林",
  "notes": "早餐后测量"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 范围 | 说明 |
|------|------|------|------|------|
| systolic | integer | 是 | 60-250 | 收缩压(高压) mmHg |
| diastolic | integer | 是 | 40-150 | 舒张压(低压) mmHg |
| pulse | integer | 是 | 30-200 | 脉搏 次/分钟 |
| measured_at | string | 否 | - | 测量时间 (ISO格式)，默认当前时间 |
| medication | string | 否 | - | 用药记录 |
| notes | string | 否 | - | 备注 |

**响应**:
```json
{
  "id": 2,
  "user_id": 1,
  "systolic": 125,
  "diastolic": 85,
  "pulse": 72,
  "measured_at": "2026-05-26T08:30:00+08:00",
  "medication": "阿司匹林",
  "notes": "早餐后测量",
  "created_at": "2026-05-26T08:30:00+08:00",
  "updated_at": "2026-05-26T08:30:00+08:00"
}
```

---

### 3.4 更新记录

**PUT** `/api/records/:id`

需要认证。

**请求体**: 同创建记录

**响应**: 更新后的记录对象

**错误响应**:
- `404`: 记录不存在

---

### 3.5 删除记录

**DELETE** `/api/records/:id`

需要认证。

**响应**:
```json
{
  "message": "删除成功"
}
```

**错误响应**:
- `404`: 记录不存在

---

## 4. 血压统计接口 `/api/stats`

### 4.1 获取统计汇总

**GET** `/api/stats/summary`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| days | integer | 30 | 统计天数 |

**响应**:
```json
{
  "avgSystolic": 125,
  "avgDiastolic": 85,
  "avgPulse": 72,
  "maxSystolic": 140,
  "minSystolic": 110,
  "maxDiastolic": 95,
  "minDiastolic": 70,
  "maxPulse": 85,
  "minPulse": 65,
  "count": 15,
  "healthLevel": "正常高值",
  "healthAdvice": "血压处于正常高值范围，建议注意饮食、适度运动、定期监测"
}
```

**健康等级说明**:
| 等级 | 收缩压 | 舒张压 |
|------|--------|--------|
| 正常 | <120 | <80 |
| 正常高值 | 120-139 | 80-89 |
| 高血压1级 | 140-159 | 90-99 |
| 高血压2级 | 160-179 | 100-109 |
| 高血压3级 | ≥180 | ≥110 |

---

### 4.2 获取趋势数据

**GET** `/api/stats/trend`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| days | integer | 30 | 统计天数 |

**响应**:
```json
[
  {
    "id": 1,
    "date": "2026-05-26",
    "measured_at": "2026-05-26T08:30:00+08:00",
    "systolic": 125,
    "diastolic": 85,
    "pulse": 72,
    "healthLevel": "正常高值",
    "medication": "",
    "notes": ""
  }
]
```

---

## 5. 血糖记录接口 `/api/sugar`

### 5.1 获取记录列表

**GET** `/api/sugar`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| page | integer | 1 | 页码 |
| pageSize | integer | 10 | 每页数量 (最大100) |

**响应**:
```json
{
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "sugar_value": 6.2,
      "measure_at": "2026-05-26T07:30:00+08:00",
      "measure_type": "fasting",
      "meal_context": "",
      "medication": "",
      "notes": "",
      "created_at": "2026-05-26T07:30:00+08:00",
      "updated_at": "2026-05-26T07:30:00+08:00"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

---

### 5.2 获取单条记录

**GET** `/api/sugar/:id`

需要认证。

**响应**: 同列表中的单条记录格式

---

### 5.3 创建记录

**POST** `/api/sugar`

需要认证。

**请求体**:
```json
{
  "sugar_value": 6.2,
  "measure_at": "2026-05-26T07:30:00+08:00",
  "measure_type": "fasting",
  "meal_context": "空腹未进食",
  "medication": "",
  "notes": ""
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 范围 | 说明 |
|------|------|------|------|------|
| sugar_value | number | 是 | 1-40 | 血糖值 mmol/L |
| measure_at | string | 否 | - | 测量时间 (ISO格式)，默认当前时间 |
| measure_type | string | 是 | - | 测量类型 |
| meal_context | string | 否 | - | 餐食备注 |
| medication | string | 否 | - | 用药记录 |
| notes | string | 否 | - | 备注 |

**测量类型 (measure_type)**:
| 值 | 说明 |
|------|------|
| fasting | 空腹 |
| postmeal_2h | 餐后2小时 |
| random | 随机 |
| before_sleep | 睡前 |

---

### 5.4 更新记录

**PUT** `/api/sugar/:id`

需要认证。

**请求体**: 同创建记录

---

### 5.5 删除记录

**DELETE** `/api/sugar/:id`

需要认证。

---

## 6. 血糖统计接口 `/api/sugar/stats`

### 6.1 获取统计汇总

**GET** `/api/sugar/stats/summary`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| days | integer | 30 | 统计天数 |

**响应**:
```json
{
  "avgSugar": 6.2,
  "maxSugar": 8.5,
  "minSugar": 5.1,
  "count": 10,
  "healthLevel": "偏高",
  "healthAdvice": "血糖偏高，建议改善饮食结构、适度运动，定期监测"
}
```

**健康等级说明（中国标准）**:

**空腹血糖**:
| 等级 | 血糖值 mmol/L |
|------|---------------|
| 正常 | 3.9-6.1 |
| 偏低 | <3.9 |
| 偏高 | 6.1-7.0 |
| 较高 | 7.0-10.0 |
| 严重偏高 | ≥10.0 |

**餐后2小时**:
| 等级 | 血糖值 mmol/L |
|------|---------------|
| 正常 | <7.8 |
| 偏高 | 7.8-11.1 |
| 较高 | 11.1-16.0 |
| 严重偏高 | ≥16.0 |

---

### 6.2 获取趋势数据

**GET** `/api/sugar/stats/trend`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| days | integer | 30 | 统计天数 |

**响应**:
```json
[
  {
    "id": 1,
    "date": "2026-05-26",
    "measured_at": "2026-05-26T07:30:00+08:00",
    "sugar_value": 6.2,
    "measure_type": "fasting",
    "healthLevel": "偏高",
    "medication": "",
    "notes": ""
  }
]
```

---

## 7. 用药管理接口 `/api/medication`

### 7.1 获取用药计划列表

**GET** `/api/medication`

需要认证。

**响应**:
```json
{
  "medications": [
    {
      "id": 1,
      "user_id": 1,
      "name": "阿司匹林",
      "dosage": "10mg",
      "unit": "片",
      "frequency": "daily",
      "times": ["08:00"],
      "duration": 0,
      "start_date": "2026-05-01T00:00:00+08:00",
      "notes": "早餐后服用",
      "is_active": true,
      "created_at": "2026-05-01T00:00:00+08:00",
      "updated_at": "2026-05-01T00:00:00+08:00"
    }
  ]
}
```

**频率类型 (frequency)**:
| 值 | 说明 |
|------|------|
| daily | 每天一次 |
| twice_daily | 每天两次 |
| three_daily | 每天三次 |
| weekly | 每周 |
| custom | 自定义 |

---

### 7.2 获取单个用药计划

**GET** `/api/medication/:id`

需要认证。

---

### 7.3 创建用药计划

**POST** `/api/medication`

需要认证。

**请求体**:
```json
{
  "name": "阿司匹林",
  "dosage": "10mg",
  "unit": "片",
  "frequency": "daily",
  "times": ["08:00"],
  "duration": 30,
  "start_date": "2026-05-01",
  "notes": "早餐后服用"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 药品名称 |
| dosage | string | 是 | 剂量 (如: 10mg) |
| unit | string | 否 | 单位 (片、粒、ml等)，默认"片" |
| frequency | string | 是 | 服用频率 |
| times | array | 否 | 服用时间点 (如: ["08:00", "20:00"]) |
| duration | integer | 否 | 用药天数，0表示长期用药 |
| start_date | string | 否 | 开始日期 (YYYY-MM-DD)，默认今天 |
| notes | string | 否 | 备注 |

---

### 7.4 更新用药计划

**PUT** `/api/medication/:id`

需要认证。

**请求体**:
```json
{
  "name": "阿司匹林",
  "dosage": "10mg",
  "unit": "片",
  "frequency": "daily",
  "times": ["08:00"],
  "duration": 30,
  "start_date": "2026-05-01",
  "notes": "早餐后服用",
  "is_active": true
}
```

---

### 7.5 删除用药计划

**DELETE** `/api/medication/:id`

需要认证。

---

## 8. 服药记录接口 `/api/medication/logs`

### 8.1 获取服药记录列表

**GET** `/api/medication/logs`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| page | integer | 1 | 页码 |
| pageSize | integer | 10 | 每页数量 (最大100) |

**响应**:
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "medication_id": 1,
      "medication_name": "阿司匹林",
      "dosage": "10mg",
      "scheduled_time": "08:00",
      "taken_at": "2026-05-26T08:05:00+08:00",
      "status": "taken",
      "notes": "",
      "created_at": "2026-05-26T08:05:00+08:00"
    }
  ],
  "total": 30,
  "page": 1,
  "pageSize": 10
}
```

**状态 (status)**:
| 值 | 说明 |
|------|------|
| taken | 已服用 |
| skipped | 跳过 |
| missed | 漏服 |

---

### 8.2 获取今日用药进度

**GET** `/api/medication/logs/today`

需要认证。

**响应**:
```json
{
  "total": 3,
  "taken": 2,
  "skipped": 0,
  "missed": 1,
  "progress": 66.7,
  "medications": [
    {
      "medication_id": 1,
      "medication_name": "阿司匹林",
      "dosage": "10mg",
      "scheduled_time": "08:00",
      "status": "taken",
      "taken_at": "2026-05-26T08:05:00+08:00"
    }
  ]
}
```

---

### 8.3 创建服药记录（打卡）

**POST** `/api/medication/logs`

需要认证。

**请求体**:
```json
{
  "medication_id": 1,
  "dosage": "10mg",
  "scheduled_time": "08:00",
  "taken_at": "2026-05-26T08:05:00+08:00",
  "status": "taken",
  "notes": ""
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| medication_id | integer | 是 | 药品ID |
| dosage | string | 否 | 实际服用剂量 |
| scheduled_time | string | 否 | 计划服用时间 |
| taken_at | string | 否 | 实际服用时间，默认当前时间 |
| status | string | 是 | 状态: taken/skipped/missed |
| notes | string | 否 | 备注 |

---

## 9. 用药统计接口 `/api/medication/stats`

### 9.1 获取用药统计

**GET** `/api/medication/stats`

需要认证。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| days | integer | 30 | 统计天数 |

**响应**:
```json
{
  "totalScheduled": 90,
  "totalTaken": 85,
  "totalSkipped": 3,
  "totalMissed": 2,
  "adherenceRate": 94.4,
  "medications": [
    {
      "medication_id": 1,
      "medication_name": "阿司匹林",
      "scheduled": 30,
      "taken": 28,
      "adherenceRate": 93.3
    }
  ]
}
```

---

## 10. 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "error": "错误信息描述"
}
```

**常见HTTP状态码**:
| 状态码 | 说明 |
|------|------|
| 400 | 参数错误/请求格式错误 |
| 401 | 未认证/Token无效/密码错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 11. 数据存储说明

所有数据存储在 `health_buddy.json` 文件中，包含以下数据结构：

```json
{
  "users": [...],
  "bp_records": [...],
  "sugar_records": [...],
  "medications": [...],
  "medication_logs": [...]
}
```

---

## 12. 默认账号

- **用户名**: `admin`
- **密码**: `admin`

首次登录后建议立即修改密码。