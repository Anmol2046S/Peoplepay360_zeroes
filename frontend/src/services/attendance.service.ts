import apiClient from './apiClient';
import { Attendance, ApiResponse } from '../types';

export const attendanceService = {
  async list(params?: Record<string, string>): Promise<ApiResponse<Attendance[]>> {
    const { data } = await apiClient.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return data;
  },

  async get(id: string): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.get<ApiResponse<Attendance>>(`/attendance/${id}`);
    return data;
  },

  async getActiveSession(): Promise<ApiResponse<Attendance | null>> {
    const { data } = await apiClient.get<ApiResponse<Attendance | null>>('/attendance/active-session');
    return data;
  },

  async checkIn(): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.post<ApiResponse<Attendance>>('/attendance/check-in', {
      timestamp: new Date().toISOString(),
    });
    return data;
  },

  async checkOut(): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.post<ApiResponse<Attendance>>('/attendance/check-out', {
      timestamp: new Date().toISOString(),
    });
    return data;
  },

  async update(id: string, payload: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.put<ApiResponse<Attendance>>(`/attendance/${id}`, payload);
    return data;
  },
};
