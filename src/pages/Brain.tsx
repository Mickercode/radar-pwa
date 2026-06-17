import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrainSearch, useInsights } from '../features/insights/queries';
import { useDueCount } from '../features/reviews/queries';
import { Icon } from '../components/Icon';
import { timeAgo } from '../lib/format';

// Screen 3.1 — Knowledge tab. Search + stats + insight list.
export default function Brain() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { data: all = [], isLoading } = useInsights();
  const { data: results } = useBrainSearch(q);
  const { data: dueCount = 0 } = useDueCount();

  const searching = q.trim().length >= 2;
  const list = searching ? results ?? [] : all;

  return (
    <div className="rise">
      <header className="page-head">
        <div className="page-kicker">Second brain</div>
        <h1 className="page-title">Your Brain</h1>
      </header>

      <div className="searchbar">
        <Icon name="search" size={18} />
        <input
          placeholder="What do I know about…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {!searching && (
        <div className="statrow">
          <div className="stat">
            <div className="stat__num">{all.length}</div>
            <div className="stat__label">Insights</div>
          </div>
          <button className="stat" onClick={() => navigate('/review')} style={{ cursor: 'pointer' }}>
            <div className="stat__num" style={{ color: dueCount ? 'var(--cyan)' : undefined }}>{dueCount}</div>
            <div className="stat__label">Due now →</div>
          </button>
          <button className="stat" onClick={() => navigate('/weekly')} style={{ cursor: 'pointer' }}>
            <div className="stat__num">★</div>
            <div className="stat__label">This week →</div>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="stack">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>{searching ? 'No matches' : 'Your brain is empty'}</h3>
          <p>{searching ? 'Try another word.' : 'Save insights from the feed or capture a link to start building.'}</p>
        </div>
      ) : (
        <div className="stack">
          {list.map((i) => (
            <button key={i.id} className="listrow" onClick={() => navigate(`/insight/${i.id}`)}>
              <div className="listrow__main">
                <div className="listrow__title">{i.title}</div>
                <div className="listrow__sub">{i.what}</div>
                <div className="listrow__sub" style={{ color: 'var(--text-faint)' }}>{timeAgo(i.createdAt)}</div>
              </div>
              <Icon name="right" size={18} className="listrow__chev" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
