import axios from 'axios'

const baseURL = '/api'

const instance = axios.create({
  baseURL,
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface BPRecord {
  id: number
  user_id: number
  systolic: number
  diastolic: number
  pulse: number
  measured_at: string
  medication: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Summary {
  avgSystolic: number
  avgDiastolic: number
  avgPulse: number
  maxSystolic: number
  minSystolic: number
  maxDiastolic: number
  minDiastolic: number
  maxPulse: number
  minPulse: number
  count: number
  healthLevel: string
  healthAdvice: string
}

export interface TrendData {
  id: number
  date: string
  measured_at: string
  systolic: number
  diastolic: number
  pulse: number
  healthLevel: string
  medication: string
  notes: string
}

export interface Profile {
  name: string
  age: number
  height: number
  weight: number
  gender: string
}

export type MeasureType = 'fasting' | 'postmeal_2h' | 'random' | 'before_sleep'

export interface SugarRecord {
  id: number
  user_id: number
  sugar_value: number
  measure_at: string
  measure_type: MeasureType
  meal_context: string
  medication: string
  notes: string
  created_at: string
  updated_at: string
}

export interface SugarSummary {
  avgSugar: number
  maxSugar: number
  minSugar: number
  count: number
  healthLevel: string
  healthAdvice: string
}

export interface SugarTrendData {
  id: number
  date: string
  measured_at: string
  sugar_value: number
  measure_type: MeasureType
  healthLevel: string
  medication: string
  notes: string
}

// 用药相关类型
export type FrequencyType = 'daily' | 'twice_daily' | 'three_daily' | 'weekly' | 'custom'

export interface Medication {
  id: number
  user_id: number
  name: string
  dosage: string
  unit: string
  frequency: FrequencyType
  times: string[]
  duration: number
  start_date: string
  end_date: string | null
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MedicationLog {
  id: number
  user_id: number
  medication_id: number
  medication_name: string
  dosage: string
  scheduled_time: string
  taken_at: string
  status: 'taken' | 'skipped' | 'missed'
  notes: string
  created_at: string
}

export interface MedicationStats {
  medication_id: number
  medication_name: string
  dosage: string
  frequency: FrequencyType
  taken_count: number
  skipped_count: number
  missed_count: number
  adherence_rate: number
}

export const api = {
  async login(username: string, password: string) {
    const response = await instance.post('/auth/login', { username, password })
    return response.data
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await instance.put('/auth/password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return response.data
  },

  async getRecords(page: number = 1, pageSize: number = 10) {
    const response = await instance.get('/records', {
      params: { page, pageSize },
    })
    return response.data
  },

  async getRecord(id: number) {
    const response = await instance.get(`/records/${id}`)
    return response.data
  },

  async createRecord(record: Partial<BPRecord>) {
    const response = await instance.post('/records', record)
    return response.data
  },

  async updateRecord(id: number, record: Partial<BPRecord>) {
    const response = await instance.put(`/records/${id}`, record)
    return response.data
  },

  async deleteRecord(id: number) {
    const response = await instance.delete(`/records/${id}`)
    return response.data
  },

  async getSummary(days: number = 30) {
    const response = await instance.get('/stats/summary', {
      params: { days },
    })
    return response.data
  },

  async getTrend(days: number = 30) {
    const response = await instance.get('/stats/trend', {
      params: { days },
    })
    return response.data
  },

  async getProfile() {
    const response = await instance.get('/profile')
    return response.data
  },

  async updateProfile(profile: Partial<Profile>) {
    const response = await instance.put('/profile', profile)
    return response.data
  },

  // 血糖相关API
  async getSugarRecords(page: number = 1, pageSize: number = 10) {
    const response = await instance.get('/sugar', {
      params: { page, pageSize },
    })
    return response.data
  },

  async getSugarRecord(id: number) {
    const response = await instance.get(`/sugar/${id}`)
    return response.data
  },

  async createSugarRecord(record: Partial<SugarRecord>) {
    const response = await instance.post('/sugar', record)
    return response.data
  },

  async updateSugarRecord(id: number, record: Partial<SugarRecord>) {
    const response = await instance.put(`/sugar/${id}`, record)
    return response.data
  },

  async deleteSugarRecord(id: number) {
    const response = await instance.delete(`/sugar/${id}`)
    return response.data
  },

  async getSugarSummary(days: number = 30) {
    const response = await instance.get('/sugar/stats/summary', {
      params: { days },
    })
    return response.data
  },

  async getSugarTrend(days: number = 30) {
    const response = await instance.get('/sugar/stats/trend', {
      params: { days },
    })
    return response.data
  },

  // 用药相关API
  async getMedications(activeOnly: boolean = false) {
    const response = await instance.get('/medication', {
      params: { active: activeOnly ? 'true' : 'false' },
    })
    return response.data
  },

  async getMedication(id: number) {
    const response = await instance.get(`/medication/${id}`)
    return response.data
  },

  async createMedication(med: Partial<Medication>) {
    const response = await instance.post('/medication', med)
    return response.data
  },

  async updateMedication(id: number, med: Partial<Medication>) {
    const response = await instance.put(`/medication/${id}`, med)
    return response.data
  },

  async deleteMedication(id: number) {
    const response = await instance.delete(`/medication/${id}`)
    return response.data
  },

  async getMedicationLogs(page: number = 1, pageSize: number = 20) {
    const response = await instance.get('/medication/logs', {
      params: { page, pageSize },
    })
    return response.data
  },

  async getTodayMedicationLogs() {
    const response = await instance.get('/medication/logs/today')
    return response.data
  },

  async createMedicationLog(log: Partial<MedicationLog>) {
    const response = await instance.post('/medication/logs', log)
    return response.data
  },

  async getMedicationStats(days: number = 30) {
    const response = await instance.get('/medication/stats', {
      params: { days },
    })
    return response.data
  },
}