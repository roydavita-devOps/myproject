import { AuthResponse } from '../../types/api';
import { http } from '../../lib/api/http';

export type RegisterPayload = {
  businessName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
  businessType: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  tenantSlug?: string;
};

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await http.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  async logout(refreshToken: string) {
    const { data } = await http.post<{ success: boolean }>('/auth/logout', { refreshToken });
    return data;
  },
  async forgotPassword(email: string) {
    const { data } = await http.post<{ success: boolean }>('/auth/forgot-password', { email });
    return data;
  },
};
