import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, getMe } from './lib/auth';
import { syncSavedFromBE } from './lib/saved';
import { registerPush } from './lib/push';
import { AudioPlayerProvider } from './components/AudioPlayer';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { FeedPage } from './pages/feed';
import { ClipsPage } from './pages/clips';
import { PodcastsPage } from './pages/podcasts';
import { CapturePage } from './pages/capture';
import { BrainPage } from './pages/brain';
import { NotebookPage } from './pages/notebook';
import { KnowledgePage } from './pages/knowledge';
import { ProfilePage } from './pages/profile';
import { SettingsPage } from './pages/settings';
import { LoginPage } from './pages/login';
import { ResetPasswordPage } from './pages/reset-password';
import { OnboardingPage } from './pages/onboarding';
import { NotFoundPage } from './pages/not-found';
import { AdminPage } from './pages/admin';
import { RequireAdmin } from './components/RequireAdmin';

/** Syncs BE data on login and re-registers push if permission already granted. */
function SyncOnLogin() {
  const { token, setPrefs } = useAuth();
  useEffect(() => {
    if (!token) return;
    syncSavedFromBE();
    getMe().then((res) => setPrefs(res.preferences)).catch(() => {});
    if ('Notification' in window && Notification.permission === 'granted') {
      registerPush().catch(() => {});
    }
  }, [token]);
  return null;
}

/**
 * Redirect already-authenticated users away from /login.
 * Sends them to the page they originally wanted, or / by default.
 */
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const token    = useAuth(s => s.token);
  const hydrated = useAuth(s => s.hydrated);
  const location = useLocation();

  if (!hydrated) return null; // wait for rehydration

  if (token) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AudioPlayerProvider>
      <BrowserRouter>
        <SyncOnLogin />
        <Routes>
          {/* ── Public pages ── */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Onboarding (auth required but outside AppShell) ── */}
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingPage />
              </RequireAuth>
            }
          />

          {/* ── Authenticated app ── */}
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<FeedPage />} />
            <Route path="clips"     element={<ClipsPage />} />
            <Route path="podcasts"  element={<PodcastsPage />} />
            <Route path="capture"   element={<CapturePage />} />
            <Route path="brain"     element={<BrainPage />} />
            <Route path="notebook"  element={<NotebookPage />} />
            <Route path="saved"     element={<KnowledgePage />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route path="settings"  element={<SettingsPage />} />
            <Route path="admin"     element={<RequireAdmin><AdminPage /></RequireAdmin>} />
            <Route path="*"         element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AudioPlayerProvider>
  );
}
