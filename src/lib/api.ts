import axios, { AxiosError } from 'axios';
import { clearSession, getToken } from './token';

// Single axios client to radar-backend. The interceptor attaches the JWT to
// every request; the backend derives the user from it (no user ids in calls).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the backend rejects our token (expired, or a stale token from a different
// environment), drop the session and send the user to sign-in. Guarded so a
// failed login on the auth screens doesn't trigger a redirect loop.
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !location.pathname.startsWith('/sign')) {
      clearSession();
      location.href = '/sign-in';
    }
    return Promise.reject(error);
  },
);

/** Pull the backend's `{ error }` message out of an axios error for the UI. */
export function apiError(e: unknown, fallback = 'Something went wrong.'): string {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { error?: string } | undefined)?.error;
    if (msg) return msg;
    if (e.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection.';
  }
  return fallback;
}

/** True if the error is a 404 (used to turn "not found" into null). */
export function isNotFound(e: unknown): boolean {
  return e instanceof AxiosError && e.response?.status === 404;
}
