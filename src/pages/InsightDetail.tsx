import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInsightGraph } from '../features/insights/queries';
import { deleteInsight } from '../features/insights/insightsApi';
import { useToast } from '../components/Toast';
import { ShareSheet } from '../components/ShareSheet';
import { Icon } from '../components/Icon';
import { timeAgo } from '../lib/format';

// Screen 3.2 — Saved insight detail + related (graph neighbours).
export default function InsightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: graph, isLoading } = useInsightGraph(id);
  const { toast } = useToast();
  const [showShare, setShowShare] = useState(false);

  if (isLoading) {
    return <div className="rise"><div className="skeleton" style={{ height: 200 }} /></div>;
  }
  if (!graph?.root) {
    return (
      <div className="empty rise">
        <h3>Insight not found</h3>
        <button className="btn btn--ghost" onClick={() => navigate('/brain')}>Back to Brain</button>
      </div>
    );
  }

  const insight = graph.root;

  async function remove() {
    if (!id) return;
    await deleteInsight(id);
    toast('Insight deleted', 'trash');
    navigate('/brain', { replace: true });
  }

  return (
    <div className="rise" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        <span className="page-kicker">Insight · {timeAgo(insight.createdAt)}</span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-2)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.75rem' }}>
        {insight.title}
      </h1>

      {insight.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {insight.tags.map((t) => <span key={t} className="badge">#{t}</span>)}
        </div>
      )}

      <div className="section">
        <div className="section__label"><span className="dot" /> 🧩 What</div>
        <p className="lead">{insight.what}</p>
      </div>
      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--purple)' }} /> ⚡ Why</div>
        <p className="prose">{insight.why}</p>
      </div>
      <div className="section">
        <div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> 🎯 Edge</div>
        <p className="prose" style={{ color: 'var(--text)' }}>{insight.edge}</p>
      </div>

      {graph.neighbours.length > 0 && (
        <div className="section">
          <div className="section__label"><span className="dot" style={{ background: 'var(--lime)' }} /> Connects to {graph.neighbours.length}</div>
          <div className="stack">
            {graph.neighbours.map((n) => (
              <button key={n.id} className="listrow" onClick={() => navigate(`/insight/${n.id}`)}>
                <Icon name="link" size={18} className="listrow__chev" />
                <div className="listrow__main"><div className="listrow__title">{n.title}</div></div>
                <Icon name="right" size={18} className="listrow__chev" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="actionbar">
        <button className="btn btn--primary" onClick={() => navigate(`/quiz/${insight.id}`)}>
          <Icon name="check" size={18} /> Test yourself
        </button>
        <button className="btn btn--ghost" onClick={() => setShowShare(true)}>
          <Icon name="share" size={18} /> Share
        </button>
        <button className="btn btn--ghost" onClick={remove} aria-label="Delete">
          <Icon name="trash" size={18} />
        </button>
      </div>

      {showShare && (
        <ShareSheet title={insight.title} summary={insight.what} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
