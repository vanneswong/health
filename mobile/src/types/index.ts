// 用户信息
export interface User {
  id: number;
  username: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 血压记录
export interface BPRecord {
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
export interface RecordsResponse {
  records: BPRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 统计汇总
export interface Summary {
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
export interface TrendData {
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
export interface CreateRecordRequest {
  systolic: number;
  diastolic: number;
  pulse: number;
  measured_at?: string;
  medication?: string;
  notes?: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}