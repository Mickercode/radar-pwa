import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
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
  const navigate = useNavigate();
  const hydrated  = useAuth((s) => s.hydrated);
  const user      = useAuth((s) => s.user);
  const clearAuth = useAuth((s) => s.clearAuth);
  const saved     = getSavedItems();

  const totalInsights = saved.reduce((a, s) => a + s.keyTakeaways.length, 0);
  const dueForReview  = saved.filter(s => {
    const days = (Date.now() - new Date(s.savedAt).getTime()) / 86_400_000;
    return days >= 3;
  }).length;

  if (!hydrated) return null;

  // Not logged in
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
          <p>Sync your saved insights, capture articles, and personalize your feed across all devices.</p>
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
          <span className="profile-stat__n">{totalInsights}</span>
          <span className="profile-stat__l">Insights</span>
        </div>
        <button className="profile-stat profile-stat--link" onClick={() => navigate('/brain')}>
          <span className="profile-stat__n">{saved.length}</span>
          <span className="profile-stat__l">Saved →</span>
        </button>
        <button className="profile-stat profile-stat--link" onClick={() => navigate('/brain?tab=reminders')}>
          <span className="profile-stat__n profile-stat__n--cyan">{dueForReview}</span>
          <span className="profile-stat__l">Due →</span>
        </button>
        <button className="profile-stat profile-stat--link" onClick={() => navigate('/brain?tab=checkin')}>
          <span className="profile-stat__n">★</span>
          <span className="profile-stat__l">Weekly →</span>
        </button>
      </div>

      {/* Navigation rows */}
      <div className="profile-rows">
        <button className="profile-row" onClick={() => navigate('/brain')}>
          <div className="profile-row__icon"><Icon name="brain" size={20} /></div>
          <div className="profile-row__body">
            <span className="profile-row__label">Your Brain</span>
            <span className="profile-row__sub">{totalInsights} insights · {saved.length} saved</span>
          </div>
          <Icon name="right" size={18} className="profile-row__chevron" />
        </button>

        <button className="profile-row" onClick={() => navigate('/settings')}>
          <div className="profile-row__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div className="profile-row__body">
            <span className="profile-row__label">Settings</span>
          </div>
          <Icon name="right" size={18} className="profile-row__chevron" />
        </button>

        <button className="profile-row" onClick={() => navigate('/settings')}>
          <div className="profile-row__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="profile-row__body">
            <span className="profile-row__label">Subscription</span>
            <span className="profile-row__sub">Upgrade to Premium</span>
          </div>
          <Icon name="right" size={18} className="profile-row__chevron" />
        </button>

        <button className="profile-row profile-row--danger" onClick={() => { clearAuth(); navigate('/login', { replace: true }); }}>
          <div className="profile-row__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div className="profile-row__body">
            <span className="profile-row__label">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
