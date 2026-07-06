import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { useAuth } from '../lib/auth';

export interface AdminStats {
  users: {
    total: number;
    newLast7d: number;
    newLast30d: number;
    premium: number;
    topInterests: { label: string; count: number }[];
    topLocations: { label: string; count: number }[];
  };
  content: {
    total: number;
    newLast24h: number;
    newLast3h: number;
    lastIngestAt: string | null;
    byType: Record<string, number>;
    byTopic: { name: string; slug: string; count: number }[];
  };
  engagement: {
    totalSaved: number;
    savedLast7d: number;
    topSaved: { contentId: string; title: string; source: string; saves: number }[];
    uploadsThisMonth: number;
  };
  system: {
    pendingSignups: number;
    pushSubscribers: number;
    premiumSubscriptions: number;
    tierBreakdown: Record<string, number>;
    ingest: {
      status: 'ok' | 'claude_credits_low' | 'ai_unavailable';
      runAt: string;
      inserted: { news: number; podcasts: number; clips: number };
      skipped: { promo: number; duration: number; irrelevant: number; tier3: number };
    } | null;
  };
}

function relTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`adm-stat${accent ? ' adm-stat--accent' : ''}`}>
      <div className="adm-stat__val">{value}</div>
      <div className="adm-stat__label">{label}</div>
      {sub && <div className="adm-stat__sub">{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="adm-bar">
      <div className="adm-bar__top">
        <span className="adm-bar__label">{label}</span>
        <span className="adm-bar__val">{value.toLocaleString()}</span>
      </div>
      <div className="adm-bar__track">
        <div className="adm-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="adm-section">
      <h2 className="adm-section__title">
        <Icon name={icon as any} size={16} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function GrantAdminForm() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg]       = useState('');

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.grantAdmin(email.trim().toLowerCase());
      setMsg(`${res.email} is now an admin. They must log out and back in for it to take effect.`);
      setStatus('ok');
      setEmail('');
    } catch (err) {
      setMsg((err as Error).message);
      setStatus('error');
    }
  }

  return (
    <Section title="Grant Admin Access" icon="profile">
      <p className="adm-empty" style={{ marginBottom: '12px' }}>
        Promote any existing user account to admin. They will need to log out and back in.
      </p>
      <form className="adm-grant-form" onSubmit={handleGrant}>
        <input
          className="adm-grant-input"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
          required
        />
        <button className="btn btn--primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Granting…' : 'Grant Admin'}
        </button>
      </form>
      {status === 'ok'    && <p className="adm-grant-ok">{msg}</p>}
      {status === 'error' && <p className="adm-grant-err">{msg}</p>}
    </Section>
  );
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useAuth(s => s.user);

  useEffect(() => {
    api.adminStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="adm-page">
        <div className="adm-loading">
          <div className="capture-loading-ring" />
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-page">
        <div className="adm-error">
          <Icon name="x" size={40} />
          <h2>Access denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { users, content, engagement, system } = stats;
  const maxTopic = Math.max(...content.byTopic.map((t) => t.count), 1);
  const maxInterest = Math.max(...users.topInterests.map((i) => i.count), 1);
  const maxLocation = Math.max(...users.topLocations.map((l) => l.count), 1);
  const tier1 = system.tierBreakdown['tier1'] ?? 0;
  const tier2 = system.tierBreakdown['tier2'] ?? 0;
  const tier3 = system.tierBreakdown['tier3'] ?? 0;
  const totalTiered = tier1 + tier2 + tier3;

  const freshness =
    content.newLast3h > 0 ? 'green' :
    content.newLast24h > 0 ? 'amber' : 'red';

  return (
    <div className="adm-page">
      <div className="adm-head">
        <p className="capture-kicker">Platform</p>
        <h1 className="adm-title">Admin Dashboard</h1>
        <p className="adm-subtitle">Signed in as {user?.email}</p>
      </div>

      {/* ── USERS ── */}
      <Section title="Users" icon="profile">
        <div className="adm-stats-row">
          <Stat label="Total users"    value={users.total.toLocaleString()} accent />
          <Stat label="New (7 days)"   value={users.newLast7d}  sub={`${users.newLast30d} in 30d`} />
          <Stat label="Premium"        value={users.premium}    sub={users.total > 0 ? `${Math.round(users.premium / users.total * 100)}% of users` : '—'} />
        </div>

        <div className="adm-cols">
          <div>
            <p className="adm-sub-heading">Top Interests</p>
            {users.topInterests.length === 0
              ? <p className="adm-empty">No data yet</p>
              : users.topInterests.map((i) => (
                  <Bar key={i.label} label={i.label} value={i.count} max={maxInterest} />
                ))}
          </div>
          <div>
            <p className="adm-sub-heading">Top Locations</p>
            {users.topLocations.length === 0
              ? <p className="adm-empty">No data yet</p>
              : users.topLocations.map((l) => (
                  <Bar key={l.label} label={l.label} value={l.count} max={maxLocation} />
                ))}
          </div>
        </div>
      </Section>

      {/* ── CONTENT ── */}
      <Section title="Content" icon="feed">
        <div className="adm-stats-row">
          <Stat label="Total items"   value={content.total.toLocaleString()} accent />
          <Stat label="Last 24h"      value={content.newLast24h} sub={`${content.newLast3h} in last 3h`} />
          <Stat label="Last ingest"   value={relTime(content.lastIngestAt)} />
        </div>

        <div className="adm-ingest-badge-row">
          <div className={`adm-freshness adm-freshness--${freshness}`}>
            <span className="adm-freshness__dot" />
            {freshness === 'green' ? 'Feed is fresh' : freshness === 'amber' ? 'No ingest in 3h' : 'No ingest in 24h — check cron job'}
          </div>
          <div className="adm-type-pills">
            {Object.entries(content.byType).map(([type, count]) => (
              <span key={type} className="adm-type-pill">
                {type} <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>

        <p className="adm-sub-heading">Items by Topic</p>
        {content.byTopic.map((t) => (
          <Bar key={t.slug} label={t.name} value={t.count} max={maxTopic} />
        ))}
      </Section>

      {/* ── ENGAGEMENT ── */}
      <Section title="Engagement" icon="bookmark">
        <div className="adm-stats-row">
          <Stat label="Total saves"     value={engagement.totalSaved.toLocaleString()} accent />
          <Stat label="Saves (7 days)"  value={engagement.savedLast7d} />
          <Stat label="File uploads"    value={engagement.uploadsThisMonth} sub="This month" />
        </div>

        <p className="adm-sub-heading">Most Saved Content</p>
        {engagement.topSaved.length === 0
          ? <p className="adm-empty">No saves yet</p>
          : (
            <div className="adm-table">
              <div className="adm-table__head">
                <span>Title</span><span>Source</span><span>Saves</span>
              </div>
              {engagement.topSaved.map((item) => (
                <div key={item.contentId} className="adm-table__row">
                  <span className="adm-table__title">{item.title}</span>
                  <span className="adm-table__source">{item.source}</span>
                  <span className="adm-table__count">{item.saves}</span>
                </div>
              ))}
            </div>
          )}
      </Section>

      {/* ── SYSTEM ── */}
      <Section title="System" icon="brain">

        {/* AI credit alert */}
        {system.ingest && system.ingest.status !== 'ok' && (
          <div className="adm-alert adm-alert--error">
            <Icon name="x" size={16} />
            <div className="adm-alert__body">
              <strong>
                {system.ingest.status === 'claude_credits_low'
                  ? 'Anthropic credits low — ingest fell back to OpenRouter'
                  : 'AI unavailable — ingest aborted early, feed may be stale'}
              </strong>
              <span>
                Last run {relTime(system.ingest.runAt)} &middot; {system.ingest.inserted.news} news, {system.ingest.inserted.podcasts} podcasts, {system.ingest.inserted.clips} clips inserted
                {system.ingest.status === 'claude_credits_low'
                  ? ' · Top up Anthropic credits at console.anthropic.com'
                  : ' · Check OpenRouter + Anthropic credits and redeploy ingest'}
              </span>
            </div>
          </div>
        )}

        {system.ingest && system.ingest.status === 'ok' && (
          <div className="adm-alert adm-alert--ok">
            <Icon name="feed" size={16} />
            <div className="adm-alert__body">
              <strong>AI healthy</strong>
              <span>
                Last run {relTime(system.ingest.runAt)} &middot; {system.ingest.inserted.news} news, {system.ingest.inserted.podcasts} podcasts, {system.ingest.inserted.clips} clips
              </span>
            </div>
          </div>
        )}

        {!system.ingest && (
          <div className="adm-alert adm-alert--warn">
            <Icon name="feed" size={16} />
            <div className="adm-alert__body">
              <strong>No ingest run recorded yet</strong>
              <span>Trigger a manual run on the Render radar-ingest cron service.</span>
            </div>
          </div>
        )}

        <div className="adm-stats-row">
          <Stat label="Push subscribers"     value={system.pushSubscribers} />
          <Stat label="Premium subscribers"  value={system.premiumSubscriptions} />
          <Stat label="Pending signups"       value={system.pendingSignups}
                sub={system.pendingSignups > 10 ? '⚠ OTP issues?' : 'Normal'} />
        </div>

        <p className="adm-sub-heading">Editorial Tier Breakdown</p>
        <div className="adm-tier-row">
          {[
            { label: 'Tier 1 — Elite', count: tier1, cls: 'adm-tier--1' },
            { label: 'Tier 2 — Good',  count: tier2, cls: 'adm-tier--2' },
            { label: 'Tier 3 — Dropped', count: tier3, cls: 'adm-tier--3' },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`adm-tier ${cls}`}>
              <div className="adm-tier__count">{count.toLocaleString()}</div>
              <div className="adm-tier__label">{label}</div>
              <div className="adm-tier__pct">
                {totalTiered > 0 ? `${Math.round(count / totalTiered * 100)}%` : '—'}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <GrantAdminForm />
    </div>
  );
}
