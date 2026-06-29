import { useState, useCallback, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { type SavedItem, getSavedItems, unsaveItem, syncSavedFromBE } from '../lib/saved';
import { useAuth } from '../lib/auth';

type Filter = 'all' | 'news' | 'podcast' | 'clip';
type View   = 'list' | 'detail';

const TYPE_LABELS: Record<string, string> = { news: 'Article', podcast: 'Podcast', clip: 'Clip' };
const TYPE_ICONS  = { news: 'feed', podcast: 'headphones', clip: 'play' } as const;

// ── Date grouping ─────────────────────────────────────────────────────────────

function dayLabel(iso: string): string {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff <= 6)  return d.toLocaleDateString('en-NG', { weekday: 'long' });
  if (diff <= 29) return 'This Month';
  return d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

function groupByDay(items: SavedItem[]): { label: string; items: SavedItem[] }[] {
  const groups: Record<string, SavedItem[]> = {};
  for (const item of items) {
    const label = dayLabel(item.savedAt);
    (groups[label] ??= []).push(item);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KnowledgePage() {
  const token = useAuth(s => s.token);
  const [items,    setItems]    = useState<SavedItem[]>(() => getSavedItems());
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<SavedItem | null>(null);
  const [view,     setView]     = useState<View>('list');
  const [filter,   setFilter]   = useState<Filter>('all');
  const [search,   setSearch]   = useState('');

  // Refresh from BE on mount
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    syncSavedFromBE().then(() => {
      setItems(getSavedItems());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const refresh = () => setItems(getSavedItems());

  const filtered = items
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => {
      const q = search.toLowerCase();
      if (!q) return true;
      return i.title.toLowerCase().includes(q)
          || i.source.toLowerCase().includes(q)
          || (i.summary ?? '').toLowerCase().includes(q)
          || i.keyTakeaways.some(t => t.toLowerCase().includes(q));
    });

  const groups = groupByDay(filtered);
  const counts = {
    all:     items.length,
    news:    items.filter(i => i.type === 'news').length,
    podcast: items.filter(i => i.type === 'podcast').length,
    clip:    items.filter(i => i.type === 'clip').length,
  };

  const openItem = useCallback((item: SavedItem) => {
    setSelected(item);
    setView('detail');
  }, []);

  const handleUnsave = useCallback((id: string) => {
    unsaveItem(id);
    refresh();
    if (selected?.id === id) { setView('list'); setSelected(null); }
  }, [selected]);

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <div className="kn kn--detail">
        <div className="kn__detail-bar">
          <button className="icon-btn" onClick={() => { setView('list'); setSelected(null); }} aria-label="Back">
            <Icon name="left" size={20} />
          </button>
          <span className={`kn__badge kn__badge--${selected.type}`}>
            <Icon name={TYPE_ICONS[selected.type]} size={12} />
            {TYPE_LABELS[selected.type]}
          </span>
          <button
            className="icon-btn kn__unsave-btn"
            onClick={() => handleUnsave(selected.id)}
            aria-label="Remove from saved"
          >
            <Icon name="trash" size={18} />
          </button>
        </div>

        <div className="kn__detail-scroll">
          {selected.thumbnailUrl && (
            <img src={selected.thumbnailUrl} alt="" className="kn__detail-hero" loading="lazy" />
          )}

          <div className="kn__detail-body">
            <p className="kn__detail-meta">
              <span className="kn__detail-source">{selected.source}</span>
              <span className="kn__detail-dot">·</span>
              <span>{relTime(selected.savedAt)}</span>
            </p>
            <h1 className="kn__detail-title">{selected.title}</h1>

            {selected.summary && (
              <p className="kn__detail-summary">{selected.summary}</p>
            )}

            {selected.keyTakeaways.length > 0 && (
              <section className="kn__section">
                <h2 className="kn__section-h">Key Takeaways</h2>
                <ul className="kn__takeaways">
                  {selected.keyTakeaways.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {selected.howItMattersToYou && (
              <section className="kn__section">
                <h2 className="kn__section-h">Why It Matters to You</h2>
                <p className="kn__prose">{selected.howItMattersToYou}</p>
              </section>
            )}

            {selected.glossary.length > 0 && (
              <section className="kn__section">
                <h2 className="kn__section-h">Glossary</h2>
                {selected.glossary.map((entry, i) => {
                  const [term, ...def] = entry.split(':');
                  return (
                    <div key={i} className="kn__gloss">
                      <span className="kn__gloss-term">{term?.trim()}</span>
                      <span className="kn__gloss-def">{def.join(':').trim()}</span>
                    </div>
                  );
                })}
              </section>
            )}

            {(selected.articleUrl || selected.audioUrl || selected.videoUrl) && (
              <a
                href={selected.articleUrl ?? selected.videoUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="kn__read-btn btn btn--primary"
              >
                <Icon name="link" size={16} />
                {selected.type === 'podcast' ? 'Listen now' : selected.type === 'clip' ? 'Watch clip' : 'Read full article'}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="kn">
      {/* Header */}
      <div className="kn__head">
        <div className="page-kicker">What you've saved</div>
        <h1 className="page-title">My Knowledge</h1>
        {items.length > 0 && (
          <p className="kn__count">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Search */}
      <div className="kn__search-wrap">
        <Icon name="search" size={16} className="kn__search-icon" />
        <input
          className="kn__search"
          type="search"
          placeholder="Search your saved items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="kn__search-clear" onClick={() => setSearch('')} aria-label="Clear search">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="kn__filters">
        {(['all', 'news', 'podcast', 'clip'] as Filter[]).map(f => (
          <button
            key={f}
            className={`kn__filter-tab${filter === f ? ' kn__filter-tab--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'news' ? 'Articles' : f === 'podcast' ? 'Podcasts' : 'Clips'}
            {counts[f] > 0 && <span className="kn__filter-count">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && items.length === 0 ? (
        <div className="feed-loading">
          <div className="feed-spinner" />
          <p>Loading your saved items…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="kn__empty">
          <div className="kn__empty-icon">
            <Icon name="bookmark" size={40} />
          </div>
          <h3>{search || filter !== 'all' ? 'No matches' : 'Nothing saved yet'}</h3>
          <p>
            {search
              ? 'Try a different search.'
              : filter !== 'all'
              ? `You haven't saved any ${filter === 'news' ? 'articles' : filter + 's'} yet.`
              : 'When you save articles, podcasts, or clips from your feed, they appear here — ready to read anytime.'}
          </p>
        </div>
      ) : (
        <div className="kn__groups">
          {groups.map(group => (
            <div key={group.label} className="kn__group">
              <p className="kn__group-label">{group.label}</p>
              <ul className="kn__list">
                {group.items.map(item => (
                  <li key={item.id} className="kn__card" onClick={() => openItem(item)}>
                    {/* Left: type badge + content */}
                    <div className="kn__card-body">
                      <div className="kn__card-top">
                        <span className={`kn__badge kn__badge--${item.type}`}>
                          <Icon name={TYPE_ICONS[item.type]} size={11} />
                          {TYPE_LABELS[item.type]}
                        </span>
                        <span className="kn__card-time">{relTime(item.savedAt)}</span>
                      </div>

                      <p className="kn__card-title">{item.title}</p>
                      <p className="kn__card-source">{item.source}</p>

                      {/* First takeaway as preview — instant value on the card */}
                      {item.keyTakeaways[0] && (
                        <p className="kn__card-insight">
                          <span className="kn__card-insight-dot">→</span>
                          {item.keyTakeaways[0]}
                        </p>
                      )}
                    </div>

                    {/* Right: thumbnail */}
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="kn__card-thumb" loading="lazy" />
                    ) : (
                      <div className={`kn__card-thumb-placeholder kn__card-thumb-placeholder--${item.type}`}>
                        <Icon name={TYPE_ICONS[item.type]} size={22} />
                      </div>
                    )}

                    {/* Quick-delete button */}
                    <button
                      className="kn__card-remove"
                      onClick={e => { e.stopPropagation(); handleUnsave(item.id); }}
                      aria-label="Remove"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
