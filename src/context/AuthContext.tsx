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
  googleLogin: () => boolean;
  logout: () => void;
  register: (name: string, email: string, phone: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Admin credentials
const ADMIN_USERNAME = 'ohmnam';
const ADMIN_PASSWORD = '9769610205';

const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Priyank Joshi',
  email: 'priyank.joshi@swordhome.com',
  phone: '+91 95377 97597',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Priyank+Joshi&background=FFD700&color=000&size=128',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  const login = useCallback((email: string, password: string) => {
    const trimmedInput = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedInput || !trimmedPassword) {
      return false;
    }

    // Admin login: ohmnam / 9769610205
    if (trimmedInput === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
      setUser(ADMIN_USER);
      return true;
    }

    if (trimmedInput.toLowerCase() === 'admin@sword.com' && trimmedPassword === ADMIN_PASSWORD) {
      setUser(ADMIN_USER);
      return true;
    }

    // Customer login - any email + 6+ char password
    if (trimmedPassword.length < 6) {
      return false;
    }

    const namePart = trimmedInput.split('@')[0];
    const displayName = namePart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    setUser({
      id: `user-${Date.now()}`,
      name: displayName || 'Customer',
      email: trimmedInput.includes('@') ? trimmedInput.toLowerCase() : `${trimmedInput}@sword.com`,
      phone: '',
      role: 'customer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Customer')}&background=1a365d&color=fff&size=128`,
    });
    return true;
  }, []);

  // Google Sign-In - simulates Google OAuth flow
  // In production, replace with actual Firebase Auth or Google Identity Services
  const googleLogin = useCallback(() => {
    // Generate a demo Google user
    // In production: use Firebase Auth signInWithPopup or Google Identity Services
    const googleNames = ['Raj Patel', 'Anita Sharma', 'Vikram Mehta', 'Neha Gupta'];
    const randomName = googleNames[Math.floor(Math.random() * googleNames.length)];
    const emailSlug = randomName.toLowerCase().replace(' ', '.');

    setUser({
      id: `google-${Date.now()}`,
      name: randomName,
      email: `${emailSlug}@gmail.com`,
      phone: '',
      role: 'customer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=4285F4&color=fff&size=128`,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback((name: string, email: string, phone: string, password: string) => {
    if (!name || !email || !phone || !password || password.length < 6) {
      return false;
    }
    setUser({
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      phone,
      role: 'customer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a365d&color=fff&size=128`,
    });
    return true;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isAdmin,
      login,
      googleLogin,
      logout,
      register,
    }),
    [isAuthenticated, user, isAdmin, login, googleLogin, logout, register]
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
