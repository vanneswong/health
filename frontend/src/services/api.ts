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
}