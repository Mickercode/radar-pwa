import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { type ContentItem, api } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { DetailView } from '../components/DetailView';
import { useAuth } from '../lib/auth';

type TypeFilter = 'all' | 'news' | 'podcast' | 'clip';

// ── Static data ────────────────────────────────────────────────────────────────

const INTEREST_LABELS: Record<string, string> = {
  tech: 'Tech', business: 'Business', finance: 'Finance', politics: 'Politics',
  economy: 'Economy', science: 'Science', health: 'Health', climate: 'Climate',
  sports: 'Sports', music: 'Music', film: 'Film & TV', education: 'Education',
  fashion: 'Fashion', travel: 'Travel', faith: 'Faith',
};

// Sub-categories per interest — for client-side narrowing within the tab
const SUBCATS: Record<string, { label: string; kws: string[] }[]> = {
  politics: [
    { label: 'Government',  kws: ['government', 'minister', 'president', 'senate', 'nass', 'assembly'] },
    { label: 'Elections',   kws: ['election', 'vote', 'inec', 'ballot', 'candidate', 'campaign'] },
    { label: 'Policy',      kws: ['policy', 'law', 'bill', 'legislation', 'reform', 'regulation', 'executive order'] },
    { label: 'Security',    kws: ['security', 'military', 'police', 'bandits', 'terrorism', 'insurgency', 'conflict'] },
  ],
  economy: [
    { label: 'Inflation',   kws: ['inflation', 'price', 'cost of living', 'cpi', 'purchasing power', 'subsidy'] },
    { label: 'Jobs',        kws: ['jobs', 'employment', 'unemployment', 'labour', 'salary', 'wages', 'layoff'] },
    { label: 'Oil & Gas',   kws: ['oil', 'gas', 'nnpc', 'petroleum', 'fuel', 'opec', 'crude'] },
    { label: 'Banking',     kws: ['bank', 'cbn', 'naira', 'interest rate', 'fintech', 'payment', 'forex'] },
  ],
  finance: [
    { label: 'Naira / FX',  kws: ['naira', 'forex', 'exchange rate', 'dollar', 'devaluation', 'cbn'] },
    { label: 'Investments', kws: ['invest', 'stock', 'bond', 'etf', 'portfolio', 'dividend', 'asset'] },
    { label: 'Crypto',      kws: ['bitcoin', 'crypto', 'blockchain', 'web3', 'token', 'binance', 'nft'] },
    { label: 'Insurance',   kws: ['insurance', 'pension', 'pencom', 'microfinance', 'savings', 'naicom'] },
  ],
  tech: [
    { label: 'AI',          kws: ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'llm', 'generative'] },
    { label: 'Startups',    kws: ['startup', 'founder', 'venture', 'funding', 'seed', 'raise', 'series a'] },
    { label: 'Security',    kws: ['cybersecurity', 'hack', 'breach', 'phishing', 'malware', 'scam', 'fraud'] },
    { label: 'Telecom',     kws: ['mtn', 'airtel', 'glo', '5g', 'telecom', 'broadband', 'ncc'] },
  ],
  health: [
    { label: 'Disease',     kws: ['disease', 'outbreak', 'epidemic', 'virus', 'cholera', 'malaria', 'mpox'] },
    { label: 'Nutrition',   kws: ['nutrition', 'diet', 'food', 'hunger', 'malnutrition', 'obesity'] },
    { label: 'Mental',      kws: ['mental health', 'depression', 'anxiety', 'suicide', 'wellbeing', 'stress'] },
    { label: 'Policy',      kws: ['nhia', 'health insurance', 'ministry of health', 'hospital', 'nhis'] },
  ],
  sports: [
    { label: 'Football',    kws: ['football', 'super eagles', 'npfl', 'premier league', 'laliga', 'afcon', 'world cup'] },
    { label: 'Basketball',  kws: ['basketball', 'nba', "d'tigers", "d'tigress", 'fiba'] },
    { label: 'Athletics',   kws: ['athletics', 'sprints', 'olympics', 'track', 'field', 'medal'] },
    { label: 'Others',      kws: ['tennis', 'golf', 'boxing', 'cricket', 'swimming', 'wrestling', 'esports'] },
  ],
  business: [
    { label: 'SMEs',        kws: ['sme', 'small business', 'entrepreneur', 'startup', 'informal'] },
    { label: 'Markets',     kws: ['market', 'trade', 'import', 'export', 'logistics', 'supply chain'] },
    { label: 'Corporate',   kws: ['company', 'ceo', 'board', 'merger', 'acquisition', 'conglomerate'] },
    { label: 'Agriculture', kws: ['agriculture', 'farming', 'agric', 'harvest', 'food security', 'livestock'] },
  ],
  science: [
    { label: 'Space',       kws: ['space', 'nasa', 'satellite', 'rocket', 'orbit', 'astronomy', 'nigeriasat'] },
    { label: 'Medicine',    kws: ['medicine', 'clinical', 'trial', 'vaccine', 'therapy', 'drug', 'drug approval'] },
    { label: 'Environment', kws: ['biodiversity', 'ecology', 'rainforest', 'species', 'conservation', 'wildlife'] },
    { label: 'Innovation',  kws: ['innovation', 'research', 'discovery', 'laboratory', 'experiment', 'nanotechnology'] },
  ],
  climate: [
    { label: 'Energy',      kws: ['solar', 'renewable', 'wind', 'electricity', 'power', 'grid', 'nerc', 'discos'] },
    { label: 'Oil & Gas',   kws: ['oil spill', 'gas flaring', 'fossil fuel', 'pipeline', 'petroleum', 'emission'] },
    { label: 'Weather',     kws: ['flood', 'drought', 'rainfall', 'erosion', 'disaster', 'storm', 'heatwave'] },
    { label: 'Policy',      kws: ['cop', 'paris agreement', 'carbon', 'climate action', 'green deal', 'net zero'] },
  ],
  education: [
    { label: 'University',  kws: ['university', 'unilag', 'ui', 'asuu', 'strike', 'jamb', 'postgraduate', 'admission'] },
    { label: 'Schools',     kws: ['primary school', 'secondary school', 'waec', 'neco', 'teacher', 'subeb'] },
    { label: 'EdTech',      kws: ['edtech', 'online learning', 'e-learning', 'distance', 'mooc', 'coursera'] },
    { label: 'Scholarships', kws: ['scholarship', 'bursary', 'award', 'fellowship', 'grant', 'study abroad'] },
  ],
  music: [
    { label: 'Afrobeats',   kws: ['afrobeats', 'afropop', 'burna', 'wizkid', 'davido', 'asake', 'amapiano'] },
    { label: 'Gospel',      kws: ['gospel', 'worship', 'praise', 'christian music', 'hymn'] },
    { label: 'Hip-Hop',     kws: ['hip hop', 'rap', 'trap', 'street hop', 'olamide', 'falz'] },
    { label: 'Industry',    kws: ['record label', 'streaming', 'spotify', 'music award', 'headies', 'tour'] },
  ],
  film: [
    { label: 'Nollywood',   kws: ['nollywood', 'nigerian film', 'aba', 'actor', 'actress', 'amaa'] },
    { label: 'Hollywood',   kws: ['hollywood', 'oscar', 'disney', 'marvel', 'box office', 'blockbuster'] },
    { label: 'Streaming',   kws: ['netflix', 'prime video', 'disney+', 'series', 'tv show', 'season'] },
    { label: 'Reviews',     kws: ['review', 'rating', 'critic', 'rotten tomatoes', 'imdb', 'must watch'] },
  ],
  fashion: [
    { label: 'Nigerian',    kws: ['ankara', 'aso-ebi', 'agbada', 'gele', 'adire', 'local designer'] },
    { label: 'Global',      kws: ['gucci', 'louis vuitton', 'fashion week', 'runway', 'zara', 'h&m'] },
    { label: 'Lifestyle',   kws: ['lifestyle', 'beauty', 'skincare', 'wellness', 'grooming', 'haircare'] },
  ],
  travel: [
    { label: 'Nigeria',     kws: ['nigeria tourism', 'hotel', 'resort', 'abuja', 'lagos', 'calabar', 'vacation'] },
    { label: 'Visa / Fly',  kws: ['visa', 'passport', 'airline', 'airport', 'emigrate', 'japa'] },
    { label: 'Africa',      kws: ['ghana', 'kenya', 'south africa', 'africa', 'safari', 'rwanda', 'east africa'] },
  ],
  faith: [
    { label: 'Christianity', kws: ['church', 'pastor', 'sermon', 'christian', 'rccg', 'winners chapel', 'mountain of fire'] },
    { label: 'Islam',       kws: ['islam', 'mosque', 'imam', 'sultan', 'ramadan', 'hajj', 'jummat'] },
    { label: 'Ethics',      kws: ['ethics', 'moral', 'philosophy', 'virtue', 'values', 'integrity'] },
  ],
};

