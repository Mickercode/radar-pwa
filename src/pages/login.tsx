import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth, login, signup, forgotPassword } from '../lib/auth';

type Mode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, [mode]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setSuccess('');
    setPassword('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) { setError('Enter your email address'); return; }

    // ── Forgot password ──────────────────────────
    if (mode === 'forgot') {
      setLoading(true);
      try {
        await forgotPassword(trimmedEmail);
        setSuccess(`Reset link sent to ${trimmedEmail}. Check your inbox.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Login / Signup ───────────────────────────
    if (!password) { setError('Enter your password'); return; }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login(trimmedEmail, password)
        : await signup(trimmedEmail, password, name.trim() || undefined);
      setAuth(res.token, res.user);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, mode, setAuth, navigate]);

  if (user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-logo">
            <img src="/assets/logo-icon.jpeg" alt="Radar" width={64} height={64} />
          </div>
          <h1 className="auth-title">Radar</h1>
          <p className="auth-sub">Understand once. Remember forever.</p>
        </div>

        {/* Tab toggle — only sign in / create account */}
        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === 'login' ? ' auth-tab--active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab${mode === 'signup' ? ' auth-tab--active' : ''}`}
              onClick={() => switchMode('signup')}
              type="button"
            >
              Create Account
            </button>
          </div>
        )}

        {/* Forgot password header */}
        {mode === 'forgot' && (
          <div className="auth-forgot-head">
            <button className="icon-btn" onClick={() => switchMode('login')} type="button" aria-label="Back">
              <Icon name="left" size={18} />
            </button>
            <span className="auth-forgot-title">Reset Password</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name" className="auth-label">Name (optional)</label>
              <input
                id="auth-name"
                className="auth-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={100}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-label">Email</label>
            <input
              ref={emailRef}
              id="auth-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess(''); }}
              autoComplete="email"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password" className="auth-label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-link auth-forgot-link"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>
          )}

          {mode === 'forgot' && (
            <p className="auth-forgot-hint">
              Enter your email and we'll send you a link to reset your password.
            </p>
          )}

          {error   && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button
            className="btn btn--primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              <><Icon name="right" size={18} /> Sign In</>
            ) : mode === 'signup' ? (
              <><Icon name="spark" size={18} /> Create Account</>
            ) : (
              <>Send Reset Link</>
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <p className="auth-footnote">
            {mode === 'login' ? (
              <>Don't have an account?{' '}<button className="auth-link" onClick={() => switchMode('signup')} type="button">Sign up</button></>
            ) : (
              <>Already have an account?{' '}<button className="auth-link" onClick={() => switchMode('login')} type="button">Sign in</button></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
