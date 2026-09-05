import { useAuth } from '../contexts/AuthContext';
import HRDashboard from './HRDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const { role } = useAuth();

  if (role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  return <HRDashboard />;
};

export default Dashboard;
