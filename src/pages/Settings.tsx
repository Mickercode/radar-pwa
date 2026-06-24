import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../stores/auth';
import { updateName, deleteAccount } from '../features/auth/authApi';
import { fetchPreferences } from '../features/account/preferencesApi';
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
  const { data: prefs } = useQuery({
    queryKey: ['settings-prefs'],
    queryFn: fetchPreferences,
  });

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

  async function handleDeleteAccount() {
    if (!confirm('Are you sure? This permanently deletes your account and all data.')) return;
    try {
      await deleteAccount();
      signOut();
      navigate('/sign-in', { replace: true });
    } catch (e) {
      toast(apiError(e, 'Could not delete account'), 'x');
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
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flex: 'none',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem',
            background: 'linear-gradient(100deg, var(--cyan), var(--purple))',
            color: '#04141a',
          }}>
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{user?.name ?? 'Radar user'}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 'var(--step--1)' }}>{user?.email}</div>
          </div>
        </div>
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
          <div className="listrow__main">
            <div className="listrow__title">Edit interests</div>
            <div className="listrow__sub">
              {prefs?.topic_ids?.length
                ? `${prefs.topic_ids.length} topics selected · ${prefs.content_types?.length ?? 0} content types`
                : 'Topics & content types'}
            </div>
          </div>
          <Icon name="right" size={18} className="listrow__chev" />
        </button>
        {prefs?.preferred_country && (
          <div className="listrow" style={{ cursor: 'default' }}>
            <div className="listrow__main">
              <div className="listrow__title">Country preference</div>
            </div>
            <span className="badge">{prefs.preferred_country === 'NG' ? 'Nigeria' : prefs.preferred_country === 'AFRICA' ? 'Africa' : 'World'}</span>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> Appearance</div>
        <div className="listrow" style={{ cursor: 'default' }}>
          <div className="listrow__main"><div className="listrow__title">Theme</div></div>
          <span className="badge">Dark</span>
        </div>
      </div>

      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--coral)' }} /> Danger zone</div>
        <button className="btn btn--ghost btn--block" style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }} onClick={handleDeleteAccount}>
          <Icon name="trash" size={18} /> Delete account
        </button>
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
