import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authReady: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  googleLogin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sword_auth_user';
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

function saveStoredUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // noop
  }
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const stored = loadStoredUser();
    if (stored) {
      setUserState(stored);
    }
    setAuthReady(true);
  }, []);

  // Debug: log user changes
  useEffect(() => {
    console.log('[Auth] User updated:', user);
  }, [user]);

  // IMPORTANT: No useCallback — direct function to avoid stale closure
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    saveStoredUser(newUser);
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const input = username.trim();
      const pass = password.trim();

      if (!input || !pass) return false;

      // Admin login
      if (input === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        setUser(ADMIN_USER);
        return true;
      }

      // Admin email login
      if (input.toLowerCase() === 'admin@sword.com' && pass === ADMIN_PASSWORD) {
        setUser(ADMIN_USER);
        return true;
      }

      // Customer login: any email + 6+ char password
      if (pass.length >= 6) {
        const namePart = input.split('@')[0];
        const displayName = namePart
          .split(/[._-]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const customer: User = {
          id: `user-${Date.now()}`,
          name: displayName || 'Customer',
          email: input.includes('@') ? input.toLowerCase() : `${input}@sword.com`,
          phone: '',
          role: 'customer',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Customer')}&background=1a365d&color=fff&size=128`,
        };

        setUser(customer);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Google Sign-In (demo)
  const googleLogin = (): boolean => {
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
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      authReady,
      login,
      logout,
      setUser,
      googleLogin,
    }),
    [user, authReady]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
