import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api, type ContentItem, type Topic, type PodcastFeed } from '../lib/api';
import { usePlayer } from '../components/AudioPlayer';
import { PodcastSearch } from '../features/podcasts/PodcastSearch';
import { PodcastDetail } from '../features/podcasts/PodcastDetail';

type Tab = 'browse' | 'discover';

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

// ── Browse (ingested podcasts grouped by topic) ──────────────────────────────

function BrowseView({ onSelect }: { onSelect: (item: ContentItem) => void }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { play, pause, resume, track, playing } = usePlayer();

  useEffect(() => {
    api.topics().then(setTopics).catch(() => {});
    api.livePodcasts()
      .then(pods => { setItems(pods); setLoading(false); })
      .catch(() => {
        api.contentByType('podcast')
          .then(pods => { setItems(pods); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  function handleSearch() { setQuery(search.trim()); }

  const filtered = query
    ? items.filter(i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.source.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
  const slugMap = Object.fromEntries(topics.map(t => [t.slug, t]));
  const grouped: { topic: Topic | null; slug: string; items: ContentItem[] }[] = [];
  const seen = new Set<string>();

  filtered.forEach(item => {
    // Live items have no topicId but carry a topic slug directly
    const rawSlug = item.topic;
    const topic = item.topicId ? (topicMap[item.topicId] ?? null) : (rawSlug ? (slugMap[rawSlug] ?? null) : null);
    const slug = topic?.slug ?? rawSlug ?? 'general';
    const key = topic?.id ?? slug;
    if (!seen.has(key)) {
      seen.add(key);
      grouped.push({ topic, slug, items: [] });
    }
    grouped.find(g => (topic ? g.topic?.id === topic.id : g.slug === slug))?.items.push(item);
  });

  function handlePlay(item: ContentItem) {
    if (!item.audioUrl) return;
    if (track?.contentId === item.id) {
      playing ? pause() : resume();
    } else {
      play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id, artwork: item.thumbnailUrl });
    }
  }

  return (
    <>
      {/* Search */}
      <div className="pod-search-row">
        <div className="pod-search-wrap">
          <Icon name="search" size={16} className="pod-search-icon" />
          <input
            className="pod-search"
            type="search"
            placeholder="Search episodes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="pod-search-btn" onClick={handleSearch}>Search</button>
      </div>

      {/* Header */}
      <div className="pod-header">
        <h1 className="pod-title">Browse Podcasts</h1>
        <p className="pod-subtitle">Curated picks from your feed. Tap to play instantly.</p>
      </div>

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading podcasts…</p></div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty">
          <Icon name="headphones" size={48} />
          <h3>{query ? 'No results' : 'No podcasts yet'}</h3>
          <p>{query ? `No episodes matched "${query}".` : 'Check back after the next ingest run.'}</p>
        </div>
      )}

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
                  onClick={() => onSelect(item)}
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
    </>
  );
}

// ── Discover (Podcast Index search + episode browser) ────────────────────────

function DiscoverView() {
  const [selectedFeed, setSelectedFeed] = useState<PodcastFeed | null>(null);

  if (selectedFeed) {
    return (
      <PodcastDetail feed={selectedFeed} onBack={() => setSelectedFeed(null)} />
    );
  }

  return <PodcastSearch onSelect={setSelectedFeed} />;
}

// ── Podcasts Page ────────────────────────────────────────────────────────────

export function PodcastsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('browse');

  return (
    <div className="pod-page">
      {/* Tab bar */}
      <div className="pod-page-tabs">
        <button
          className={`pod-page-tab${tab === 'browse' ? ' pod-page-tab--active' : ''}`}
          onClick={() => setTab('browse')}
        >
          <Icon name="feed" size={16} />
          Browse
        </button>
        <button
          className={`pod-page-tab${tab === 'discover' ? ' pod-page-tab--active' : ''}`}
          onClick={() => setTab('discover')}
        >
          <Icon name="search" size={16} />
          Discover
        </button>
      </div>

      {tab === 'browse' && <BrowseView onSelect={item => navigate(`/item/${item.id}`, { state: { item } })} />}
      {tab === 'discover' && <DiscoverView />}
    </div>
  );
}
