import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { updateName } from '../features/auth/authApi';
import { apiError } from '../lib/api';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';

// Screen 5.2 — Settings.
export default function Settings() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const signOut = useAuth((s) => s.signOut);
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  async function saveName() {
    if (!name.trim() || name === user?.name) return;
    setSaving(true);
    try {
      const updated = await updateName(name.trim());
      setUser(updated);
      toast('Name updated', 'check');
    } catch (e) {
      toast(apiError(e, 'Could not update name'), 'x');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rise" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        <span className="page-kicker">Settings</span>
      </div>

      <div className="section">
        <div className="section__label"><span className="dot" /> Account</div>
        <div className="field" style={{ marginBottom: '0.75rem' }}>
          <label className="label">Display name</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn btn--ghost" disabled={saving || name === user?.name} onClick={saveName}>Save</button>
          </div>
        </div>
        <button className="listrow" onClick={() => navigate('/settings/change-password')}>
          <div className="listrow__main"><div className="listrow__title">Change password</div></div>
          <Icon name="right" size={18} className="listrow__chev" />
        </button>
      </div>

      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--purple)' }} /> Content</div>
        <button className="listrow" onClick={() => navigate('/onboarding')}>
          <div className="listrow__main"><div className="listrow__title">Edit interests</div><div className="listrow__sub">Topics & content types</div></div>
          <Icon name="right" size={18} className="listrow__chev" />
        </button>
      </div>

      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> Appearance</div>
        <div className="listrow" style={{ cursor: 'default' }}>
          <div className="listrow__main"><div className="listrow__title">Theme</div></div>
          <span className="badge">Dark</span>
        </div>
      </div>

      <button className="btn btn--ghost btn--block" style={{ marginTop: '1.5rem' }} onClick={() => { signOut(); navigate('/sign-in', { replace: true }); }}>
        <Icon name="logout" size={18} /> Sign out
      </button>
      <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: '1rem' }}>
        Radar v1.0.0
      </p>
    </div>
  );
}
