/**
 * useAuth hook — manages authentication state stored in localStorage.
 * Provides login, register, and logout actions consumed by all pages.
 */
import { useState, useCallback } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../services/api';

function getStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authApi.login(data);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authApi.register(data);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}