function matchesSub(item: ContentItem, kws: string[]): boolean {
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
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : secs < 60 ? `${secs}s` : `${m}m`;
}

// ── Feed card ─────────────────────────────────────────────────────────────────

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
          : <div className="gcard__no-thumb">
              <Icon name={item.type === 'podcast' ? 'headphones' : item.type === 'clip' ? 'play' : 'feed'} size={32} />
            </div>
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

// ── Feed page ─────────────────────────────────────────────────────────────────

export function FeedPage() {
  const navigate = useNavigate();
  const { interests, location, user } = useAuth();

  // Active interest tab — null means "For You"
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [activeSub, setActiveSub]           = useState<string | null>(null);
  const [typeFilter, setTypeFilter]         = useState<TypeFilter>('news');

  const [items, setItems]         = useState<ContentItem[]>([]);
  const [livePods, setLivePods]   = useState<ContentItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [detail, setDetail]       = useState<ContentItem | null>(null);

  // ── Feed cache (in-memory + 5-min localStorage TTL) ───────────────────────
  const FEED_TTL = 5 * 60 * 1000;
  const cache     = useRef<Map<string, ContentItem[]>>(new Map());
  const liveFetched = useRef(false);
  const retryCount  = useRef(0);

  function readDiskCache(key: string): ContentItem[] | null {
    try {
      const raw = localStorage.getItem(`radar:feed:${key}`);
      if (!raw) return null;
      const { items: cached, ts } = JSON.parse(raw) as { items: ContentItem[]; ts: number };
      if (Date.now() - ts > FEED_TTL) { localStorage.removeItem(`radar:feed:${key}`); return null; }
      return cached;
    } catch { return null; }
  }

  function writeDiskCache(key: string, items: ContentItem[]) {
    try { localStorage.setItem(`radar:feed:${key}`, JSON.stringify({ items, ts: Date.now() })); }
    catch { /* storage full */ }
  }

  function loadFeed(interest: string | null) {
    const key = interest ?? 'for-you';

    // 1. In-memory (instant)
    if (cache.current.has(key)) {
      setItems(cache.current.get(key)!);
      setLoading(false);
      return;
    }

    // 2. localStorage (< 5 min old)
    const disk = readDiskCache(key);
    if (disk) {
      cache.current.set(key, disk);
      setItems(disk);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchInterests = interest ? [interest] : undefined;
    api.feed([], location ?? undefined, fetchInterests)
      .then(r => {
        retryCount.current = 0;
        cache.current.set(key, r.items);
        writeDiskCache(key, r.items);
        setItems(r.items);
        setLoading(false);
      })
      .catch(() => {
        if (retryCount.current < 1) {
          retryCount.current++;
          setTimeout(() => loadFeed(interest), 4000);
        } else {
          retryCount.current = 0;
          setError('Could not load feed.');
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    loadFeed(activeInterest);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInterest, location]);

  // When the user picks the Podcasts type-filter and DB has nothing, pull live RSS episodes
  useEffect(() => {
    if (typeFilter !== 'podcast' || loading || liveFetched.current) return;
    const dbPods = items.filter(i => i.type === 'podcast');
    if (dbPods.length > 0) return;
    liveFetched.current = true;
    api.livePodcasts().then(setLivePods).catch(() => {});
  }, [typeFilter, loading, items]);

  // Reset sub-category when switching interest
  function switchInterest(slug: string | null) {
    setActiveInterest(slug);
    setActiveSub(null);
  }

  // Clear cache when interests list changes (preferences updated)
  useEffect(() => {
    cache.current.clear();
    switchInterest(null);
  }, [interests.join(',')]);

  // Sub-categories available for the active interest
  const subs = activeInterest ? (SUBCATS[activeInterest] ?? []) : [];

  // Narrow items: sub-category + type filter
  const baseItems = (() => {
    if (typeFilter === 'podcast') {
      const dbPods = items.filter(i => i.type === 'podcast');
      if (dbPods.length === 0 && livePods.length > 0) return livePods;
    }
    return items;
  })();

  const visible = baseItems.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (activeSub) {
      const subDef = subs.find(s => s.label === activeSub);
      if (subDef && !matchesSub(item, subDef.kws)) return false;
    }
    return true;
  });

  const INTEREST_KEYWORDS: Record<string, string[]> = {
    tech:       ['tech', 'ai', 'software', 'startup', 'app', 'digital', 'cyber', 'data', 'cloud', 'robot'],
    business:   ['business', 'company', 'ceo', 'entrepreneur', 'trade', 'commerce', 'corporate'],
    finance:    ['finance', 'bank', 'naira', 'dollar', 'invest', 'stock', 'crypto', 'money', 'fund'],
    economy:    ['economy', 'gdp', 'inflation', 'budget', 'fiscal', 'monetary', 'revenue', 'imf', 'world bank'],
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

  function buildForYouGroups(): { label: string; items: ContentItem[] }[] {
    if (interests.length === 0) return [];
    const used = new Set<string>();
    const groups: { label: string; items: ContentItem[] }[] = [];

    for (const slug of interests) {
      const kws = INTEREST_KEYWORDS[slug] ?? [];
      const matched = visible.filter(i => {
        if (used.has(i.id)) return false;
        const hay = (i.title + ' ' + i.source + ' ' + (i.summary?.what ?? '')).toLowerCase();
        return kws.some(k => hay.includes(k));
      });
      if (matched.length > 0) {
        matched.forEach(i => used.add(i.id));
        groups.push({ label: INTEREST_LABELS[slug] ?? slug, items: matched });
      }
    }
    const rest = visible.filter(i => !used.has(i.id));
    if (rest.length > 0) groups.push({ label: 'More for You', items: rest });
    return groups;
  }

  const isForYou = activeInterest === null;
  const forYouGroups = isForYou && interests.length > 0 ? buildForYouGroups() : [];
  const showGrouped  = isForYou && forYouGroups.length > 0;

  return (
    <div className="feed-page">
      {/* ── Page header ─────────────────────────────── */}
      <div className="feed-head">
        <p className="feed-kicker">Today on Radar</p>
        <h1 className="feed-headline">
          {user ? `Hey${user.name ? ` ${user.name.split(' ')[0]}` : ''},` : 'Your feed'}
        </h1>
        {user && (
          <p className="feed-sub">
            {interests.length > 0
              ? activeInterest
                ? `Showing only ${INTEREST_LABELS[activeInterest] ?? activeInterest} content.`
                : `Curated around ${interests.slice(0, 3).map(i => INTEREST_LABELS[i] ?? i).join(', ')}${interests.length > 3 ? ` +${interests.length - 3} more` : ''}.`
              : 'The signals worth understanding — ranked for you.'}
          </p>
        )}
        {!user && <p className="feed-sub">The signals worth understanding — ranked for you.</p>}
        {user && interests.length === 0 && (
          <button className="feed-interest-cta" onClick={() => navigate('/onboarding')} type="button">
            ✦ Personalise your feed →
          </button>
        )}
      </div>

      {/* ── Location banner ──────────────────────────── */}
      {location && (
        <div className="feed-location">
          <Icon name="location" size={13} />
          <span>{location}</span>
        </div>
      )}

      {/* ── Interest tabs (only if user has interests) ─ */}
      {interests.length > 0 && (
        <div className="feed-interest-tabs" role="tablist" aria-label="Interest filter">
          {interests.map(slug => (
            <button
              key={slug}
              role="tab"
              aria-selected={activeInterest === slug}
              className={`feed-itab${activeInterest === slug ? ' feed-itab--active' : ''}`}
              onClick={() => switchInterest(slug)}
            >
              {INTEREST_LABELS[slug] ?? slug}
            </button>
          ))}
        </div>
      )}

      {/* ── Sub-category chips ────────────────────────── */}
      {subs.length > 0 && (
        <div className="feed-subcats">
          <button
            className={`feed-subcat${activeSub === null ? ' feed-subcat--active' : ''}`}
            onClick={() => setActiveSub(null)}
          >
            All
          </button>
          {subs.map(s => (
            <button
              key={s.label}
              className={`feed-subcat${activeSub === s.label ? ' feed-subcat--active' : ''}`}
              onClick={() => setActiveSub(activeSub === s.label ? null : s.label)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Type filter chips ─────────────────────────── */}
      <div className="feed-chips">
        {(['news', 'podcast', 'clip'] as TypeFilter[]).map(f => (
          <button
            key={f}
            className={`feed-chip${typeFilter === f ? ' feed-chip--active' : ''}`}
            onClick={() => setTypeFilter(f)}
          >
            {f === 'podcast' ? 'Podcasts' : f === 'news' ? 'News' : 'Clips'}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="feed-scroll">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Loading{activeInterest ? ` ${INTEREST_LABELS[activeInterest] ?? activeInterest}` : ' your feed'}…</p></div>
        )}
        {!loading && error && (
          <div className="empty">
            <Icon name="feed" size={48} />
            <h3>Could not load feed</h3>
            <p>The server may be starting up. Please try again.</p>
            <button
              className="btn btn--primary"
              style={{ marginTop: '1rem' }}
              onClick={() => { cache.current.delete(activeInterest ?? 'for-you'); loadFeed(activeInterest); }}
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="empty">
            <Icon name="feed" size={48} />
            <h3>{activeSub ? `No ${activeSub} content` : 'No content yet'}</h3>
            <p>{activeSub ? `Try removing the sub-filter or check back later.` : 'The feed is being updated. Check back soon.'}</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          showGrouped ? (
            <div className="feed-groups">
              {forYouGroups.map(({ label, items: grpItems }) => (
                <section key={label} className="feed-group">
                  <h2 className="feed-group__label">
                    {label}
                    <button
                      className="feed-group__see-all"
                      onClick={() => switchInterest(
                        Object.keys(INTEREST_LABELS).find(k => INTEREST_LABELS[k] === label) ?? null
                      )}
                    >
                      See all →
                    </button>
                  </h2>
                  <div className="feed-grid">
                    {grpItems.slice(0, 4).map(item => (
                      <FeedCard key={item.id} item={item} onDetail={setDetail} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="feed-grid">
              {visible.map(item => (
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
