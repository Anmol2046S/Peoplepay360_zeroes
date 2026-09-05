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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<DashboardLayout />}>
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
      </Route>
    </Routes>
  );
}

export default App;
