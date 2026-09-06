export type AiRole =
  | 'EMPLOYEE'
  | 'HR_MANAGER'
  | 'HR_PAYROLL_MANAGER'
  | 'HR_PAYROLL_USER'
  | 'ADMIN';

export type AiToolName =
  | 'getMyProfile'
  | 'getMyAttendance'
  | 'getMyLeaveBalance'
  | 'getMyLeaveRequests'
  | 'getMyPayslip'
  | 'getMyContract'
  | 'getAttendanceSummary'
  | 'getEmployee'
  | 'getEmployees'
  | 'getPayrollSummary'
  | 'getPayrun'
  | 'calculatePayrun'
  | 'approvePayrun'
  | 'finalizePayrun'
  | 'getPayslip'
  | 'getContractExpiries'
  | 'getWorkforceInsights';

export type AiUserContext = {
  id: string;
  orgId: string;
  role: AiRole;
  permissions: string[];
  employeeId?: string | null;
};

const TOOL_MATRIX: Record<string, { roles: AiRole[]; requiredPermissions: string[] }> = {
  getMyProfile: { roles: ['EMPLOYEE', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: [] },
  getMyAttendance: { roles: ['EMPLOYEE', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: [] },
  getMyLeaveBalance: { roles: ['EMPLOYEE'], requiredPermissions: [] },
  getMyLeaveRequests: { roles: ['EMPLOYEE'], requiredPermissions: [] },
  getMyPayslip: { roles: ['EMPLOYEE'], requiredPermissions: [] },
  getMyContract: { roles: ['EMPLOYEE'], requiredPermissions: [] },
  getAttendanceSummary: { roles: ['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['ATTENDANCE_READ'] },
  getEmployee: { roles: ['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['EMPLOYEE_READ'] },
  getEmployees: { roles: ['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['EMPLOYEE_READ'] },
  getPayrollSummary: { roles: ['HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['PAYRUN_READ', 'PAYRUN_CALCULATE'] },
  getPayrun: { roles: ['HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['PAYRUN_READ', 'PAYRUN_CALCULATE'] },
  calculatePayrun: { roles: ['HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['PAYRUN_CALCULATE'] },
  approvePayrun: { roles: ['HR_PAYROLL_MANAGER', 'ADMIN'], requiredPermissions: ['PAYRUN_APPROVE'] },
  finalizePayrun: { roles: ['HR_PAYROLL_MANAGER', 'ADMIN'], requiredPermissions: ['PAYRUN_APPROVE'] },
  getPayslip: { roles: ['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN'], requiredPermissions: ['PAYSLIP_READ'] },
  getContractExpiries: { roles: ['HR_MANAGER', 'ADMIN'], requiredPermissions: ['EMPLOYEE_READ'] },
  getWorkforceInsights: { roles: ['HR_MANAGER', 'ADMIN'], requiredPermissions: ['REPORT_VIEW'] },
};

export function normalizeRoleName(value?: string): AiRole {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, '_');
  const aliasMap: Record<string, AiRole> = {
    SUPER_ADMIN: 'ADMIN',
    ADMIN: 'ADMIN',
    HR_MANAGER: 'HR_MANAGER',
    HRPAYROLLMANAGER: 'HR_PAYROLL_MANAGER',
    HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
    HRPAYROLLUSER: 'HR_PAYROLL_USER',
    HR_PAYROLL_USER: 'HR_PAYROLL_USER',
    EMPLOYEE: 'EMPLOYEE',
  };
  return aliasMap[normalized] || 'EMPLOYEE';
}

export function canAccessAiTool(user: AiUserContext, toolName: string, payload: Record<string, unknown> = {}) {
  const policy = TOOL_MATRIX[toolName];
  if (!policy) return false;
  if (!policy.roles.includes(user.role)) return false;

  if (policy.requiredPermissions.length > 0) {
    const hasRequiredPermission = policy.requiredPermissions.some((permission) =>
      user.permissions.includes(permission)
    );
    if (!hasRequiredPermission) return false;
  }

  const selfScopedKeys = ['getMyPayslip', 'getMyProfile', 'getMyAttendance', 'getMyContract', 'getMyLeaveBalance', 'getMyLeaveRequests'];
  if (selfScopedKeys.includes(toolName)) {
    const requestedEmployeeId = String(payload.employeeId || '');
    if (requestedEmployeeId && user.employeeId && requestedEmployeeId !== user.employeeId) {
      return false;
    }
  }

  if (toolName === 'getPayslip') {
    const requestedEmployeeId = String(payload.employeeId || '');
    if (requestedEmployeeId && user.employeeId && requestedEmployeeId !== user.employeeId) {
      return false;
    }
  }

  return true;
}

export function getRoleGreeting(role: string) {
  const normalized = normalizeRoleName(role);
  const greetings: Record<string, string> = {
    EMPLOYEE: 'Hi there 👋 I can help with your attendance, leave, payslips and HR questions.',
    HR_MANAGER: 'Hi 👋 I can help you analyze workforce, attendance, leave and employee data.',
    HR_PAYROLL_MANAGER: 'Hi 👋 I can help with payroll calculations, payruns, payslips and payroll insights.',
    HR_PAYROLL_USER: 'Hi 👋 I can help with payroll operations, validation and payslip summaries.',
    ADMIN: 'Hi 👋 I can help with workforce, payroll and organizational health across the business.',
  };
  return greetings[normalized] || greetings.EMPLOYEE;
}
