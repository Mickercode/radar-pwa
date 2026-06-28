import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Wraps routes that require a valid JWT. Shows nothing until hydrated. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token    = useAuth(s => s.token);
  const hydrated = useAuth(s => s.hydrated);
  const location = useLocation();

  // Don't redirect until zustand has rehydrated from localStorage
  if (!hydrated) return null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
