import apiClient from './apiClient';
import type {
  TimeOffType, TimeOffRequest, TimeOffAllocation, ApiResponse
} from '../types';

export const timeOffService = {
  // Types
  async listTypes(): Promise<ApiResponse<TimeOffType[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffType[]>>('/time-off/types').catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
  async getType(id: string): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffType>>(`/time-off/types/${id}`).catch(() => ({ data: { success: true, data: {} as TimeOffType } }));
    return data;
  },
  async createType(payload: Partial<TimeOffType>): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffType>>('/time-off/types', payload);
    return data;
  },
  async updateType(id: string, payload: Partial<TimeOffType>): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.put<ApiResponse<TimeOffType>>(`/time-off/types/${id}`, payload);
    return data;
  },

  // Requests
  async listRequests(params?: Record<string, string>): Promise<ApiResponse<TimeOffRequest[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffRequest[]>>('/time-off/requests', { params }).catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
  async getRequest(id: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}`);
    return data;
  },
  async createRequest(payload: Partial<TimeOffRequest>): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffRequest>>('/time-off/requests', {
      typeId: payload.timeOffTypeId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    });
    return data;
  },
  async approveRequest(id: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}/approve`);
    return data;
  },
  async refuseRequest(id: string, reason?: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}/reject`, { reason });
    return data;
  },

  // Allocations
  async listAllocations(params?: Record<string, string>): Promise<ApiResponse<TimeOffAllocation[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffAllocation[]>>('/time-off/allocations', { params }).catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
  async getAllocation(id: string): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffAllocation>>(`/time-off/allocations/${id}`);
    return data;
  },
  async createAllocation(payload: Partial<TimeOffAllocation>): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffAllocation>>('/time-off/allocations', payload);
    return data;
  },
  async updateAllocation(id: string, payload: Partial<TimeOffAllocation>): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.patch<ApiResponse<TimeOffAllocation>>(`/time-off/allocations/${id}`, payload);
    return data;
  },
  async deleteAllocation(id: string): Promise<ApiResponse<any>> {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/time-off/allocations/${id}`);
    return data;
  },
};
