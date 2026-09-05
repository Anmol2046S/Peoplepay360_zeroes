import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Role = 'HR' | 'EMPLOYEE';

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
    return (saved as Role) || 'HR';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    let parsed = saved ? JSON.parse(saved) : null;
    const token = localStorage.getItem('token');
    if (token && (!parsed || !parsed.id)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        parsed = { ...(parsed || {}), id: payload.id, email: parsed?.email || payload.email };
      } catch (e) {}
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
          } catch (e) {}
        }
        const userObj = { ...data.user, id: userId };

        localStorage.setItem('token', data.token);
        localStorage.setItem('demo_role', selectedRole);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setRoleState(selectedRole);
        setUser(userObj);
        setIsLoggedIn(true);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_role');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  }, []);

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
