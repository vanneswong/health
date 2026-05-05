import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BPRecord, LoginResponse, RecordsResponse, Summary, TrendData, CreateRecordRequest, ChangePasswordRequest } from '../types';

const API_BASE_URL = 'http://117.72.127.10:9000/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await instance.post('/auth/login', { username, password });
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await instance.put('/auth/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async getRecords(page: number = 1, pageSize: number = 10): Promise<RecordsResponse> {
    const response = await instance.get('/records', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getRecord(id: number): Promise<BPRecord> {
    const response = await instance.get(`/records/${id}`);
    return response.data;
  },

  async createRecord(record: CreateRecordRequest): Promise<BPRecord> {
    const response = await instance.post('/records', record);
    return response.data;
  },

  async updateRecord(id: number, record: CreateRecordRequest): Promise<BPRecord> {
    const response = await instance.put(`/records/${id}`, record);
    return response.data;
  },

  async deleteRecord(id: number): Promise<{ message: string }> {
    const response = await instance.delete(`/records/${id}`);
    return response.data;
  },

  async getSummary(days: number = 30): Promise<Summary> {
    const response = await instance.get('/stats/summary', {
      params: { days },
    });
    return response.data;
  },

  async getTrend(days: number = 30): Promise<TrendData[]> {
    const response = await instance.get('/stats/trend', {
      params: { days },
    });
    return response.data;
  },
};