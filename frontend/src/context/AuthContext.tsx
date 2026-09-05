import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, SystemRole } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: SystemRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('pp360_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pp360_token');
      const storedUser = localStorage.getItem('pp360_user');

      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          setToken(storedToken);
          localStorage.setItem('pp360_user', JSON.stringify(freshUser));
        } catch {
          // If server error or offline, fallback to cached user if parseable
          if (storedUser && storedUser !== 'undefined') {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed && parsed.id) {
                setUser(parsed);
                setToken(storedToken);
              } else {
                clearStorage();
              }
            } catch {
              clearStorage();
            }
          } else {
            clearStorage();
          }
        }
      } else {
        clearStorage();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('pp360_token');
    localStorage.removeItem('pp360_user');
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (!result || !result.token || !result.user) {
      throw new Error('Invalid login response payload from server.');
    }
    localStorage.setItem('pp360_token', result.token);
    localStorage.setItem('pp360_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    clearStorage();
    window.location.href = '/login';
  };

  const hasRole = (...roles: SystemRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user && !!token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
