import { createContext } from 'react';
import type { AuthResponse, AuthUser } from '../../types/api';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
