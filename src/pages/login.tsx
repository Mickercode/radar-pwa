import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth, login, signup, forgotPassword, verifyOtp, resendOtp, getMe } from '../lib/auth';

type Mode = 'login' | 'signup' | 'otp' | 'forgot';

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
  const [otp, setOtp]           = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef   = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, [mode === 'login' || mode === 'signup' || mode === 'forgot' ? mode : null]);
  useEffect(() => { if (mode === 'otp') otpRef.current?.focus(); }, [mode]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setSuccess('');
    if (next !== 'otp') { setOtp(''); setPassword(''); }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmedEmail = email.trim().toLowerCase();

    // ── Forgot password ──
    if (mode === 'forgot') {
      if (!trimmedEmail) { setError('Enter your email address'); return; }
      setLoading(true);
      try {
        await forgotPassword(trimmedEmail);
        setSuccess(`Reset link sent to ${trimmedEmail}. Check your inbox.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally { setLoading(false); }
      return;
    }

    // ── OTP verification ──
    if (mode === 'otp') {
      const code = otp.trim();
      if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
      setLoading(true);
      try {
        const res = await verifyOtp(trimmedEmail, code);
        setAuth(res.token, res.user);
        // New account — fetch prefs then send to onboarding if not done yet
        try {
          const me = await getMe();
          navigate(me.preferences.onboardingDone ? '/' : '/onboarding', { replace: true });
        } catch {
          navigate('/onboarding', { replace: true });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid code');
      } finally { setLoading(false); }
      return;
    }

    // ── Login / Signup ──
    if (!trimmedEmail) { setError('Enter your email address'); return; }
    if (!password) { setError('Enter your password'); return; }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(trimmedEmail, password);
        setAuth(res.token, res.user);
        navigate('/', { replace: true });
      } else {
        await signup(trimmedEmail, password, name.trim() || undefined);
        setResendCooldown(60);
        switchMode('otp');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  }, [email, password, name, otp, mode, setAuth, navigate]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await resendOtp(email.trim().toLowerCase());
      setResendCooldown(60);
      setSuccess('New code sent!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend code');
    } finally { setLoading(false); }
  }, [email, resendCooldown]);

  if (user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-logo">
            <span className="auth-logo-mark">⚡</span>
          </div>
          <h1 className="auth-title">Radar</h1>
          <p className="auth-sub">Understand once. Remember forever.</p>
        </div>

        {/* Tab toggle */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === 'login' ? ' auth-tab--active' : ''}`}
              onClick={() => switchMode('login')} type="button"
            >Sign In</button>
            <button
              className={`auth-tab${mode === 'signup' ? ' auth-tab--active' : ''}`}
              onClick={() => switchMode('signup')} type="button"
            >Create Account</button>
          </div>
        )}

        {/* Forgot / back header */}
        {(mode === 'forgot' || mode === 'otp') && (
          <div className="auth-forgot-head">
            <button className="icon-btn"
              onClick={() => switchMode(mode === 'otp' ? 'signup' : 'login')}
              type="button" aria-label="Back">
              <Icon name="left" size={18} />
            </button>
            <span className="auth-forgot-title">
              {mode === 'otp' ? 'Verify Email' : 'Reset Password'}
            </span>
          </div>
        )}

        {/* ── OTP step ── */}
        {mode === 'otp' ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p className="auth-otp-hint">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to confirm your account.
            </p>

            <div className="auth-field">
              <label htmlFor="auth-otp" className="auth-label">Verification Code</label>
              <input
                ref={otpRef}
                id="auth-otp"
                className="auth-input auth-input--otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); setSuccess(''); }}
                autoComplete="one-time-code"
              />
            </div>

            {error   && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Confirm Code'}
            </button>

            <p className="auth-footnote">
              Didn't get it?{' '}
              <button
                type="button"
                className={`auth-link${resendCooldown > 0 ? ' auth-link--dim' : ''}`}
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </p>
          </form>
        ) : (
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
                    <button type="button" className="auth-link auth-forgot-link"
                      onClick={() => switchMode('forgot')}>
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

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
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
        )}

        {(mode === 'login' || mode === 'signup') && (
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
