import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Role = 'ADMIN' | 'HR_MANAGER' | 'HR_PAYROLL_USER' | 'HR_PAYROLL_MANAGER' | 'EMPLOYEE';

interface User {
  id: string;
  employeeId?: string | null;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
  roleName?: string;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  isLoggedIn: boolean;
  login: (role: Role, credentials?: { email: string; password: string }) => Promise<void>;
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
            parsed = {
              ...(parsed || {}),
              id: payload.id,
              email: parsed?.email || payload.email,
              employeeId: parsed?.employeeId || payload.employeeId || null,
            };
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

  const login = useCallback(async (selectedRole: Role, credentials?: { email: string; password: string }) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/v1`;
      const response = credentials
        ? await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })
        : await fetch(`${apiUrl}/dev/token?role=${selectedRole}`);
      const data = await response.json();
      
      const token = data.token || data.data?.token;
      const responseUser = data.user || data.data?.user;
      if (response.ok && token) {
        let userId = responseUser?.id;
        if (!userId) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id;
          } catch (e) {
            console.warn('Could not decode JWT payload for userId', e);
          }
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = {
          ...responseUser,
          id: userId,
          employeeId: responseUser?.employeeId || payload.employeeId || null,
          roleName: responseUser?.roleName || payload.role || selectedRole,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('demo_role', selectedRole);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setRoleState((userObj.role === 'SUPER_ADMIN' ? 'ADMIN' : userObj.role || selectedRole) as Role);
        setUser(userObj);
        setIsLoggedIn(true);
        return;
      }
    } catch (err) {
      console.error('Login backend fetch error', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('demo_role');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    throw new Error('Unable to sign in. Check the backend and credentials.');
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
