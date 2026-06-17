import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './stores/auth';
import { RequireAuth } from './app/RequireAuth';
import { AppShell } from './app/AppShell';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import ContentDetail from './pages/ContentDetail';
import Brain from './pages/Brain';
import InsightDetail from './pages/InsightDetail';
import Review from './pages/Review';
import Quiz from './pages/Quiz';
import Weekly from './pages/Weekly';
import Capture from './pages/Capture';
import Player from './pages/Player';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Subscription from './pages/Subscription';

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  const status = useAuth((s) => s.status);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (status === 'loading') return null;

  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Feed />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/brain" element={<Brain />} />
          <Route path="/insight/:id" element={<InsightDetail />} />
          <Route path="/review" element={<Review />} />
          <Route path="/quiz/:insightId" element={<Quiz />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/player" element={<Player />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/change-password" element={<ChangePassword />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
