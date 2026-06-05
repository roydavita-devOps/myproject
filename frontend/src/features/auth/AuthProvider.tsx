import { ReactNode, useMemo, useState } from 'react';
import { AuthUser } from '../../types/api';
import { clearAuthSession, getRefreshToken, getStoredUser, saveAuthSession } from '../../lib/storage';
import { authApi } from './auth.api';
import { AuthContext, AuthContextValue } from './auth.context';

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
        window.google?.accounts?.id.disableAutoSelect();
        clearAuthSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
