import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { useInsights } from '../features/insights/queries';
import { useDueCount } from '../features/reviews/queries';
import { Icon } from '../components/Icon';

// Screen 5.1 — Profile.
export default function Profile() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const { data: insights = [] } = useInsights();
  const { data: due = 0 } = useDueCount();

  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="rise" style={{ maxWidth: 600, margin: '0 auto' }}>
      <header className="page-head">
        <div className="page-kicker">Account</div>
        <h1 className="page-title">You</h1>
      </header>

      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', background: 'linear-gradient(100deg, var(--cyan), var(--purple))', color: '#04141a' }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>{user?.name ?? 'Radar user'}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 'var(--step--1)' }}>{user?.email}</div>
          <span className="badge" style={{ marginTop: 6 }}>Free</span>
        </div>
      </div>

      <div className="statrow">
        <div className="stat"><div className="stat__num">{insights.length}</div><div className="stat__label">Insights</div></div>
        <button className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/review')}>
          <div className="stat__num" style={{ color: due ? 'var(--cyan)' : undefined }}>{due}</div>
          <div className="stat__label">Due →</div>
        </button>
        <button className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/weekly')}>
          <div className="stat__num">★</div><div className="stat__label">Weekly →</div>
        </button>
      </div>

      <div className="stack">
        <button className="listrow" onClick={() => navigate('/settings')}>
          <Icon name="settings" size={20} className="listrow__chev" />
          <div className="listrow__main"><div className="listrow__title">Settings</div></div>
          <Icon name="right" size={18} className="listrow__chev" />
        </button>
        <button className="listrow" onClick={() => navigate('/subscription')}>
          <Icon name="spark" size={20} className="listrow__chev" />
          <div className="listrow__main"><div className="listrow__title">Subscription</div><div className="listrow__sub">Upgrade to Premium</div></div>
          <Icon name="right" size={18} className="listrow__chev" />
        </button>
      </div>
    </div>
  );
}
