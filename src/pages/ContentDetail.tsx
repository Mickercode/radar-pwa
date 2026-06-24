import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useContent, useKeyMoments } from '../features/content/queries';
import { useSaved } from '../features/library/useSaved';
import { useSaveInsight } from '../features/insights/queries';
import { usePlayer } from '../stores/player';
import { useToast } from '../components/Toast';
import { ShareSheet } from '../components/ShareSheet';
import { Icon } from '../components/Icon';
import { clock, durationLabel, timeAgo } from '../lib/format';

// Screen 2.2 — the heart of the product. What · Why · Edge + takeaways.
export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading } = useContent(id);
  const { data: moments = [] } = useKeyMoments(id);
  const { isSaved, toggleSave } = useSaved();
  const saveInsight = useSaveInsight();
  const play = usePlayer((s) => s.play);
  const { toast } = useToast();
  const [showShare, setShowShare] = useState(false);
  const [savedToBrain, setSavedToBrain] = useState(false);

  if (isLoading) {
    return (
      <div className="rise">
        <div className="subhead">
          <button className="backbtn" onClick={() => navigate(-1)}><Icon name="left" size={20} /></button>
        </div>
        <div className="skeleton" style={{ height: 28, width: '70%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 90 }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="empty rise">
        <h3>Content not found</h3>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>Back to feed</button>
      </div>
    );
  }

  const s = item.summary;
  const what = s?.what ?? s?.summary ?? '';
  const why = s?.why ?? s?.whyItMatters ?? '';
  const takeaways = s?.keyTakeaways ?? [];
  const saved = isSaved(item.id);

  const handleSaveToBrain = async () => {
    try {
      await saveInsight.mutateAsync({
        sourceContentId: item.id,
        title: item.title,
        what: what || item.summary?.summary || item.title,
        why: why || 'Why this matters for Nigerian / African readers.',
        edge: s?.edge || 'Read the full article for actionable insights.',
        tags: [item.source],
        tier: s?.tier ?? 2,
      });
      setSavedToBrain(true);
      toast('Saved to your Brain', 'spark');
    } catch {
      toast('Could not save to brain', 'x');
    }
  };

  return (
    <div className="rise" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)} aria-label="Back"><Icon name="left" size={20} /></button>
        <span className="page-kicker">{item.type}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: '0.6rem' }}>
        <span>{item.source}</span>
        {item.createdAt && <span>· {timeAgo(item.createdAt)}</span>}
        {durationLabel(item.duration) && <span>· {durationLabel(item.duration)}</span>}
        {(s?.nigeriaRelevance ?? 0) >= 2 && <span style={{ color: 'var(--lime)' }}>· 🇳🇬 Nigeria</span>}
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--step-3)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
        {item.title}
      </h1>

      {what && (
        <div className="section">
          <div className="section__label"><span className="dot" /> 🧩 Summary</div>
          <p className="lead">{what}</p>
        </div>
      )}

      {takeaways.length > 0 && (
        <div className="section">
          <div className="section__label"><span className="dot" style={{ background: 'var(--lime)' }} /> 🧠 Key takeaways</div>
          <ul className="takeaways">
            {takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {why && (
        <div className="section">
          <div className="section__label"><span className="dot" style={{ background: 'var(--purple)' }} /> ⚡ Why it matters</div>
          <p className="prose">{why}</p>
        </div>
      )}

      {s?.edge && (
        <div className="section">
          <div className="section__label"><span className="dot" style={{ background: 'var(--amber)' }} /> 🎯 The edge</div>
          <p className="prose" style={{ color: 'var(--text)' }}>{s.edge}</p>
        </div>
      )}

      {moments.length > 0 && (
        <div className="section">
          <div className="section__label"><span className="dot" /> Key moments</div>
          <div className="stack">
            {moments.map((m) => (
              <button key={m.id} className="listrow" onClick={() => { play(item); navigate('/player'); }}>
                <span className="badge mono">{clock(m.timestamp)}</span>
                <div className="listrow__main"><div className="listrow__title">{m.label}</div></div>
                <Icon name="play" size={18} className="listrow__chev" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="actionbar">
        <button className={`btn ${saved ? 'btn--primary' : 'btn--ghost'}`} onClick={() => { toggleSave(item.id); toast(saved ? 'Removed' : 'Saved', saved ? 'x' : 'check'); }}>
          <Icon name={saved ? 'check' : 'save'} size={18} /> {saved ? 'Saved' : 'Save'}
        </button>
        <button
          className={`btn ${savedToBrain ? 'btn--primary' : 'btn--ghost'}`}
          onClick={handleSaveToBrain}
          disabled={savedToBrain || saveInsight.isPending}
          style={{ opacity: savedToBrain || saveInsight.isPending ? 0.65 : 1 }}
        >
          <Icon name={savedToBrain ? 'spark' : 'brain'} size={18} /> {savedToBrain ? 'Saved to Brain' : saveInsight.isPending ? 'Saving…' : 'Save to Brain'}
        </button>
        <button className="btn btn--ghost" onClick={() => setShowShare(true)}>
          <Icon name="share" size={18} /> Share
        </button>
        {item.audioUrl && (
          <button className="btn btn--ghost" onClick={() => { play(item); navigate('/player'); }}>
            <Icon name="headphones" size={18} /> Listen
          </button>
        )}
      </div>

      {showShare && (
        <ShareSheet title={item.title} summary={what} url={item.articleUrl} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
