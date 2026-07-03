import { AuthResponse, AuthSession } from '../../types/api';
import { http } from '../../lib/api/http';

export type RegisterPayload = {
  businessName: string;
  slug?: string;
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

export type GoogleRegisterPayload = {
  idToken: string;
  businessName: string;
  slug?: string;
  businessType: string;
};

export type GoogleLoginPayload = {
  idToken: string;
  tenantSlug?: string;
};

export type CompleteOnboardingPayload = {
  businessName: string;
  slug: string;
  businessType: string;
  templateName?: string;
  themePreference?: string;
  colorPreset?: string;
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
  async googleRegister(payload: GoogleRegisterPayload) {
    const { data } = await http.post<AuthResponse>('/auth/google/register', payload);
    return data;
  },
  async googleLogin(payload: GoogleLoginPayload) {
    const { data } = await http.post<AuthResponse>('/auth/google/login', payload);
    return data;
  },
  async completeOnboarding(payload: CompleteOnboardingPayload) {
    const { data } = await http.post<AuthResponse>('/auth/onboarding/complete', payload);
    return data;
  },
  async logout(refreshToken: string) {
    const { data } = await http.post<{ success: boolean }>('/auth/logout', { refreshToken });
    return data;
  },
  async forgotPassword(email: string) {
    const { data } = await http.post<{ success: boolean; delivery?: string; token?: string }>('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(token: string, newPassword: string) {
    const { data } = await http.post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
    return data;
  },
  async verifyEmail(token: string) {
    const { data } = await http.post<{ success: boolean }>('/auth/verify-email', { token });
    return data;
  },
  async resendVerification() {
    const { data } = await http.post<{ success: boolean; delivery?: string; token?: string }>('/auth/resend-verification');
    return data;
  },
  async sessions() {
    const { data } = await http.get<AuthSession[]>('/auth/sessions');
    return data;
  },
  async revokeSession(sessionId: string) {
    const { data } = await http.delete<{ success: boolean }>(`/auth/sessions/${sessionId}`);
    return data;
  },
};
