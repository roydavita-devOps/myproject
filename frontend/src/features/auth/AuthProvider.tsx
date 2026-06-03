import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { AuthResponse, AuthUser } from '../../types/api';
import { clearAuthSession, getRefreshToken, getStoredUser, saveAuthSession } from '../../lib/storage';
import { authApi } from './auth.api';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setSession(session) {
        saveAuthSession(session);
        setUser(session.user);
      },
      async logout() {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => undefined);
        }
        clearAuthSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
