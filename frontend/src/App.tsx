import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import TimeOffDashboard from './pages/timeoff/TimeOffDashboard';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard';
import PayrollDashboard from './pages/payroll/PayrollDashboard';
import PayRunFlow from './pages/payroll/PayRunFlow';
import Payslips from './pages/payroll/Payslips';
import Reports from './pages/Reports';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import UserManagementPage from './pages/UserManagementPage';
import ContractListPage from './pages/ContractListPage';
import SalaryStructuresListPage from './pages/SalaryStructuresListPage';
import TimeOffAllocationsPage from './pages/TimeOffAllocationsPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
      
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Workforce & HR */}
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="contracts" element={<ContractListPage />} />
          <Route path="users" element={<UserManagementPage />} />
          
          {/* Attendance & Time Off */}
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="time-off" element={<TimeOffDashboard />} />
          <Route path="time-off/allocations" element={<TimeOffAllocationsPage />} />
          
          {/* Payroll & Finance */}
          <Route path="payroll" element={<PayrollDashboard />} />
          <Route path="payroll/run" element={<PayRunFlow />} />
          <Route path="payroll/structures" element={<SalaryStructuresListPage />} />
          <Route path="payslips" element={<Payslips />} />
          
          {/* Admin & System */}
          <Route path="reports" element={<Reports />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;
