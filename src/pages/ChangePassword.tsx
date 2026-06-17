import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../features/auth/authApi';
import { apiError } from '../lib/api';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';

// Screen 5.3 — Change password. (Backend /auth/password takes the new password;
// it doesn't require the current one — see BACKEND_HANDOFF.md if re-auth is wanted.)
export default function ChangePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return setError('Password must be at least 6 characters');
    if (pw !== confirm) return setError('Passwords don’t match');
    setError('');
    setSaving(true);
    try {
      await changePassword(pw);
      toast('Password changed', 'check');
      navigate(-1);
    } catch (e) {
      setError(apiError(e, 'Could not change password'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rise" style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        <span className="page-kicker">Change password</span>
      </div>

      <form onSubmit={submit} className="stack">
        {error && <div className="alert alert--error">{error}</div>}
        <div className="field">
          <label className="label">New password</label>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label className="label">Confirm new password</label>
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <button className="btn btn--primary btn--block" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
