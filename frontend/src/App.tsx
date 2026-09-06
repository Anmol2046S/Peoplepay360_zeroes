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
import Settings from './pages/Settings';
import UserManagementPage from './pages/UserManagementPage';
import ContractListPage from './pages/ContractListPage';
import SalaryStructuresListPage from './pages/SalaryStructuresListPage';
import TimeOffAllocationsPage from './pages/TimeOffAllocationsPage';
import { useAuth } from './contexts/AuthContext';
import { PeoplePay360AiWidget } from './components/PeoplePay360AiWidget';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ManagerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role === 'EMPLOYEE') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
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
          <Route path="employees" element={<ManagerOnlyRoute><EmployeeList /></ManagerOnlyRoute>} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="contracts" element={<ManagerOnlyRoute><ContractListPage /></ManagerOnlyRoute>} />
          <Route path="users" element={<AdminOnlyRoute><UserManagementPage /></AdminOnlyRoute>} />
          
          {/* Attendance & Time Off */}
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="time-off" element={<TimeOffDashboard />} />
          <Route path="time-off/allocations" element={<ManagerOnlyRoute><TimeOffAllocationsPage /></ManagerOnlyRoute>} />
          
          {/* Payroll & Finance */}
          <Route path="payroll" element={<ManagerOnlyRoute><PayrollDashboard /></ManagerOnlyRoute>} />
          <Route path="payroll/run" element={<ManagerOnlyRoute><PayRunFlow /></ManagerOnlyRoute>} />
          <Route path="payroll/structures" element={<ManagerOnlyRoute><SalaryStructuresListPage /></ManagerOnlyRoute>} />
          <Route path="payslips" element={<Payslips />} />
          
          {/* Admin & System */}
          <Route path="reports" element={<ManagerOnlyRoute><Reports /></ManagerOnlyRoute>} />
          <Route path="approvals" element={<Navigate to="/time-off" replace />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <PeoplePay360AiWidget />
    </NotificationProvider>
  );
}

export default App;
