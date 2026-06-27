import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { api, type ContentItem, type Topic } from '../lib/api';
import { usePlayer } from '../components/AudioPlayer';
import { DetailView } from '../components/DetailView';

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#00c2cb',
  tech: '#00c2cb',
  business: '#f2b441',
  finance: '#f2b441',
  politics: '#fb7185',
  sports: '#45d483',
  health: '#a78bfa',
  music: '#f472b6',
  film: '#60a5fa',
  science: '#34d399',
  education: '#fbbf24',
  nigeria: '#00c2cb',
};

function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug.toLowerCase()] ?? '#8892a4';
}

function formatDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export function PodcastsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const { play, pause, resume, track, playing } = usePlayer();

  useEffect(() => {
    Promise.all([api.contentByType('podcast'), api.topics()])
      .then(([pods, tops]) => { setItems(pods); setTopics(tops); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleSearch() { setQuery(search.trim()); }

  // Filter by search query
  const filtered = query
    ? items.filter(i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.source.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Group by topic
  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
  const grouped: { topic: Topic | null; slug: string; items: ContentItem[] }[] = [];
  const seen = new Set<string>();

  filtered.forEach(item => {
    const key = item.topicId ?? '__none__';
    if (!seen.has(key)) {
      seen.add(key);
      const topic = item.topicId ? topicMap[item.topicId] ?? null : null;
      grouped.push({ topic, slug: topic?.slug ?? 'general', items: [] });
    }
    const g = grouped.find(g => (item.topicId ? g.topic?.id === item.topicId : g.topic === null));
    g?.items.push(item);
  });

  function handlePlay(item: ContentItem) {
    if (!item.audioUrl) return;
    if (track?.contentId === item.id) {
      playing ? pause() : resume();
    } else {
      play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id, artwork: item.thumbnailUrl });
    }
  }

  if (selected) {
    return <DetailView item={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="pod-page">
      {/* Search */}
      <div className="pod-search-row">
        <div className="pod-search-wrap">
          <Icon name="search" size={16} className="pod-search-icon" />
          <input
            className="pod-search"
            type="search"
            placeholder="Search any podcast…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="pod-search-btn" onClick={handleSearch}>Search</button>
      </div>

      {/* Header */}
      <div className="pod-header">
        <h1 className="pod-title">Discover Podcasts</h1>
        <p className="pod-subtitle">Browse curated picks. Tap an episode to listen instantly.</p>
      </div>

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading podcasts…</p></div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty">
          <Icon name="headphones" size={48} />
          <h3>{query ? 'No results' : 'No podcasts yet'}</h3>
          <p>{query ? `No podcasts matched "${query}".` : 'Check back after the next ingest run.'}</p>
        </div>
      )}

      {/* Grouped list */}
      <div className="pod-scroll">
        {grouped.map(({ topic, slug, items: groupItems }) => (
          <div key={topic?.id ?? 'none'} className="pod-group">
            <div className="pod-group-label">
              <span className="pod-group-dot" style={{ background: getCategoryColor(slug) }} />
              <span className="pod-group-name">{(topic?.name ?? 'General').toUpperCase()}</span>
            </div>

            <div className="pod-group-list">
              {groupItems.map(item => (
                <div
                  key={item.id}
                  className={`pod-row${track?.contentId === item.id ? ' pod-row--active' : ''}`}
                  onClick={() => setSelected(item)}
                >
                  <div className="pod-row__art">
                    {item.thumbnailUrl
                      ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
                      : <div className="pod-row__art-ph"><Icon name="headphones" size={22} /></div>
                    }
                  </div>

                  <div className="pod-row__body">
                    <p className="pod-row__title">{item.title}</p>
                    <p className="pod-row__source">{item.source}</p>
                    {item.summary?.what && (
                      <p className="pod-row__desc">{item.summary.what}</p>
                    )}
                    {item.duration > 0 && (
                      <p className="pod-row__dur">{formatDuration(item.duration)}</p>
                    )}
                  </div>

                  {item.audioUrl && (
                    <button
                      className={`pod-row__play${track?.contentId === item.id && playing ? ' pod-row__play--on' : ''}`}
                      onClick={e => { e.stopPropagation(); handlePlay(item); }}
                      aria-label="Play"
                    >
                      {track?.contentId === item.id && playing
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <Icon name="play" size={16} />
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
