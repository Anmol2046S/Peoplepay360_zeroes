import { useAuth } from '../contexts/AuthContext';
import HRDashboard from './HRDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import PayrollDashboard from './payroll/PayrollDashboard';

const Dashboard = () => {
  const { role } = useAuth();

  if (role === 'EMPLOYEE' || role === 'HR_PAYROLL_USER') {
    return <EmployeeDashboard />;
  }

  if (role === 'HR_PAYROLL_MANAGER') {
    return <PayrollDashboard />;
  }

  return <HRDashboard />;
};

export default Dashboard;
