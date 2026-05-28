import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { setToken, clearToken, isAuthenticated, getTokenPayload } from '../lib/auth';

interface AuthContextValue {
  loggedIn: boolean;
  rolId: number;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  const rolId = loggedIn
    ? parseInt(getTokenPayload()?.rol_id ?? '0', 10)
    : 0;

  const login = useCallback((token: string) => {
    setToken(token);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, rolId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
