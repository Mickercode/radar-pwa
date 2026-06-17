import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../stores/auth';

// Gate for protected routes. While the store is hydrating we render nothing
// (the splash handles first paint); once resolved we either show the app or
// bounce to sign-in.
export function RequireAuth() {
  const status = useAuth((s) => s.status);

  if (status === 'loading') return null;
  if (status === 'anon') return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}
