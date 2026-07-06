import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth, login, signup, forgotPassword, verifyOtp, resendOtp, getMe, googleSignIn } from '../lib/auth';

type Mode = 'login' | 'signup' | 'otp' | 'forgot';

export function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, setAuth } = useAuth();

  // Where to go after a successful login
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

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

  // Google One Tap
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  useEffect(() => {
    if (!googleClientId) return;
    const existingScript = document.getElementById('google-gsi');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [googleClientId]);

  async function handleGoogleCredential(idToken: string) {
    setLoading(true);
    setError('');
    try {
      const res = await googleSignIn(idToken);
      setAuth(res.token, res.user);
      const dest = res.isNew ? '/onboarding' : from;
      navigate(dest, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally { setLoading(false); }
  }

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
          navigate(me.preferences.onboardingDone ? from : '/onboarding', { replace: true });
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
    if (mode === 'signup' && !name.trim()) { setError('Enter your name'); return; }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(trimmedEmail, password);
        setAuth(res.token, res.user);
        navigate(from, { replace: true });
      } else {
        await signup(trimmedEmail, password, name.trim());
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
          <div className="auth-logo-wrap">
            <img src="/assets/logo-icon.jpeg" alt="Radar icon" className="auth-logo-icon" />
          </div>
          <img src="/assets/logo-wide.jpeg" alt="Radar" className="auth-wordmark" />
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
                <label htmlFor="auth-name" className="auth-label">Name</label>
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
          <>
            {googleClientId && (
              <>
                <div className="auth-divider"><span>or</span></div>
                <GoogleSignInButton
                  clientId={googleClientId}
                  onCredential={handleGoogleCredential}
                  disabled={loading}
                />
              </>
            )}
            <p className="auth-footnote">
              {mode === 'login' ? (
                <>Don't have an account?{' '}<button className="auth-link" onClick={() => switchMode('signup')} type="button">Sign up</button></>
              ) : (
                <>Already have an account?{' '}<button className="auth-link" onClick={() => switchMode('login')} type="button">Sign in</button></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Google Sign-In Button component ─────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function GoogleSignInButton({
  clientId,
  onCredential,
  disabled,
}: {
  clientId: string;
  onCredential: (idToken: string) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function init() {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => { onCredential(response.credential); },
      });
      window.google.accounts.id.renderButton(ref.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: ref.current.offsetWidth || 320,
        text: 'continue_with',
        logo_alignment: 'center',
      });
    }

    if (window.google) { init(); return; }
    // Wait for the GSI script to load
    const script = document.getElementById('google-gsi');
    if (script) { script.addEventListener('load', init); return () => script.removeEventListener('load', init); }
  }, [clientId, onCredential]);

  return (
    <div
      ref={ref}
      className={`google-btn-wrap${disabled ? ' google-btn-wrap--disabled' : ''}`}
      aria-label="Continue with Google"
    />
  );
}
