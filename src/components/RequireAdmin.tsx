import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Wraps routes that require admin access. Non-admins are silently redirected to /. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin  = useAuth(s => s.isAdmin);
  const hydrated = useAuth(s => s.hydrated);

  if (!hydrated) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
