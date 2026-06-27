import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type ContentItem } from '../lib/api';
import { SummarySheet } from '../components/SummarySheet';

function formatDuration(secs: number): string {
  if (!secs) return '';
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ClipsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContentItem | null>(null);

  useEffect(() => {
    api.contentByType('clip')
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="clips-page">
      <div className="page-head">
        <div className="page-kicker">Short & sharp</div>
        <h1 className="page-title">Clips</h1>
      </div>

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading clips…</p></div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty">
          <Icon name="play" size={48} />
          <h3>No clips yet</h3>
          <p>Short clips (15–60s) will appear here after the next ingest run.</p>
        </div>
      )}

      <div className="clips-grid">
        {items.map(item => (
          <article key={item.id} className="clip-card" onClick={() => setSelected(item)}>
            <div className="clip-card__thumb">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
                : <div className="clip-card__no-thumb"><Icon name="play" size={32} /></div>
              }
              <div className="clip-card__play-overlay">
                <Icon name="play" size={28} />
              </div>
              {item.duration > 0 && (
                <span className="clip-card__dur">{formatDuration(item.duration)}</span>
              )}
            </div>

            <div className="clip-card__body">
              <p className="clip-card__source">{item.source}</p>
              <p className="clip-card__title">{item.title}</p>
              <p className="clip-card__time">{timeAgo(item.createdAt)}</p>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <SummarySheet item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
