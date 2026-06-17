import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../features/auth/AuthLayout';
import { signIn } from '../features/auth/authApi';
import { apiError } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function SignIn() {
  const navigate = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const completeOnboarding = useAuth((s) => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields');
    setLoading(true);
    setError('');
    try {
      const session = await signIn(email.trim(), password);
      setSession(session);
      completeOnboarding(); // a returning sign-in counts as onboarded
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiError(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth__form rise" onSubmit={handleSubmit} noValidate>
        <div>
          <h2 className="auth__title">Welcome back</h2>
          <p className="auth__switch">
            New here? <Link to="/sign-up">Create an account</Link>
          </p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="input-wrap">
            <input
              id="password"
              className="input"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="toggle" onClick={() => setShow((s) => !s)}>
              {show ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </div>

        <Link to="/forgot-password" className="auth__switch" style={{ alignSelf: 'flex-end', color: 'var(--cyan)' }}>
          Forgot password?
        </Link>

        <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  );
}
