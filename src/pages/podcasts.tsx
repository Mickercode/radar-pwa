import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SummarySheet } from '../components/SummarySheet';
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
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
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

  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
  const slugMap = Object.fromEntries(topics.map(t => [t.slug, t]));

  // Build groups from all items (used for the filter tabs)
  const allGrouped: { topic: Topic | null; slug: string; items: ContentItem[] }[] = [];
  const seen = new Set<string>();
  items.forEach(item => {
    const rawSlug = item.topic;
    const topic = item.topicId
      ? (topicMap[item.topicId] ?? null)
      : (rawSlug ? (slugMap[rawSlug] ?? topicMap[rawSlug] ?? null) : null);
    const slug = topic?.slug ?? rawSlug ?? 'general';
    const key = topic?.id ?? slug;
    if (!seen.has(key)) { seen.add(key); allGrouped.push({ topic, slug, items: [] }); }
    allGrouped.find(g => (topic ? g.topic?.id === topic.id : g.slug === slug))?.items.push(item);
  });

  // Filter to selected interest tab
  const grouped = activeSlug
    ? allGrouped.filter(g => g.slug === activeSlug)
    : allGrouped;

  function handlePlay(item: ContentItem) {
    if (!item.audioUrl) return;
    if (track?.contentId === item.id) { playing ? pause() : resume(); }
    else { play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id, artwork: item.thumbnailUrl }); }
  }

  return (
    <>
      {/* Interest filter tabs */}
      {!loading && allGrouped.length > 0 && (
        <div className="pod-interest-bar">
          <button
            className={`pod-interest-pill${!activeSlug ? ' pod-interest-pill--active' : ''}`}
            onClick={() => setActiveSlug(null)}
          >
            All
          </button>
          {allGrouped.map(({ topic, slug }) => (
            <button
              key={slug}
              className={`pod-interest-pill${activeSlug === slug ? ' pod-interest-pill--active' : ''}`}
              style={activeSlug === slug ? { background: getCategoryColor(slug), borderColor: getCategoryColor(slug) } : {}}
              onClick={() => setActiveSlug(prev => prev === slug ? null : slug)}
            >
              <span className="pod-interest-dot" style={{ background: getCategoryColor(slug) }} />
              {topic?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1)}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading podcasts…</p></div>
      )}

      {!loading && grouped.length === 0 && (
        <div className="empty">
          <Icon name="headphones" size={48} />
          <h3>No podcasts yet</h3>
          <p>Check back after the next ingest run.</p>
        </div>
      )}

      <div className="pod-scroll">
        {grouped.map(({ topic, slug, items: groupItems }) => (
          <div key={topic?.id ?? slug} className="pod-group">
            {/* Only show the section header when showing all interests */}
            {!activeSlug && (
              <div className="pod-group-label">
                <span className="pod-group-dot" style={{ background: getCategoryColor(slug) }} />
                <span className="pod-group-name">{(topic?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1)).toUpperCase()}</span>
              </div>
            )}

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
  const routerLocation = useLocation();
  const [tab, setTab] = useState<Tab>('browse');

  const sheetItem = new URLSearchParams(routerLocation.search).has('sheet')
    ? ((routerLocation.state as { previewItem?: ContentItem } | null)?.previewItem ?? null)
    : null;

  function openPreview(item: ContentItem) {
    navigate('?sheet=1', { state: { previewItem: item } });
  }
  function closePreview() {
    navigate(-1 as never);
  }

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

      {tab === 'browse' && <BrowseView onSelect={openPreview} />}
      {tab === 'discover' && <DiscoverView />}

      {sheetItem && (
        <SummarySheet item={sheetItem} onClose={closePreview} />
      )}
    </div>
  );
}
