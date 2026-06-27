// Auth state management for Radar PWA.
// JWT is stored in localStorage and loaded into a zustand store.
// The api module reads the token from this store to set the Authorization header.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** Hydrated from localStorage on app boot — starts false, becomes true after rehydrate. */
  hydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setAuth: (token, user) => set({ token, user, hydrated: true }),
      clearAuth: () => set({ token: null, user: null, hydrated: true }),
    }),
    {
      name: 'radar:auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Mark hydrated after rehydrate completes
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** Get the current auth token synchronously (for api.ts interceptor). */
export function getToken(): string | null {
  return useAuth.getState().token;
}

/** Clear auth state (for 401 interceptors and logout). */
export function clearAuth(): void {
  useAuth.getState().clearAuth();
}

// ── API helpers ─────────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Login failed (${res.status})`);
  }
  return res.json() as Promise<AuthResponse>;
}

export async function signup(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await fetch(BASE + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Signup failed (${res.status})`);
  }
  return res.json() as Promise<AuthResponse>;
}

export async function updateName(name: string): Promise<{ user: AuthUser }> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/name', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to update name (${res.status})`);
  return res.json() as Promise<{ user: AuthUser }>;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to update password (${res.status})`);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(BASE + '/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
}

export async function deleteAccount(): Promise<void> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/account', {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to delete account (${res.status})`);
}
