import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3070/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request: attach Bearer token from Zustand store ───────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: unwrap { success, data, timestamp } envelope + handle 401 ───────
api.interceptors.response.use(
  (response) => {
    // Backend wraps all responses: { success: true, data: T, timestamp: string }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    // Bubble up a clean error message
    const message =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
