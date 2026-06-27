import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type ContentItem } from '../lib/api';
import { usePlayer } from '../components/AudioPlayer';
import { SummarySheet } from '../components/SummarySheet';

function formatDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function PodcastsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filtered, setFiltered] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const { play, pause, resume, track, playing } = usePlayer();

  useEffect(() => {
    api.contentByType('podcast')
      .then((data) => { setItems(data); setFiltered(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.source.toLowerCase().includes(q)
    ) : items);
  }, [search, items]);

  function handlePlay(item: ContentItem) {
    if (!item.audioUrl) return;
    if (track?.contentId === item.id) {
      playing ? pause() : resume();
    } else {
      play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id });
    }
  }

  const isPlaying = (item: ContentItem) => track?.contentId === item.id && playing;
  const isLoaded = (item: ContentItem) => track?.contentId === item.id;

  return (
    <div className="pod-page">
      <div className="page-head">
        <div className="page-kicker">Listen in</div>
        <h1 className="page-title">Podcasts</h1>
      </div>

      <div className="pod-search-wrap">
        <Icon name="search" size={16} className="pod-search-icon" />
        <input
          className="pod-search"
          type="search"
          placeholder="Search podcasts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading podcasts…</p></div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty">
          <Icon name="headphones" size={48} />
          <h3>{search ? 'No matches' : 'No podcasts yet'}</h3>
          <p>{search ? 'Try a different search.' : 'Check back after the next ingest run.'}</p>
        </div>
      )}

      <ul className="pod-list">
        {filtered.map(item => (
          <li key={item.id} className={`pod-item${isLoaded(item) ? ' pod-item--active' : ''}`}>
            <div className="pod-item__art" onClick={() => setSelected(item)}>
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
                : <div className="pod-item__art-placeholder"><Icon name="headphones" size={24} /></div>
              }
            </div>

            <div className="pod-item__body" onClick={() => setSelected(item)}>
              <p className="pod-item__source">{item.source}</p>
              <p className="pod-item__title">{item.title}</p>
              <p className="pod-item__meta">
                {timeAgo(item.createdAt)}
                {item.duration > 0 && <> · {formatDuration(item.duration)}</>}
              </p>
              {item.summary?.keyTakeaways?.[0] && (
                <p className="pod-item__preview">{item.summary.keyTakeaways[0]}</p>
              )}
            </div>

            {item.audioUrl && (
              <button
                className={`pod-item__play${isPlaying(item) ? ' pod-item__play--playing' : ''}`}
                onClick={() => handlePlay(item)}
                aria-label={isPlaying(item) ? 'Pause' : 'Play'}
              >
                {isPlaying(item)
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <Icon name="play" size={18} />
                }
              </button>
            )}
          </li>
        ))}
      </ul>

      {selected && (
        <SummarySheet item={selected} onClose={() => setSelected(null)} onPlay={handlePlay} isPlaying={isPlaying(selected)} />
      )}
    </div>
  );
}
