import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, phone: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Priyank Joshi',
  email: 'priyank@sword.com',
  phone: '+91 98765 43210',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  const login = useCallback((email: string, password: string) => {
    if (email && password.length >= 6) {
      setUser(MOCK_USER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback((name: string, email: string, phone: string, password: string) => {
    if (name && email && phone && password.length >= 6) {
      setUser({
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        role: 'customer',
      });
      return true;
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isAdmin,
      login,
      logout,
      register,
    }),
    [isAuthenticated, user, isAdmin, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
