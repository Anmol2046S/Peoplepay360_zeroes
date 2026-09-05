import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

import LoginPage from '../pages/LoginPage';
import PayrollDashboardPage from '../pages/PayrollDashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import EmployeeListPage from '../pages/EmployeeListPage';
import EmployeeFormPage from '../pages/EmployeeFormPage';
import ContractListPage from '../pages/ContractListPage';
import ContractFormPage from '../pages/ContractFormPage';
import WorkingScheduleListPage from '../pages/WorkingScheduleListPage';
import WorkingScheduleFormPage from '../pages/WorkingScheduleFormPage';
import AttendanceListPage from '../pages/AttendanceListPage';
import AttendanceFormPage from '../pages/AttendanceFormPage';
import TimeOffHub from '../pages/TimeOffHub';
import TimeOffRequestsPage from '../pages/TimeOffRequestsPage';
import TimeOffRequestFormPage from '../pages/TimeOffRequestFormPage';
import TimeOffAllocationsPage from '../pages/TimeOffAllocationsPage';
import TimeOffAllocationFormPage from '../pages/TimeOffAllocationFormPage';
import TimeOffTypesListPage from '../pages/TimeOffTypesListPage';
import TimeOffTypeFormPage from '../pages/TimeOffTypeFormPage';
import PayrunsListPage from '../pages/PayrunsListPage';
import PayrunProcessingPage from '../pages/PayrunProcessingPage';
import PayslipsListPage from '../pages/PayslipsListPage';
import PayslipComputationPage from '../pages/PayslipComputationPage';
import SalaryStructuresListPage from '../pages/SalaryStructuresListPage';
import SalaryStructureFormPage from '../pages/SalaryStructureFormPage';
import SalaryRulesListPage from '../pages/SalaryRulesListPage';
import SalaryRuleFormPage from '../pages/SalaryRuleFormPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Workspace Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PayrollDashboardPage />} />

          {/* HR & Employees */}
          <Route path="/hr/employees" element={<EmployeeListPage />} />
          <Route path="/hr/employees/:id" element={<EmployeeFormPage />} />

          {/* Contracts */}
          <Route element={<ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
            <Route path="/hr/contracts" element={<ContractListPage />} />
            <Route path="/hr/contracts/:id" element={<ContractFormPage />} />
          </Route>

          {/* Schedules */}
          <Route path="/hr/schedules" element={<WorkingScheduleListPage />} />
          <Route path="/hr/schedules/:id" element={<WorkingScheduleFormPage />} />

          {/* Attendance */}
          <Route path="/hr/attendance" element={<AttendanceListPage />} />
          <Route path="/hr/attendance/:id" element={<AttendanceFormPage />} />

          {/* Time Off */}
          <Route path="/time-off" element={<TimeOffHub />} />
          <Route path="/time-off/requests" element={<TimeOffRequestsPage />} />
          <Route path="/time-off/requests/:id" element={<TimeOffRequestFormPage />} />
          <Route path="/time-off/allocations" element={<TimeOffAllocationsPage />} />
          <Route path="/time-off/allocations/:id" element={<TimeOffAllocationFormPage />} />

          <Route element={<ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
            <Route path="/time-off/types" element={<TimeOffTypesListPage />} />
            <Route path="/time-off/types/:id" element={<TimeOffTypeFormPage />} />
          </Route>

          {/* Payroll Execution */}
          <Route element={<ProtectedRoute allowedRoles={['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN']} />}>
            <Route path="/payroll/payruns" element={<PayrunsListPage />} />
            <Route path="/payroll/payruns/:id" element={<PayrunProcessingPage />} />
            <Route path="/payroll/payslips" element={<PayslipsListPage />} />
            <Route path="/payroll/payslips/:id" element={<PayslipComputationPage />} />
          </Route>

          {/* Salary Config */}
          <Route element={<ProtectedRoute allowedRoles={['HR_PAYROLL_MANAGER', 'ADMIN']} />}>
            <Route path="/payroll/structures" element={<SalaryStructuresListPage />} />
            <Route path="/payroll/structures/:id" element={<SalaryStructureFormPage />} />
            <Route path="/payroll/rules" element={<SalaryRulesListPage />} />
            <Route path="/payroll/rules/:id" element={<SalaryRuleFormPage />} />
          </Route>

          {/* Administration */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default AppRoutes;
