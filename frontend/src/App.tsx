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
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Previously we had a mock polling interval here. Removed to avoid spam.
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
        
        {/* Employees */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        
        {/* Time */}
        <Route path="attendance" element={<AttendanceDashboard />} />
        <Route path="time-off" element={<TimeOffDashboard />} />
        
        {/* Payroll */}
        <Route path="payroll" element={<PayrollDashboard />} />
        <Route path="payroll/run" element={<PayRunFlow />} />
        <Route path="payslips" element={<Payslips />} />
        
        {/* Others */}
        <Route path="reports" element={<Reports />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    </NotificationProvider>
  );
}

export default App;
