import { api } from '../../lib/api';
import type { AuthUser, Session } from '../../lib/types';
import { MOCK_AUTH, mockSession } from './mockAuth';

// Auth calls against radar-backend /auth/*. The store persists the returned
// token; the api interceptor attaches it to subsequent requests.
// When MOCK_AUTH is on (dev only), signup/login resolve locally instead.

export async function signUp(email: string, password: string, name?: string): Promise<Session> {
  if (MOCK_AUTH) return mockSession(email, name ?? null);
  const { data } = await api.post('/auth/signup', { email, password, name });
  return data as Session;
}

export async function signIn(email: string, password: string): Promise<Session> {
  if (MOCK_AUTH) return mockSession(email, email.split('@')[0] ?? 'Tester');
  const { data } = await api.post('/auth/login', { email, password });
  return data as Session;
}

export async function updateName(name: string): Promise<AuthUser> {
  const { data } = await api.patch('/auth/name', { name });
  return (data as { user: AuthUser }).user;
}

export async function changePassword(newPassword: string): Promise<void> {
  await api.patch('/auth/password', { newPassword });
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/auth/account');
}
