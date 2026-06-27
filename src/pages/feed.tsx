import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { type ContentItem, api } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { DetailView } from '../components/DetailView';
import { useAuth } from '../lib/auth';

type Filter = 'all' | 'news' | 'podcast' | 'clip';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',     label: 'All'      },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'news',    label: 'News'     },
  { key: 'clip',    label: 'Clips'    },
];

// Map interest slugs to display labels
const INTEREST_LABELS: Record<string, string> = {
  tech: 'Tech', business: 'Business', finance: 'Finance', politics: 'Politics',
  science: 'Science', health: 'Health', climate: 'Climate', sports: 'Sports',
  music: 'Music', film: 'Film & TV', education: 'Education', fashion: 'Fashion',
  travel: 'Travel & Lifestyle', faith: 'Faith & Philosophy',
};

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
      <div className="gcard__thumb">
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt="" loading="lazy" />
          : <div className="gcard__no-thumb"><Icon name={item.type === 'podcast' ? 'headphones' : item.type === 'clip' ? 'play' : 'feed'} size={32} /></div>
        }
        <span className={`gcard__badge gcard__badge--${item.type}`}>{item.type.toUpperCase()}</span>
        {isMustSee && <span className="gcard__must">★ Must-See</span>}
        <button
          className={`gcard__save icon-btn${saved ? ' save-active' : ''}`}
          onClick={toggleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Icon name="bookmark" size={16} />
        </button>
      </div>
      <div className="gcard__body">
        <h2 className="gcard__title">{item.title}</h2>
        {(item.summary?.what ?? item.summary?.summary) && (
          <p className="gcard__desc">{item.summary?.what ?? item.summary?.summary}</p>
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
  const navigate = useNavigate();
  const { interests, location, user } = useAuth();

  const [all, setAll]         = useState<ContentItem[]>([]);
  const [filter, setFilter]   = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [detail, setDetail]   = useState<ContentItem | null>(null);

  useEffect(() => {
    setLoading(true);
    api.feed([], location ?? undefined)
      .then(r => { setAll(r.items); setLoading(false); })
      .catch(() => { setError('Could not load feed.'); setLoading(false); });
  }, [interests, location]);

  const filtered = filter === 'all' ? all : all.filter(i => i.type === filter);

  // Group by interest if user has set interests and is viewing 'all'
  const showGrouped = filter === 'all' && interests.length > 0;

  // Simple grouping: partition items into "interest sections" + "other"
  // We use title/source keyword matching since we don't have topic slugs on the FE
  const INTEREST_KEYWORDS: Record<string, string[]> = {
    tech:       ['tech', 'ai', 'software', 'startup', 'app', 'digital', 'cyber', 'data', 'cloud', 'robot'],
    business:   ['business', 'company', 'ceo', 'market', 'economy', 'trade', 'entrepreneur'],
    finance:    ['finance', 'bank', 'naira', 'dollar', 'invest', 'stock', 'crypto', 'money', 'fund'],
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
    faith:      ['church', 'mosque', 'faith', 'religion', 'prayer', 'spiritual', 'god', 'christianity', 'islam'],
  };

  function matchesInterest(item: ContentItem, interest: string): boolean {
    const kws = INTEREST_KEYWORDS[interest] ?? [];
    const haystack = (item.title + ' ' + item.source + ' ' + (item.summary?.what ?? '')).toLowerCase();
    return kws.some(k => haystack.includes(k));
  }

  function buildGroups(): { label: string; items: ContentItem[] }[] {
    if (!showGrouped) return [];
    const used = new Set<string>();
    const groups: { label: string; items: ContentItem[] }[] = [];

    for (const interest of interests) {
      const matched = filtered.filter(i => {
        if (used.has(i.id)) return false;
        return matchesInterest(i, interest);
      });
      if (matched.length > 0) {
        matched.forEach(i => used.add(i.id));
        groups.push({ label: INTEREST_LABELS[interest] ?? interest, items: matched });
      }
    }

    const rest = filtered.filter(i => !used.has(i.id));
    if (rest.length > 0) groups.push({ label: 'More for You', items: rest });
    return groups;
  }

  const groups = buildGroups();

  return (
    <div className="feed-page">
      {/* Page header */}
      <div className="feed-head">
        <p className="feed-kicker">Today on Radar</p>
        <h1 className="feed-headline">
          {user ? `Hey${user.name ? ` ${user.name.split(' ')[0]}` : ''},` : 'Your feed'}
        </h1>
        {user && (
          <p className="feed-sub">
            {interests.length > 0
              ? `Curated around ${interests.slice(0, 3).map(i => INTEREST_LABELS[i]).join(', ')}${interests.length > 3 ? ` +${interests.length - 3} more` : ''}.`
              : 'The signals worth understanding — ranked for you.'}
          </p>
        )}
        {!user && <p className="feed-sub">The signals worth understanding — ranked for you.</p>}

        {/* Customise interests link */}
        {user && interests.length === 0 && (
          <button
            className="feed-interest-cta"
            onClick={() => navigate('/onboarding')}
            type="button"
          >
            ✦ Personalise your feed →
          </button>
        )}
      </div>

      {/* Location banner */}
      {location && (
        <div className="feed-location">
          <Icon name="location" size={13} />
          <span>{location}</span>
        </div>
      )}

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

      {/* Content */}
      <div className="feed-scroll">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Loading your feed…</p></div>
        )}
        {!loading && error && (
          <div className="empty"><Icon name="feed" size={48} /><h3>Could not load feed</h3><p>{error}</p></div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty"><Icon name="feed" size={48} /><h3>No content yet</h3><p>The feed is being updated. Check back soon.</p></div>
        )}

        {!loading && !error && filtered.length > 0 && (
          showGrouped && groups.length > 0 ? (
            // Grouped by interest
            <div className="feed-groups">
              {groups.map(({ label, items }) => (
                <section key={label} className="feed-group">
                  <h2 className="feed-group__label">{label}</h2>
                  <div className="feed-grid">
                    {items.map(item => (
                      <FeedCard key={item.id} item={item} onDetail={setDetail} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="feed-grid">
              {filtered.map(item => (
                <FeedCard key={item.id} item={item} onDetail={setDetail} />
              ))}
            </div>
          )
        )}
      </div>

      {detail && <DetailView item={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
