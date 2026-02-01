import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Admin } from '../types';
import { getMe } from '../api/auth';

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const adminData = await getMe();
          setAdmin(adminData);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const setAuth = (newToken: string, newAdmin: Admin) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
