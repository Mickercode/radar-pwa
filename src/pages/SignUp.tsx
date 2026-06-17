import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../features/auth/AuthLayout';
import { signUp } from '../features/auth/authApi';
import { apiError } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function SignUp() {
  const navigate = useNavigate();
  const setSession = useAuth((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please fill in all fields');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      const session = await signUp(email.trim(), password, name.trim());
      setSession(session);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(apiError(err, 'Could not create account.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth__form rise" onSubmit={handleSubmit} noValidate>
        <div>
          <h2 className="auth__title">Create your brain</h2>
          <p className="auth__switch">
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="field">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="toggle" onClick={() => setShow((s) => !s)}>
              {show ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </div>

        <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
