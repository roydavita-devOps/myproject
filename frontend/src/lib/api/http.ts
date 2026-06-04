import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '../../types/api';
import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from '../storage';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const http = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken });
      saveAuthSession(response.data);
      original.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return http(original);
    } catch (refreshError) {
      clearAuthSession();
      window.location.assign('/auth/login');
      return Promise.reject(refreshError);
    }
  },
);
