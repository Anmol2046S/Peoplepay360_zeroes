import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { SystemRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: SystemRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <span style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>Loading PeoplePay360...</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
