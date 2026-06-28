import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../lib/auth';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset link. Please request a new one.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <img src="/assets/logo-wide.jpeg" alt="Radar" className="auth-logo-img" />
          <p className="auth-sub">Choose a new password</p>
        </div>

        {success ? (
          <div className="auth-form">
            <p className="auth-success" style={{ marginBottom: '20px' }}>
              Password updated! You can now sign in with your new password.
            </p>
            <button
              className="btn btn--primary auth-submit"
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="rp-password" className="auth-label">New Password</label>
              <input
                id="rp-password"
                className="auth-input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="new-password"
                disabled={!token}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="rp-confirm" className="auth-label">Confirm Password</label>
              <input
                id="rp-confirm"
                className="auth-input"
                type="password"
                placeholder="Same password again"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                autoComplete="new-password"
                disabled={!token}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="btn btn--primary auth-submit"
              type="submit"
              disabled={loading || !token}
            >
              {loading ? <span className="auth-spinner" /> : 'Reset Password'}
            </button>

            <p className="auth-footnote">
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate('/login', { replace: true })}
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
