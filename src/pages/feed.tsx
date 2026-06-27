import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { type ContentItem, type Topic, api } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { SummarySheet } from '../components/SummarySheet';

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : secs < 60 ? `${secs}s` : `${m}m`;
}

// ── Content Card ─────────────────────────────────────────────────────────────

interface CardProps {
  item: ContentItem;
  onDetail: (item: ContentItem) => void;
}

function ContentCard({ item, onDetail }: CardProps) {
  const [saved, setSaved] = useState(() => isSaved(item.id));
  const takeaway = item.summary?.keyTakeaways?.[0];

  function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (saved) { unsaveItem(item.id); setSaved(false); }
    else { saveItem(item); setSaved(true); }
  }

  return (
    <article className="fcard" onClick={() => onDetail(item)}>
      <div className="fcard__body">
        <div className="fcard__meta">
          <span className={`fcard__type fcard__type--${item.type}`}>
            {item.type === 'podcast' && <Icon name="headphones" size={10} />}
            {item.type === 'clip' && <Icon name="play" size={10} />}
            {item.type === 'news' && <Icon name="feed" size={10} />}
            {item.type}
          </span>
          <span className="fcard__source">{item.source}</span>
          <span className="fcard__dot">·</span>
          <span className="fcard__time">{timeAgo(item.createdAt)}</span>
          {item.duration > 0 && (
            <><span className="fcard__dot">·</span><span>{formatDuration(item.duration)}</span></>
          )}
        </div>

        <h2 className="fcard__title">{item.title}</h2>

        {takeaway && <p className="fcard__preview">{takeaway}</p>}
      </div>

      <div className="fcard__right">
        {item.thumbnailUrl && (
          <img src={item.thumbnailUrl} alt="" className="fcard__thumb" loading="lazy" />
        )}
        <button
          className={`fcard__save icon-btn${saved ? ' save-active' : ''}`}
          onClick={toggleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Icon name="bookmark" size={17} />
        </button>
      </div>
    </article>
  );
}

// ── Feed Page ────────────────────────────────────────────────────────────────

export function FeedPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ContentItem | null>(null);

  useEffect(() => {
    api.topics().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const topicObj = topics.find(t => t.slug === activeTopic);
    api.feed(topicObj ? [topicObj.id] : [])
      .then(r => { setItems(r.items); setLoading(false); })
      .catch(() => { setError('Could not load feed.'); setLoading(false); });
  }, [activeTopic, topics]);

  const displayTopics = [{ slug: '', label: 'For You' }, ...topics.map(t => ({ slug: t.slug, label: t.name }))];

  return (
    <div className="feed-page">
      {/* Topic tabs */}
      <div className="feed-tabs-wrap">
        <div className="feed-tabs">
          {displayTopics.map(t => (
            <button
              key={t.slug}
              className={`feed-tab${activeTopic === t.slug ? ' feed-tab--active' : ''}`}
              onClick={() => setActiveTopic(t.slug)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="feed-content">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Loading your feed…</p></div>
        )}
        {!loading && error && (
          <div className="empty">
            <Icon name="feed" size={48} />
            <h3>Could not load feed</h3>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="empty">
            <Icon name="feed" size={48} />
            <h3>No content yet</h3>
            <p>The feed is being updated. Check back soon.</p>
          </div>
        )}
        {!loading && !error && items.map(item => (
          <ContentCard key={item.id} item={item} onDetail={setDetail} />
        ))}
      </div>

      {detail && <SummarySheet item={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
