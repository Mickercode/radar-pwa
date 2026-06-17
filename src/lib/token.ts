// In-browser holder for the auth JWT + cached user. Lives in its own module so
// the axios interceptor can read the token synchronously without importing the
// React store (avoids a circular dependency).

const TOKEN_KEY = 'radar_token';
const USER_KEY = 'radar_user';

import type { AuthUser } from './types';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function persistSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Decode a JWT's `exp` and check expiry (60s skew). No verification — display only. */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof json?.exp !== 'number') return true;
    return Date.now() / 1000 >= json.exp - 60;
  } catch {
    return true;
  }
}
