import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { api, type ContentItem } from '../lib/api';
import { useAuth } from '../lib/auth';

// Shared with feed.tsx — keyword lists for client-side interest filtering
const INTEREST_LABELS: Record<string, string> = {
  tech: 'Tech', business: 'Business', finance: 'Finance', politics: 'Politics',
  economy: 'Economy', science: 'Science', health: 'Health', climate: 'Climate',
  sports: 'Sports', music: 'Music', film: 'Film & TV', education: 'Education',
  fashion: 'Fashion', travel: 'Travel', faith: 'Faith',
};

const INTEREST_KEYWORDS: Record<string, string[]> = {
  tech:       ['tech', 'ai', 'software', 'startup', 'app', 'digital', 'cyber', 'data', 'cloud', 'robot'],
  business:   ['business', 'company', 'ceo', 'entrepreneur', 'trade', 'commerce', 'corporate'],
  finance:    ['finance', 'bank', 'naira', 'dollar', 'invest', 'stock', 'crypto', 'money', 'fund'],
  economy:    ['economy', 'gdp', 'inflation', 'budget', 'fiscal', 'monetary', 'revenue', 'imf'],
  politics:   ['government', 'president', 'minister', 'election', 'senate', 'policy', 'law', 'political'],
  science:    ['science', 'research', 'study', 'space', 'nasa', 'discovery', 'biology', 'physics'],
  health:     ['health', 'hospital', 'covid', 'cancer', 'drug', 'medicine', 'diet', 'fitness', 'disease'],
  climate:    ['climate', 'energy', 'solar', 'carbon', 'oil', 'gas', 'emission', 'environment', 'green'],
  sports:     ['sport', 'football', 'super eagles', 'nfl', 'nba', 'soccer', 'athlete', 'league', 'match'],
  music:      ['music', 'song', 'album', 'artist', 'concert', 'singer', 'afrobeat'],
  film:       ['film', 'movie', 'series', 'netflix', 'cinema', 'actor', 'nollywood', 'tv show'],
  education:  ['education', 'school', 'university', 'student', 'learning', 'teacher', 'academic'],
  fashion:    ['fashion', 'style', 'design', 'brand', 'wear', 'cloth', 'luxury'],
  travel:     ['travel', 'tourism', 'airline', 'hotel', 'airport', 'visa', 'destination'],
  faith:      ['church', 'mosque', 'faith', 'religion', 'prayer', 'spiritual', 'god'],
};

function matchesInterest(item: ContentItem, slug: string): boolean {
  const kws = INTEREST_KEYWORDS[slug] ?? [];
  const hay = (item.title + ' ' + item.source + ' ' + (item.summary?.what ?? '')).toLowerCase();
  return kws.some(k => hay.includes(k));
}

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export function ClipsPage() {
  const navigate = useNavigate();
  const { interests } = useAuth();

  const [items, setItems]               = useState<ContentItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeInterest, setActiveInterest] = useState<string | null>(null);

  useEffect(() => {
    api.liveClips()
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => {
        api.contentByType('clip')
          .then((data) => { setItems(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  // Reset active interest when user's interests change
  useEffect(() => { setActiveInterest(null); }, [interests.join(',')]);

  const visible = activeInterest
    ? items.filter(item => matchesInterest(item, activeInterest))
    : items;

  return (
    <div className="clips-page">
      <div className="page-head">
        <div className="page-kicker">Watch &amp; Learn</div>
        <h1 className="page-title">Clips</h1>
      </div>

      {/* Interest tabs */}
      {interests.length > 0 && (
        <div className="feed-interest-tabs" role="tablist" aria-label="Filter by interest">
          <button
            role="tab"
            aria-selected={activeInterest === null}
            className={`feed-itab${activeInterest === null ? ' feed-itab--active' : ''}`}
            onClick={() => setActiveInterest(null)}
          >
            All
          </button>
          {interests.map(slug => (
            <button
              key={slug}
              role="tab"
              aria-selected={activeInterest === slug}
              className={`feed-itab${activeInterest === slug ? ' feed-itab--active' : ''}`}
              onClick={() => setActiveInterest(activeInterest === slug ? null : slug)}
            >
              {INTEREST_LABELS[slug] ?? slug}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="feed-loading"><div className="feed-spinner" /><p>Loading clips…</p></div>
      )}

      {!loading && visible.length === 0 && (
        <div className="empty">
          <Icon name="play" size={48} />
          <h3>{activeInterest ? `No ${INTEREST_LABELS[activeInterest] ?? activeInterest} clips` : 'No clips right now'}</h3>
          <p>{activeInterest ? 'Try a different topic or check back later.' : 'Check back soon — new videos are pulled every few hours.'}</p>
        </div>
      )}

      <div className="clips-grid">
        {visible.map(item => (
          <article
            key={item.id}
            className="clip-card"
            onClick={() => navigate(`/item/${item.id}`, { state: { item } })}
          >
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
              {(item.summary?.what ?? item.summary?.summary) && (
                <p className="clip-card__desc">{item.summary?.what ?? item.summary?.summary}</p>
              )}
              <p className="clip-card__time">{timeAgo(item.createdAt)}</p>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
