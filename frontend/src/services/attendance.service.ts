import apiClient from './apiClient';
import type { Attendance, ApiResponse } from '../types';

export const attendanceService = {
  async list(params?: Record<string, string>): Promise<ApiResponse<Attendance[]>> {
    const { data } = await apiClient.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return data;
  },

  async getByEmployee(employeeId: string): Promise<ApiResponse<Attendance[]>> {
    const { data } = await apiClient.get<ApiResponse<Attendance[]>>(`/attendance/employee/${employeeId}`);
    return data;
  },

  async checkIn(employeeId?: string): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.post<ApiResponse<Attendance>>('/attendance/check-in', {
      employeeId,
      date: new Date().toISOString(),
      checkIn: new Date().toISOString(),
    });
    return data;
  },

  async checkOut(id: string): Promise<ApiResponse<Attendance>> {
    const { data } = await apiClient.post<ApiResponse<Attendance>>(`/attendance/${id}/check-out`, {
      checkOut: new Date().toISOString(),
    });
    return data;
  },
};
