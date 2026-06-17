import { useNavigate } from 'react-router-dom';
import { useWeeklyReview } from '../features/reviews/queries';
import { Icon } from '../components/Icon';

// Screen — "You Got Smarter" weekly review (PLAYBOOK §7).
export default function Weekly() {
  const navigate = useNavigate();
  const { data: w, isLoading } = useWeeklyReview();

  if (isLoading) return <div className="rise"><div className="skeleton" style={{ height: 240 }} /></div>;
  if (!w) return null;

  return (
    <div className="rise">
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        <span className="page-kicker">Last 7 days</span>
      </div>

      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>You got smarter</h1>

      <div className="statrow">
        <div className="stat"><div className="stat__num">{w.insightsSaved}</div><div className="stat__label">Saved</div></div>
        <div className="stat"><div className="stat__num">{w.reviewsCompleted}</div><div className="stat__label">Reviewed</div></div>
        <div className="stat"><div className="stat__num" style={{ color: 'var(--amber)' }}>{w.daysActive}</div><div className="stat__label">Active days</div></div>
      </div>

      {w.topInsight && (
        <div className="section">
          <div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> Top insight of the week</div>
          <button className="listrow" onClick={() => navigate(`/insight/${w.topInsight!.id}`)}>
            <div className="listrow__main">
              <div className="listrow__title">{w.topInsight.title}</div>
              <div className="listrow__sub">{w.topInsight.what}</div>
            </div>
            <Icon name="right" size={18} className="listrow__chev" />
          </button>
        </div>
      )}

      {w.insights.length > 0 && (
        <div className="section">
          <div className="section__label"><span className="dot" /> Everything you saved</div>
          <div className="stack">
            {w.insights.map((i) => (
              <button key={i.id} className="listrow" onClick={() => navigate(`/insight/${i.id}`)}>
                <div className="listrow__main"><div className="listrow__title">{i.title}</div></div>
                <Icon name="right" size={18} className="listrow__chev" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
