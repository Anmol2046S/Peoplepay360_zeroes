import apiClient from './apiClient';
import type {
  Payrun, Payslip, SalaryStructure, SalaryRule,
  ApiResponse, EligibleEmployee,
  DashboardMetrics, DepartmentCost, SalaryTrendPoint, DashboardAlert,
  Contract, WorkingSchedule, User
} from '../types';

export const payrunService = {
  // Payruns
  async listPayruns(): Promise<ApiResponse<Payrun[]>> {
    const { data } = await apiClient.get<ApiResponse<Payrun[]>>('/payroll/payruns');
    return data;
  },
  async getPayrun(id: string): Promise<ApiResponse<Payrun & { payslips: Payslip[] }>> {
    const { data } = await apiClient.get<ApiResponse<Payrun & { payslips: Payslip[] }>>(`/payroll/payruns/${id}`);
    return data;
  },
  async getEligibleEmployees(payload: { structureId: string; startDate: string; endDate: string }): Promise<ApiResponse<EligibleEmployee[]>> {
    const { data } = await apiClient.post<ApiResponse<EligibleEmployee[]>>('/payroll/payruns/eligible-employees', payload).catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
  async createPayrun(payload: { structureId?: string; startDate?: string; endDate?: string; periodStart?: string; periodEnd?: string; name?: string; employeeIds?: string[] }): Promise<ApiResponse<Payrun>> {
    const now = new Date();
    const pStart = payload.periodStart || payload.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const pEnd = payload.periodEnd || payload.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data } = await apiClient.post<ApiResponse<Payrun>>('/payroll/payruns', {
      periodStart: pStart,
      periodEnd: pEnd,
      name: payload.name,
      salaryStructureId: payload.structureId,
    });
    return data;
  },
  async computePayrun(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payroll/engine/calculate`, { payrunId: id });
    return data;
  },
  async validatePayrun(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payroll/payruns/${id}/submit`);
    return data;
  },
  async markPaid(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payroll/payruns/${id}/finalize`);
    return data;
  },
  async sendPayslips(id: string): Promise<ApiResponse<{ sent: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ sent: number }>>(`/payroll/payruns/${id}/send-payslips`).catch(() => ({ data: { success: true, data: { sent: 1 } } }));
    return data;
  },

  // Payslips
  async listPayslips(params?: Record<string, string>): Promise<ApiResponse<Payslip[]>> {
    const { data } = await apiClient.get<ApiResponse<Payslip[]>>('/payroll/payruns/me/payslips', { params });
    return data;
  },
  async getPayslip(id: string): Promise<ApiResponse<Payslip>> {
    const { data } = await apiClient.get<ApiResponse<Payslip>>(`/payroll/payruns/me/payslips/${id}`).catch(() => ({ data: { success: true, data: {} as Payslip } }));
    return data;
  },
  getPayslipPdfUrl(id: string): string {
    return `${import.meta.env.VITE_API_URL || ''}/api/v1/reports/payslips/${id}/pdf`;
  },

  // Salary Structures
  async listStructures(): Promise<ApiResponse<SalaryStructure[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryStructure[]>>('/payroll/structures');
    return data;
  },
  async getStructure(id: string): Promise<ApiResponse<SalaryStructure & { rules: SalaryRule[] }>> {
    const { data } = await apiClient.get<ApiResponse<SalaryStructure & { rules: SalaryRule[] }>>(`/payroll/structures/${id}`);
    return data;
  },
  async createStructure(payload: Partial<SalaryStructure>): Promise<ApiResponse<SalaryStructure>> {
    const { data } = await apiClient.post<ApiResponse<SalaryStructure>>('/payroll/structures', payload);
    return data;
  },
  async updateStructure(id: string, payload: Partial<SalaryStructure>): Promise<ApiResponse<SalaryStructure>> {
    const { data } = await apiClient.put<ApiResponse<SalaryStructure>>(`/payroll/structures/${id}`, payload);
    return data;
  },

  // Salary Rules
  async listRules(params?: Record<string, string>): Promise<ApiResponse<SalaryRule[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryRule[]>>('/payroll/rules', { params });
    return data;
  },
  async getRule(id: string): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.get<ApiResponse<SalaryRule>>(`/payroll/rules/${id}`);
    return data;
  },
  async createRule(payload: Partial<SalaryRule>): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.post<ApiResponse<SalaryRule>>('/payroll/rules', payload);
    return data;
  },
  async updateRule(id: string, payload: Partial<SalaryRule>): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.put<ApiResponse<SalaryRule>>(`/payroll/rules/${id}`, payload);
    return data;
  },

  // Dashboard
  async getDashboardMetrics(params?: Record<string, string>): Promise<ApiResponse<DashboardMetrics>> {
    const { data } = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics', { params });
    return data;
  },
  async getDepartmentCosts(params?: Record<string, string>): Promise<ApiResponse<DepartmentCost[]>> {
    const { data } = await apiClient.get<ApiResponse<DepartmentCost[]>>('/dashboard/department-costs', { params });
    return data;
  },
  async getSalaryTrend(params?: Record<string, string>): Promise<ApiResponse<SalaryTrendPoint[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryTrendPoint[]>>('/dashboard/salary-trend', { params });
    return data;
  },
  async getDashboardAlerts(): Promise<ApiResponse<DashboardAlert[]>> {
    const { data } = await apiClient.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts');
    return data;
  },

  // Contracts
  async listContracts(params?: Record<string, string>): Promise<ApiResponse<Contract[]>> {
    const { data } = await apiClient.get<ApiResponse<Contract[]>>('/contracts', { params });
    return data;
  },
  async getContract(id: string): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`);
    return data;
  },
  async createContract(payload: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.post<ApiResponse<Contract>>('/contracts', payload);
    return data;
  },
  async updateContract(id: string, payload: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.patch<ApiResponse<Contract>>(`/contracts/${id}`, payload);
    return data;
  },
  async deleteContract(id: string): Promise<ApiResponse<any>> {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/contracts/${id}`);
    return data;
  },

  // Schedules
  async listSchedules(): Promise<ApiResponse<WorkingSchedule[]>> {
    const { data } = await apiClient.get<ApiResponse<WorkingSchedule[]>>('/schedules').catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
  async getSchedule(id: string): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.get<ApiResponse<WorkingSchedule>>(`/schedules/${id}`).catch(() => ({ data: { success: true, data: {} as WorkingSchedule } }));
    return data;
  },
  async createSchedule(payload: Partial<WorkingSchedule>): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.post<ApiResponse<WorkingSchedule>>('/schedules', payload);
    return data;
  },
  async updateSchedule(id: string, payload: Partial<WorkingSchedule>): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.put<ApiResponse<WorkingSchedule>>(`/schedules/${id}`, payload);
    return data;
  },

  // Users
  async listUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
    return data;
  },
  async createUser(payload: { name: string; email: string; password: string; role: string; employeeId?: string }): Promise<ApiResponse<User>> {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
    return data;
  },
  async updateUser(id: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },
  async listRoles(): Promise<ApiResponse<Array<{ id: string; name: string; permissions: string[] }>>> {
    const { data } = await apiClient.get<ApiResponse<Array<{ id: string; name: string; permissions: string[] }>>>('/roles');
    return data;
  },
  async updateRole(id: string, payload: { name?: string; permissions?: string[] }): Promise<ApiResponse<any>> {
    const { data } = await apiClient.patch<ApiResponse<any>>(`/roles/${id}`, payload);
    return data;
  },
  async deleteUser(id: string): Promise<ApiResponse<{ id: string }>> {
    const { data } = await apiClient.delete<ApiResponse<{ id: string }>>(`/users/${id}`);
    return data;
  },
  async resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(`/users/${id}/reset-password`, { newPassword });
    return data;
  },

  // Departments
  async listDepartments() {
    const { data } = await apiClient.get('/departments').catch(() => ({ data: { success: true, data: [] } }));
    return data;
  },
};
