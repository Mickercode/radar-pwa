import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBrainSearch, useInsights } from '../features/insights/queries';
import { fetchSavedItems, removeSavedItem } from '../features/library/libraryApi';
import { useDueCount } from '../features/reviews/queries';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { timeAgo, durationLabel } from '../lib/format';
import type { Insight, ContentItem } from '../lib/types';

// One of the two item kinds displayed in the Brain timeline.
type BrainItem =
  | { kind: 'insight'; id: string; title: string; subtitle: string; createdAt: string; href: string; badge?: string }
  | { kind: 'saved';   id: string; title: string; subtitle: string; createdAt: string; href: string; badge?: string };

function toBrainItem(i: Insight): BrainItem {
  return {
    kind: 'insight',
    id: i.id,
    title: i.title,
    subtitle: i.what,
    createdAt: i.createdAt,
    href: `/insight/${i.id}`,
    badge: 'Insight',
  };
}

function toBrainItemFromContent(c: ContentItem): BrainItem {
  const s = c.summary;
  const blurb = s?.what ?? s?.summary ?? '';
  return {
    kind: 'saved',
    id: c.id,
    title: c.title,
    subtitle: blurb
      ? `${blurb.slice(0, 120)}${blurb.length > 120 ? '…' : ''}`
      : [c.source, durationLabel(c.duration)].filter(Boolean).join(' · '),
    createdAt: c.createdAt,
    href: `/content/${c.id}`,
    badge: c.type,
  };
}

function searchInSaved(items: ContentItem[], query: string): ContentItem[] {
  const q = query.toLowerCase();
  return items.filter((c) =>
    [c.title, c.source, c.summary?.what, c.summary?.summary]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

// Screen 3.1 — Knowledge tab. Shows insights + saved content in a timeline.
export default function Brain() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const { data: insights = [], isLoading: insightsLoading } = useInsights();
  const searchResults = useBrainSearch(q).data;
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  const { data: saved = [], isLoading: savedLoading } = useQuery({
    queryKey: ['brain-saved', userId],
    queryFn: fetchSavedItems,
    enabled: !!userId,
  });
  const { data: dueCount = 0 } = useDueCount();

  const searching = q.trim().length >= 2;

  // Merge insights + saved items into a single timeline, sorted newest first.
  const list = useMemo<BrainItem[]>(() => {
    if (searching) {
      // Search across both datasets
      const insightMatches = (searchResults ?? []).map(toBrainItem);
      const savedMatches = searchInSaved(saved, q).map(toBrainItemFromContent);
      return [...insightMatches, ...savedMatches].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    const allItems: BrainItem[] = [
      ...insights.map(toBrainItem),
      ...saved.map(toBrainItemFromContent),
    ];
    return allItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [insights, saved, searchResults, searching, q]);

  return (
    <div className="rise">
      <header className="page-head">
        <div className="page-kicker">Second brain</div>
        <h1 className="page-title">Your Brain</h1>
      </header>

      <div className="searchbar">
        <Icon name="search" size={18} />
        <input
          placeholder="What do I know about…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {!searching && (
        <div className="statrow">
          <div className="stat">
            <div className="stat__num">{insights.length}</div>
            <div className="stat__label">Insights</div>
          </div>
          <div className="stat">
            <div className="stat__num">{saved.length}</div>
            <div className="stat__label">Saved</div>
          </div>
          <button className="stat" onClick={() => navigate('/review')} style={{ cursor: 'pointer' }}>
            <div className="stat__num" style={{ color: dueCount ? 'var(--cyan)' : undefined }}>{dueCount}</div>
            <div className="stat__label">Due now →</div>
          </button>
          <button className="stat" onClick={() => navigate('/weekly')} style={{ cursor: 'pointer' }}>
            <div className="stat__num">★</div>
            <div className="stat__label">This week →</div>
          </button>
        </div>
      )}

      {insightsLoading && savedLoading ? (
        <div className="stack">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>{searching ? 'No matches' : 'Your brain is empty'}</h3>
          <p>{searching ? 'Try another word.' : 'Save content from the feed or capture a link to start building.'}</p>
        </div>
      ) : (
        <div className="stack">
          {list.map((item) => (
            <div key={`${item.kind}:${item.id}`} className="listrow" style={{ cursor: 'default', padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => navigate(item.href)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: '0.9rem 1rem',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minWidth: 0,
                }}
              >
                <div className="listrow__main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span className="listrow__title" style={{ flex: 1 }}>{item.title}</span>
                    {item.badge && <span className={`badge ${item.kind === 'insight' ? 'badge--insight' : 'badge--saved'}`}>{item.badge}</span>}
                  </div>
                  <div className="listrow__sub">{item.subtitle}</div>
                  <div className="listrow__sub" style={{ color: 'var(--text-faint)' }}>{timeAgo(item.createdAt)}</div>
                </div>
                <Icon name="right" size={18} className="listrow__chev" />
              </button>
              {item.kind === 'saved' && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await removeSavedItem(item.id);
                      qc.invalidateQueries({ queryKey: ['brain-saved', userId] });
                      toast('Removed from saved', 'x');
                    } catch {
                      toast('Could not remove', 'x');
                    }
                  }}
                  className="listrow__remove"
                  title="Remove from saved"
                  aria-label="Remove from saved"
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
