import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Role = 'ADMIN' | 'HR_MANAGER' | 'HR_PAYROLL_USER' | 'HR_PAYROLL_MANAGER' | 'EMPLOYEE';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  isLoggedIn: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('demo_role');
    return (saved as Role) || 'HR_MANAGER';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    let parsed = saved ? JSON.parse(saved) : null;
    const token = localStorage.getItem('token');
    if (token && (!parsed || !parsed.id)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        parsed = { ...(parsed || {}), id: payload.id, email: parsed?.email || payload.email };
      } catch (e) {
        console.warn('Could not decode stored JWT payload', e);
      }
    }
    return parsed;
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    localStorage.setItem('demo_role', role);
  }, [role]);


  const setRole = (newRole: Role) => setRoleState(newRole);

  const login = useCallback(async (selectedRole: Role) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/dev/token?role=${selectedRole}`);
      const data = await response.json();
      
      if (data.token) {
        let userId = data.user?.id;
        if (!userId) {
          try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            userId = payload.id;
          } catch (e) {
            console.warn('Could not decode JWT payload for userId', e);
          }
        }
        const userObj = { ...data.user, id: userId };

        localStorage.setItem('token', data.token);
        localStorage.setItem('demo_role', selectedRole);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setRoleState(selectedRole);
        setUser(userObj);
        setIsLoggedIn(true);
        return;
      }
    } catch (err) {
      console.error('Login backend fetch error, proceeding with demo fallback', err);
    }

    // Fallback demo session so login button never gets stuck
    const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdG9zdGhiMDAwMDJmczlrdXphemUzd2kiLCJvcmdJZCI6ImNtdG9zdGg2bTAwMDBmczlraDl2ZHN5amsiLCJlbWFpbCI6ImFkbWluQHRlY2hjb3JwLmNvbSIsInJvbGVJZCI6ImNtdG9zdGg3MTAwMDFmczlrZ2hhcHZ6bTEiLCJwZXJtaXNzaW9ucyI6WyJFTVBMT1lFRV9DUkVBVEUiLCJFTVBMT1lFRV9SRUFEIiwiRU1QTE9ZRUVfVVBEQVRFIiwiQ09OVFJBQ1RfQ1JFQVRFIiwiQ09OVFJBQ1RfUkVBRCIsIkFUVEVOREFOQ0VfQ1JFQVRFIiwiQVRURU5EQU5DRV9SRUFEIiwiQVRURU5EQU5DRV9VUERBVEUiLCJUSU1FT0ZGX1JFUVVFU1QiLCJUSU1FT0ZGX0FQUFJPVkUiLCJQQVlSVU5fQ0FMQ1VMQVRFIiwiUEFZUlVOX1JFQUQiLCJQQVlSVU5fQVBQUk9WRSIsIlJFUE9SVF9WSUVXIl0sImlhdCI6MTc4ODYzODIyNSwiZXhwIjoxNzg4NzI0NjI1fQ.8UTOD7BPtfEex2jubwVEW2X4ipQSUWRi9wD8354wmcE';
    
    const roleNames: Record<Role, string> = {
      ADMIN: 'System Admin',
      HR_MANAGER: 'HR Manager',
      HR_PAYROLL_USER: 'HR Payroll User',
      HR_PAYROLL_MANAGER: 'HR Payroll Manager',
      EMPLOYEE: 'Employee',
    };

    const roleEmails: Record<Role, string> = {
      ADMIN: 'admin@techcorp.com',
      HR_MANAGER: 'hrmanager@techcorp.com',
      HR_PAYROLL_USER: 'payrolluser@techcorp.com',
      HR_PAYROLL_MANAGER: 'payrollmgr@techcorp.com',
      EMPLOYEE: 'employee@techcorp.com',
    };

    const demoUser = {
      id: 'cmtosthb00002fs9kuzaze3wi',
      email: roleEmails[selectedRole] || 'user@techcorp.com',
      name: roleNames[selectedRole] || 'User',
    };

    localStorage.setItem('token', demoToken);
    localStorage.setItem('demo_role', selectedRole);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setRoleState(selectedRole);
    setUser(demoUser);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_role');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // Listen for the auth:logout event dispatched by the axios 401 interceptor
  // This allows the SPA router (not window.location.href) to handle the redirect
  useEffect(() => {
    const handleForceLogout = () => logout();
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ role, setRole, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
