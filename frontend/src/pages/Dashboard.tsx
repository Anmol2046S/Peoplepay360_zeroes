import { useAuth } from '../contexts/AuthContext';
import HRDashboard from './HRDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import PayrollDashboard from './payroll/PayrollDashboard';

const Dashboard = () => {
  const { role } = useAuth();

  if (role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  if (role === 'HR_PAYROLL_USER' || role === 'HR_PAYROLL_MANAGER') {
    return <PayrollDashboard />;
  }

  return <HRDashboard />;
};

export default Dashboard;
