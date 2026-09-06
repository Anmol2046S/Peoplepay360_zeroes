import { describe, it, expect } from 'vitest';
import { canAccessAiTool, normalizeRoleName, getRoleGreeting } from './aiAccess';

describe('AI access policy', () => {
  it('employee can access own payslip but not another employee payslip', () => {
    const employeeUser = {
      id: 'u1',
      orgId: 'org-1',
      role: 'EMPLOYEE',
      permissions: ['EMPLOYEE_READ'],
      employeeId: 'emp-1',
    };

    expect(canAccessAiTool(employeeUser, 'getMyPayslip', { employeeId: 'emp-1' })).toBe(true);
    expect(canAccessAiTool(employeeUser, 'getPayslip', { employeeId: 'emp-2' })).toBe(false);
  });

  it('hr manager can see workforce tools but not payroll approval by default', () => {
    const hrManager = {
      id: 'u2',
      orgId: 'org-1',
      role: 'HR_MANAGER',
      permissions: ['EMPLOYEE_READ', 'ATTENDANCE_READ', 'TIMEOFF_APPROVE'],
      employeeId: 'emp-2',
    };

    expect(canAccessAiTool(hrManager, 'getAttendanceSummary', { orgId: 'org-1' })).toBe(true);
    expect(canAccessAiTool(hrManager, 'approvePayrun', { orgId: 'org-1' })).toBe(false);
  });

  it('payroll manager gets payroll capability and lowercase aliases normalize', () => {
    const payrollManager = {
      id: 'u3',
      orgId: 'org-1',
      role: 'HR_PAYROLL_MANAGER',
      permissions: ['PAYRUN_CALCULATE', 'PAYRUN_APPROVE', 'PAYSLIP_READ'],
      employeeId: 'emp-3',
    };

    expect(normalizeRoleName('hr_payroll_manager')).toBe('HR_PAYROLL_MANAGER');
    expect(canAccessAiTool(payrollManager, 'getPayrollSummary', { orgId: 'org-1' })).toBe(true);
    expect(getRoleGreeting('HR_PAYROLL_MANAGER')).toContain('payroll');
  });
});
