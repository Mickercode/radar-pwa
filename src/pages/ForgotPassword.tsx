import { Link } from 'react-router-dom';
import { AuthLayout } from '../features/auth/AuthLayout';

// Backend has no password-reset email flow yet (see BACKEND_HANDOFF.md).
// Honest placeholder rather than a broken form.
export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="auth__form rise">
        <h2 className="auth__title">Reset password</h2>
        <p className="prose">
          Self-service password reset isn’t available yet. Reach out to support and we’ll help you
          regain access to your account.
        </p>
        <Link to="/sign-in" className="btn btn--ghost btn--block">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
