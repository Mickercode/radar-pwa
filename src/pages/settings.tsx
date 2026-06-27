import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { usePwaInstall } from '../lib/usePwaInstall';
import { useAuth, updateName, updatePassword, deleteAccount } from '../lib/auth';

const INTEREST_LABELS: Record<string, string> = {
  tech: 'Tech', business: 'Business', finance: 'Finance', politics: 'Politics',
  science: 'Science', health: 'Health', climate: 'Climate', sports: 'Sports',
  music: 'Music', film: 'Film & TV', education: 'Education', fashion: 'Fashion',
  travel: 'Travel & Lifestyle', faith: 'Faith & Philosophy',
};

type Section = null | 'name' | 'password' | 'delete';

export function SettingsPage() {
  const navigate = useNavigate();
  const { canInstall, install, isIOS, isStandalone, isInstalled } = usePwaInstall();
  const { user, interests, setAuth, clearAuth } = useAuth();

  const [section, setSection] = useState<Section>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // name
  const [newName, setNewName] = useState(user?.name ?? '');
  // password
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  // delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState('');

  function openSection(s: Section) {
    setSection(s);
    setError('');
    setSuccess('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setDeleteConfirm('');
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = newName.trim();
    if (!trimmed) { setError('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const res = await updateName(trimmed);
      // Refresh user in store — token unchanged
      const { token } = useAuth.getState();
      if (token) setAuth(token, res.user);
      setSuccess('Name updated!');
      setTimeout(() => { setSection(null); setSuccess(''); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update name');
    } finally { setLoading(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!currentPw) { setError('Enter your current password'); return; }
    if (newPw.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await updatePassword(currentPw, newPw);
      setSuccess('Password changed!');
      setTimeout(() => { setSection(null); setSuccess(''); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change password');
    } finally { setLoading(false); }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (deleteConfirm !== 'DELETE') { setError('Type DELETE to confirm'); return; }
    setLoading(true);
    try {
      await deleteAccount();
      clearAuth();
      navigate('/login', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete account');
    } finally { setLoading(false); }
  }

  return (
    <div className="container">
      <div className="page-head">
        <div className="page-kicker">Preferences</div>
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Install CTA */}
      {!isStandalone && !isInstalled && (
        <div className="install-card">
          <div className="install-card__icon"><Icon name="download" size={28} /></div>
          <div className="install-card__text">
            <h3>Install Radar</h3>
            <p>Add to your home screen for a faster, app-like experience — works offline too.</p>
          </div>
          {isIOS ? (
            <div className="install-card__ios">
              <span>Tap</span><Icon name="clip" size={16} />
              <span>Share → <strong>Add to Home Screen</strong></span>
            </div>
          ) : canInstall ? (
            <button className="install-card__btn" onClick={install}>
              <Icon name="download" size={18} />Install Radar
            </button>
          ) : (
            <p className="install-card__hint">Open your browser menu and tap <strong>Add to Home Screen</strong></p>
          )}
        </div>
      )}

      {/* ── Account section (only if logged in) ── */}
      {user && (
        <div className="settings-section">
          <p className="settings-section-label">Account</p>

          {/* ── Edit Name ── */}
          <div className="settings-row" onClick={() => section === 'name' ? openSection(null) : openSection('name')}>
            <div className="settings-row__icon"><Icon name="user" size={18} /></div>
            <div className="settings-row__body">
              <span className="settings-row__label">Display Name</span>
              <span className="settings-row__value">{user.name ?? 'Not set'}</span>
            </div>
            <Icon name={section === 'name' ? 'down' : 'right'} size={16} />
          </div>

          {section === 'name' && (
            <form className="settings-panel" onSubmit={handleSaveName}>
              <input
                className="auth-input"
                type="text"
                placeholder="Your name"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(''); }}
                autoFocus
                maxLength={100}
              />
              {error   && <p className="auth-error">{error}</p>}
              {success && <p className="auth-success">{success}</p>}
              <div className="settings-panel__row">
                <button className="btn btn--ghost" type="button" onClick={() => openSection(null)}>Cancel</button>
                <button className="btn btn--primary" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* ── Change Password ── */}
          <div className="settings-row" onClick={() => section === 'password' ? openSection(null) : openSection('password')}>
            <div className="settings-row__icon"><Icon name="lock" size={18} /></div>
            <div className="settings-row__body">
              <span className="settings-row__label">Change Password</span>
              <span className="settings-row__value">••••••••</span>
            </div>
            <Icon name={section === 'password' ? 'down' : 'right'} size={16} />
          </div>

          {section === 'password' && (
            <form className="settings-panel" onSubmit={handleChangePassword}>
              <input
                className="auth-input"
                type="password"
                placeholder="Current password"
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setError(''); }}
                autoComplete="current-password"
                autoFocus
              />
              <input
                className="auth-input"
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setError(''); }}
                autoComplete="new-password"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setError(''); }}
                autoComplete="new-password"
              />
              {error   && <p className="auth-error">{error}</p>}
              {success && <p className="auth-success">{success}</p>}
              <div className="settings-panel__row">
                <button className="btn btn--ghost" type="button" onClick={() => openSection(null)}>Cancel</button>
                <button className="btn btn--primary" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Update'}
                </button>
              </div>
            </form>
          )}

          {/* ── Edit Interests ── */}
          <div className="settings-row" onClick={() => navigate('/onboarding')}>
            <div className="settings-row__icon"><Icon name="spark" size={18} /></div>
            <div className="settings-row__body">
              <span className="settings-row__label">Interests</span>
              <span className="settings-row__value">
                {interests.length > 0
                  ? interests.slice(0, 3).map(i => INTEREST_LABELS[i] ?? i).join(', ') + (interests.length > 3 ? ` +${interests.length - 3}` : '')
                  : 'Not set — tap to personalise'}
              </span>
            </div>
            <Icon name="right" size={16} />
          </div>

          {/* ── Delete Account ── */}
          <div className="settings-row settings-row--danger" onClick={() => section === 'delete' ? openSection(null) : openSection('delete')}>
            <div className="settings-row__icon"><Icon name="trash" size={18} /></div>
            <div className="settings-row__body">
              <span className="settings-row__label">Delete Account</span>
              <span className="settings-row__value">Permanent — cannot be undone</span>
            </div>
            <Icon name={section === 'delete' ? 'down' : 'right'} size={16} />
          </div>

          {section === 'delete' && (
            <form className="settings-panel settings-panel--danger" onSubmit={handleDeleteAccount}>
              <p className="settings-panel__warn">
                This will permanently delete your account and all your saved data. This cannot be undone.
              </p>
              <input
                className="auth-input auth-input--danger"
                type="text"
                placeholder='Type DELETE to confirm'
                value={deleteConfirm}
                onChange={(e) => { setDeleteConfirm(e.target.value); setError(''); }}
                autoFocus
              />
              {error && <p className="auth-error">{error}</p>}
              <div className="settings-panel__row">
                <button className="btn btn--ghost" type="button" onClick={() => openSection(null)}>Cancel</button>
                <button className="btn btn--danger" type="submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Delete Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── App section ── */}
      <div className="settings-section">
        <p className="settings-section-label">App</p>
        <div className="settings-row">
          <div className="settings-row__icon"><Icon name="radar" size={18} /></div>
          <div className="settings-row__body">
            <span className="settings-row__label">Version</span>
            <span className="settings-row__value">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
