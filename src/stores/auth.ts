import { create } from 'zustand';
import type { AuthUser, Session } from '../lib/types';
import {
  clearSession,
  getStoredUser,
  getToken,
  isTokenExpired,
  persistSession,
  updateStoredUser,
} from '../lib/token';

const ONBOARDING_KEY = 'radar_onboarding';

type Status = 'loading' | 'authed' | 'anon';

interface AuthState {
  user: AuthUser | null;
  status: Status;
  hasCompletedOnboarding: boolean;

  hydrate: () => void;
  setSession: (session: Session) => void;
  setUser: (user: AuthUser) => void;
  completeOnboarding: () => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  hasCompletedOnboarding: localStorage.getItem(ONBOARDING_KEY) === 'true',

  // Restore session from localStorage on app launch.
  hydrate: () => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user && !isTokenExpired(token)) {
      set({ user, status: 'authed' });
    } else {
      clearSession();
      set({ user: null, status: 'anon' });
    }
  },

  setSession: (session) => {
    persistSession(session.token, session.user);
    set({ user: session.user, status: 'authed' });
  },

  setUser: (user) => {
    updateStoredUser(user);
    set({ user });
  },

  completeOnboarding: () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },

  signOut: () => {
    clearSession();
    localStorage.removeItem(ONBOARDING_KEY);
    set({ user: null, status: 'anon', hasCompletedOnboarding: false });
  },
}));
