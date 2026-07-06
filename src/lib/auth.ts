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
  isAdmin?: boolean;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  interests: string[];
  location: string | null;
  onboardingDone: boolean;
  /** Hydrated from localStorage on app boot — starts false, becomes true after rehydrate. */
  hydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setPrefs: (prefs: { interests: string[]; location: string | null; onboardingDone: boolean }) => void;
  setAdmin: (isAdmin: boolean) => void;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      interests: [],
      location: null,
      onboardingDone: false,
      hydrated: false,
      setAuth: (token, user) => set({ token, user, isAdmin: user.isAdmin ?? false, hydrated: true }),
      clearAuth: () => set({ token: null, user: null, isAdmin: false, interests: [], location: null, onboardingDone: false, hydrated: true }),
      setPrefs: (prefs) => set(prefs),
      setAdmin: (isAdmin) => set({ isAdmin }),
    }),
    {
      name: 'radar:auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAdmin: state.isAdmin,
        interests: state.interests,
        location: state.location,
        onboardingDone: state.onboardingDone,
      }),
      onRehydrateStorage: () => (state) => {
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

/** Initiates signup — returns `{ pendingEmail }`. Follow up with verifyOtp(). */
export async function signup(
  email: string,
  password: string,
  name?: string,
): Promise<{ pendingEmail: string }> {
  const res = await fetch(BASE + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(data.error ?? data.message ?? `Signup failed (${res.status})`);
  }
  return res.json() as Promise<{ pendingEmail: string }>;
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

export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  const res = await fetch(BASE + '/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(data.error ?? data.message ?? `Verification failed (${res.status})`);
  }
  return res.json() as Promise<AuthResponse>;
}

export async function resendOtp(email: string): Promise<void> {
  const res = await fetch(BASE + '/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `Resend failed (${res.status})`);
  }
}

export interface UserPreferences {
  interests: string[];
  location: string | null;
  onboardingDone: boolean;
}

export async function getStats(): Promise<{ saved: number; notes: number }> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/stats', {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
  return res.json() as Promise<{ saved: number; notes: number }>;
}

export async function getMe(): Promise<{ user: AuthUser; preferences: UserPreferences }> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/me', {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
  const data = await res.json() as { user: AuthUser; preferences: UserPreferences };
  // Sync isAdmin from server so DB changes take effect on next app open
  if (typeof data.user?.isAdmin === 'boolean') {
    useAuth.getState().setAdmin(data.user.isAdmin);
  }
  return data;
}

export async function updateInterests(
  interests: string[],
  location?: string,
  onboardingDone?: boolean,
): Promise<void> {
  const token = getToken();
  const res = await fetch(BASE + '/auth/interests', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ interests, location, onboardingDone }),
  });
  if (!res.ok) throw new Error(`Failed to update interests (${res.status})`);
}

/** Sign in with a Google id_token (from Google One Tap or GSI button). */
export async function googleSignIn(idToken: string): Promise<AuthResponse & { isNew?: boolean }> {
  const res = await fetch(BASE + '/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(data.error ?? data.message ?? `Google sign-in failed (${res.status})`);
  }
  return res.json() as Promise<AuthResponse & { isNew?: boolean }>;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(BASE + '/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(data.error ?? data.message ?? `Reset failed (${res.status})`);
  }
}
