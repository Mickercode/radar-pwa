import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { type ContentItem, api } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { SummarySheet } from '../components/SummarySheet';

type Filter = 'all' | 'news' | 'podcast' | 'clip';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',     label: 'All'      },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'news',    label: 'News'     },
  { key: 'clip',    label: 'Clips'    },
];

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

// ── Grid Card ────────────────────────────────────────────────────────────────

function FeedCard({ item, onDetail }: { item: ContentItem; onDetail: (i: ContentItem) => void }) {
  const [saved, setSaved] = useState(() => isSaved(item.id));
  const isMustSee = (item.summary?.nigeriaRelevance ?? 0) >= 2 || (item.summary?.tier ?? 3) === 1;

  function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (saved) { unsaveItem(item.id); setSaved(false); }
    else { saveItem(item); setSaved(true); }
  }

  return (
    <article className="gcard" onClick={() => onDetail(item)}>
      {/* Thumbnail */}
      <div className="gcard__thumb">
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
          : <div className="gcard__no-thumb"><Icon name={item.type === 'podcast' ? 'headphones' : item.type === 'clip' ? 'play' : 'feed'} size={32} /></div>
        }
        {/* Overlays */}
        <span className={`gcard__badge gcard__badge--${item.type}`}>
          {item.type.toUpperCase()}
        </span>
        {isMustSee && <span className="gcard__must">★ Must-See</span>}
        <button
          className={`gcard__save icon-btn${saved ? ' save-active' : ''}`}
          onClick={toggleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Icon name="bookmark" size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="gcard__body">
        <h2 className="gcard__title">{item.title}</h2>
        {item.summary?.what && (
          <p className="gcard__desc">{item.summary.what}</p>
        )}
        {!item.summary?.what && item.summary?.summary && (
          <p className="gcard__desc">{item.summary.summary}</p>
        )}
        <div className="gcard__foot">
          <span className="gcard__source">{item.source}</span>
          {item.duration > 0 && <><span className="gcard__dot">·</span><span>{formatDuration(item.duration)}</span></>}
          <span className="gcard__dot">·</span>
          <span className="gcard__time">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}

// ── Feed Page ────────────────────────────────────────────────────────────────

export function FeedPage() {
  const [all, setAll]         = useState<ContentItem[]>([]);
  const [filter, setFilter]   = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [detail, setDetail]   = useState<ContentItem | null>(null);

  useEffect(() => {
    api.feed([])
      .then(r => { setAll(r.items); setLoading(false); })
      .catch(() => { setError('Could not load feed.'); setLoading(false); });
  }, []);

  const items = filter === 'all' ? all : all.filter(i => i.type === filter);

  return (
    <div className="feed-page">
      {/* Page header */}
      <div className="feed-head">
        <p className="feed-kicker">Today on Radar</p>
        <h1 className="feed-headline">Your feed</h1>
        <p className="feed-sub">The signals worth understanding — ranked for you.</p>
      </div>

      {/* Filter chips */}
      <div className="feed-chips">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`feed-chip${filter === f.key ? ' feed-chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="feed-scroll">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Loading your feed…</p></div>
        )}
        {!loading && error && (
          <div className="empty"><Icon name="feed" size={48} /><h3>Could not load feed</h3><p>{error}</p></div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="empty"><Icon name="feed" size={48} /><h3>No content yet</h3><p>The feed is being updated. Check back soon.</p></div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="feed-grid">
            {items.map(item => (
              <FeedCard key={item.id} item={item} onDetail={setDetail} />
            ))}
          </div>
        )}
      </div>

      {detail && <SummarySheet item={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
