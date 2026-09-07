/**
 * API client using axios.
 * Base URL comes from Vite env variable (VITE_API_URL).
 * JWT token is automatically injected into every request via an interceptor.
 */
import axios, { AxiosError } from 'axios';
import type {
  LoginRequest, RegisterRequest, AuthUser,
  GenerateRequest, GenerateResponse,
  DebugRequest, DebugResponse,
  ExplainRequest, ExplainResponse,
  HistoryResponse, StatsResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT if available ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    const user: AuthUser = JSON.parse(stored);
    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stale auth and redirect to login
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string })?.detail;
    return detail || error.message || 'An unexpected error occurred';
  }
  return String(error);
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  async register(data: RegisterRequest): Promise<AuthUser> {
    const res = await apiClient.post<AuthUser>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthUser> {
    const res = await apiClient.post<AuthUser>('/auth/login', data);
    return res.data;
  },
};

// ── Code Generation API ───────────────────────────────────────────────────────
export const generateApi = {
  async generate(data: GenerateRequest): Promise<GenerateResponse> {
    const res = await apiClient.post<GenerateResponse>('/api/generate', data);
    return res.data;
  },
};

// ── Debug API ─────────────────────────────────────────────────────────────────
export const debugApi = {
  async debug(data: DebugRequest): Promise<DebugResponse> {
    const res = await apiClient.post<DebugResponse>('/api/debug', data);
    return res.data;
  },
};

// ── Explain API ───────────────────────────────────────────────────────────────
export const explainApi = {
  async explain(data: ExplainRequest): Promise<ExplainResponse> {
    const res = await apiClient.post<ExplainResponse>('/api/explain', data);
    return res.data;
  },
};

// ── History API ───────────────────────────────────────────────────────────────
export const historyApi = {
  async getHistory(page = 1, pageSize = 10, sessionType?: string): Promise<HistoryResponse> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (sessionType) params.session_type = sessionType;
    const res = await apiClient.get<HistoryResponse>('/api/history', { params });
    return res.data;
  },

  async getSession(id: string) {
    const res = await apiClient.get(`/api/history/${id}`);
    return res.data;
  },

  async deleteSession(id: string): Promise<void> {
    await apiClient.delete(`/api/history/${id}`);
  },
};

// ── Stats API ─────────────────────────────────────────────────────────────────
export const statsApi = {
  async getStats(): Promise<StatsResponse> {
    const res = await apiClient.get<StatsResponse>('/api/stats');
    return res.data;
  },
};

export { getErrorMessage };
