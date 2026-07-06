import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getStats } from '../lib/auth';
import { getSavedItems } from '../lib/saved';
import { Icon } from '../components/Icon';

function getInitial(name: string | null, email: string): string {
  if (name?.trim()) return name.trim()[0]!.toUpperCase();
  return email[0]!.toUpperCase();
}

function getAvatarColor(str: string): string {
  const colors = ['#00c2cb', '#45d483', '#f2b441', '#fb7185', '#a78bfa', '#60a5fa'];
  let hash = 0;
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}

export function ProfilePage() {
  const navigate   = useNavigate();
  const hydrated   = useAuth((s) => s.hydrated);
  const user       = useAuth((s) => s.user);
  const clearAuth  = useAuth((s) => s.clearAuth);

  // Stats — start from local saved count, upgrade to BE counts when available
  const localSaved = getSavedItems();
  const [stats, setStats] = useState({ saved: localSaved.length, notes: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getStats()
      .then(s => { setStats(s); setStatsLoaded(true); })
      .catch(() => setStatsLoaded(true));
  }, [user]);

  // Derived from local saved (for insights / due counts)
  const totalInsights = localSaved.reduce((a, s) => a + s.keyTakeaways.length, 0);
  const dueForReview  = localSaved.filter(s => {
    const days = (Date.now() - new Date(s.savedAt).getTime()) / 86_400_000;
    return days >= 3;
  }).length;

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="profile-page">
        <div className="page-head">
          <div className="page-kicker">Account</div>
          <h1 className="page-title">You</h1>
        </div>
        <div className="profile-prompt">
          <div className="profile-prompt__icon"><Icon name="profile" size={40} /></div>
          <h3>Sign in to Radar</h3>
          <p>Sync your saved insights, capture articles, and personalise your feed across all devices.</p>
          <button className="btn btn--primary profile-prompt__btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <p className="profile-prompt__sub">
            No account?{' '}
            <button className="auth-link" onClick={() => navigate('/login')}>Create one free</button>
          </p>
        </div>
      </div>
    );
  }

  const initial = getInitial(user.name, user.email);
  const avatarColor = getAvatarColor(user.email);

  return (
    <div className="profile-page">
      <div className="page-head">
        <div className="page-kicker">Account</div>
        <h1 className="page-title">You</h1>
      </div>

      {/* User card */}
      <div className="profile-card">
        <div className="profile-avatar" style={{ background: avatarColor }}>
          {initial}
        </div>
        <div className="profile-card__info">
          <span className="profile-card__name">{user.name ?? 'Radar User'}</span>
          <span className="profile-card__email">{user.email}</span>
          <span className="profile-badge">FREE</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat__n">{statsLoaded ? stats.saved : localSaved.length}</span>
          <span className="profile-stat__l">Saved</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__n">{totalInsights}</span>
          <span className="profile-stat__l">Insights</span>
        </div>
        <button className="profile-stat profile-stat--link" onClick={() => navigate('/brain?tab=reminders')}>
          <span className="profile-stat__n profile-stat__n--cyan">{dueForReview}</span>
          <span className="profile-stat__l">Due →</span>
        </button>
        <div className="profile-stat">
          <span className="profile-stat__n">{stats.notes}</span>
          <span className="profile-stat__l">Notes</span>
        </div>
      </div>

      {/* Navigation rows */}
      <div className="profile-rows">
        <button className="profile-row" onClick={() => navigate('/brain')}>
          <div className="profile-row__icon"><Icon name="brain" size={20} /></div>
          <div className="profile-row__body">
            <span className="profile-row__label">Your Brain</span>
            <span className="profile-row__sub">{totalInsights} insights · {statsLoaded ? stats.saved : localSaved.length} saved</span>
          </div>
          <Icon name="right" size={18} />
        </button>

        <button className="profile-row" onClick={() => navigate('/notebook')}>
          <div className="profile-row__icon"><Icon name="notebook" size={20} /></div>
          <div className="profile-row__body">
            <span className="profile-row__label">Notebook</span>
            <span className="profile-row__sub">{stats.notes} note{stats.notes !== 1 ? 's' : ''}</span>
          </div>
          <Icon name="right" size={18} />
        </button>

        <button className="profile-row" onClick={() => navigate('/settings')}>
          <div className="profile-row__icon"><Icon name="settings" size={20} /></div>
          <div className="profile-row__body">
            <span className="profile-row__label">Settings</span>
          </div>
          <Icon name="right" size={18} />
        </button>

        <button className="profile-row profile-row--danger" onClick={() => { clearAuth(); navigate('/login', { replace: true }); }}>
          <div className="profile-row__icon"><Icon name="logout" size={20} /></div>
          <div className="profile-row__body">
            <span className="profile-row__label">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
