import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDueReviews } from '../features/reviews/queries';
import { submitReview } from '../features/reviews/reviewsApi';
import { Icon } from '../components/Icon';

// Screen 3.3 — Review queue (spaced repetition).
export default function Review() {
  const navigate = useNavigate();
  const { data: due = [], isLoading } = useDueReviews();
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return <div className="rise"><div className="skeleton" style={{ height: 240 }} /></div>;
  }

  const total = due.length;
  const current = due[idx];

  if (total === 0 || idx >= total || !current) {
    return (
      <div className="empty rise">
        <Icon name="check" size={40} className="gradient-text" />
        <h3>You’re all caught up</h3>
        <p>{total > 0 ? `${total} insight${total > 1 ? 's' : ''} reviewed today.` : 'No reviews due right now. Come back tomorrow.'}</p>
        <button className="btn btn--ghost" onClick={() => navigate('/brain')}>Back to Brain</button>
      </div>
    );
  }

  async function grade(g: 0 | 1) {
    if (!current) return;
    setBusy(true);
    await submitReview(current.review.id, g);
    setBusy(false);
    setIdx((i) => i + 1);
  }

  const insight = current.insight;

  return (
    <div className="rise">
      <header className="page-head">
        <div className="page-kicker">Review · {idx + 1} of {total}</div>
        <div className="skeleton" style={{ height: 6, width: `${((idx) / total) * 100}%`, marginTop: 10, background: 'var(--cyan)', animation: 'none' }} />
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-2)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          {insight.title}
        </h2>
        <div className="section"><div className="section__label"><span className="dot" /> What</div><p className="lead">{insight.what}</p></div>
        <div className="section"><div className="section__label"><span className="dot" style={{ background: 'var(--purple)' }} /> Why</div><p className="prose">{insight.why}</p></div>
        <div className="section"><div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> Edge</div><p className="prose" style={{ color: 'var(--text)' }}>{insight.edge}</p></div>
      </div>

      <div className="actionbar" style={{ marginTop: 0 }}>
        <button className="btn btn--ghost" disabled={busy} onClick={() => grade(0)}>Review again soon</button>
        <button className="btn btn--primary" disabled={busy} onClick={() => grade(1)}>
          <Icon name="check" size={18} /> I remember this
        </button>
      </div>
    </div>
  );
}
