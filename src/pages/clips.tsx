import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type ContentItem } from '../lib/api';
import { DetailView } from '../components/DetailView';

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
    api.liveClips()
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => {
        // Fallback to DB clips if live fetch fails
        api.contentByType('clip')
          .then((data) => { setItems(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  return (
    <div className="clips-page">
      <div className="page-head">
        <div className="page-kicker">Watch & Learn</div>
        <h1 className="page-title">Clips</h1>
      </div>

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading clips…</p></div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty">
          <Icon name="play" size={48} />
          <h3>No clips right now</h3>
          <p>Check back soon — new videos are pulled from YouTube every few hours.</p>
        </div>
      )}

      <div className="clips-grid">
        {items.map(item => (
          <article
            key={item.id}
            className="clip-card"
            onClick={() => setSelected(item)}
          >
            <div className="clip-card__thumb">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
                : <div className="clip-card__no-thumb"><Icon name="play" size={32} /></div>
              }
              <div className="clip-card__play-overlay">
                <Icon name="play" size={28} />
              </div>
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
        <DetailView item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
