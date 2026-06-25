import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBrainSearch, useInsights } from '../features/insights/queries';
import {
  useKnowledgeWebGaps,
  useKnowledgeWebGrowth,
  useKnowledgeWebStats,
} from '../features/brain/queries';
import { fetchSavedItems, removeSavedItem } from '../features/library/libraryApi';
import { useDueCount } from '../features/reviews/queries';
import { useAuth } from '../stores/auth';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { timeAgo, durationLabel } from '../lib/format';
import { mockEdges, mockInsights as mockGraphInsights } from '../features/brain/mockKnowledgeWeb';
import { DEMO_MODE } from '../lib/demo';
import type { Insight, ContentItem, InsightEdge } from '../lib/types';
import './brain.css';

// ── Helpers ────────────────────────────────────────────────────────────────────

type BrainItem =
  | { kind: 'insight'; id: string; title: string; subtitle: string; createdAt: string; href: string; badge?: string }
  | { kind: 'saved';   id: string; title: string; subtitle: string; createdAt: string; href: string; badge?: string };

function toBrainItem(i: Insight): BrainItem {
  return {
    kind: 'insight', id: i.id, title: i.title, subtitle: i.what,
    createdAt: i.createdAt, href: `/insight/${i.id}`, badge: 'Insight',
  };
}

function toBrainItemFromContent(c: ContentItem): BrainItem {
  const s = c.summary;
  const blurb = s?.what ?? s?.summary ?? '';
  return {
    kind: 'saved', id: c.id, title: c.title,
    subtitle: blurb
      ? `${blurb.slice(0, 120)}${blurb.length > 120 ? '…' : ''}`
      : [c.source, durationLabel(c.duration)].filter(Boolean).join(' · '),
    createdAt: c.createdAt, href: `/content/${c.id}`, badge: c.type,
  };
}

function searchInSaved(items: ContentItem[], query: string): ContentItem[] {
  const q = query.toLowerCase();
  return items.filter((c) =>
    [c.title, c.source, c.summary?.what, c.summary?.summary]
      .filter(Boolean).join(' ').toLowerCase().includes(q),
  );
}

// ── SVG Knowledge Graph ─────────────────────────────────────────────────────────

function KnowledgeGraph({
  insights,
  edges,
  onNodeClick,
}: {
  insights: Insight[];
  edges: InsightEdge[];
  onNodeClick: (id: string) => void;
}) {
  const nodeRadius = 28;
  const width = 600;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;

  // Simple circular layout: spread nodes evenly around the center
  const nodes = useMemo(() => {
    const count = Math.min(insights.length, 8);
    const active = count < 2 ? insights.slice(0, count) : insights.slice(0, count);
    return active.map((insight, i) => {
      const angle = (i / Math.max(active.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(90, 40 + active.length * 12);
      return {
        ...insight,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
  }, [insights, cx, cy]);

  // Edges between visible nodes
  const visibleIds = new Set(nodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleIds.has(e.fromInsightId) && visibleIds.has(e.toInsightId),
  );

  if (nodes.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="kw-graph" aria-label="Knowledge graph">
      {/* Edges */}
      {visibleEdges.map((e) => {
        const from = nodes.find((n) => n.id === e.fromInsightId);
        const to = nodes.find((n) => n.id === e.toInsightId);
        if (!from || !to) return null;
        const opacity = Math.max(0.2, Number(e.strength));
        return (
          <line
            key={e.id}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke="var(--cyan)"
            strokeWidth={Math.max(1, opacity * 3)}
            strokeOpacity={opacity}
            className="kw-graph__edge"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <g
          key={n.id}
          className="kw-graph__node"
          onClick={() => onNodeClick(n.id)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={n.x} cy={n.y} r={nodeRadius}
            fill={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--bg-2)'}
            fillOpacity={n.tier === 1 ? 0.25 : 0.18}
            stroke={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--border-strong)'}
            strokeWidth={n.tier === 1 ? 2.5 : 1.5}
          />
          <circle
            cx={n.x} cy={n.y} r={4}
            fill={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--text-faint)'}
          />
          <text
            x={n.x} y={n.y + nodeRadius + 14}
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize={9}
            className="kw-graph__label"
          >
            {n.title.length > 20 ? n.title.slice(0, 18) + '…' : n.title}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Growth Chart ───────────────────────────────────────────────────────────────

function GrowthChart({ weeks }: { weeks: { weekStart: string; insightCount: number; edgeCount: number }[] }) {
  const maxVal = Math.max(1, ...weeks.map((w) => w.insightCount));
  const barW = 28;
  const gap = 6;
  const chartH = 120;
  const pad = { t: 8, r: 4, b: 20, l: 4 };
  const w = weeks.length * (barW + gap) + pad.l + pad.r;

  return (
    <svg viewBox={`0 0 ${w} ${chartH}`} className="kw-chart" aria-label="Knowledge growth chart" style={{ maxHeight: chartH }}>
      {weeks.map((wk, i) => {
        const x = pad.l + i * (barW + gap);
        const h = (wk.insightCount / maxVal) * (chartH - pad.t - pad.b);
        const y = chartH - pad.b - h;
        const label = new Date(wk.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return (
          <g key={wk.weekStart}>
            <rect
              x={x} y={y} width={barW} height={Math.max(h, 2)}
              rx={4}
              fill="var(--cyan)"
              fillOpacity={0.7}
            >
              <title>{wk.insightCount} insight{wk.insightCount !== 1 ? 's' : ''} · {label}</title>
            </rect>
            {wk.edgeCount > 0 && (
              <rect
                x={x + barW - 6} y={chartH - pad.b - (wk.edgeCount / maxVal) * (chartH - pad.t - pad.b)}
                width={5}
                height={Math.max((wk.edgeCount / maxVal) * (chartH - pad.t - pad.b), 2)}
                rx={2}
                fill="var(--lime)"
                fillOpacity={0.8}
              >
                <title>{wk.edgeCount} connection{wk.edgeCount !== 1 ? 's' : ''}</title>
              </rect>
            )}
            {i > 0 && i % 3 === 0 && (
              <text x={x + barW / 2} y={chartH - 4} textAnchor="middle" fill="var(--text-faint)" fontSize={7}>
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────────

export default function Brain() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'timeline'>('overview');
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
  const { data: stats } = useKnowledgeWebStats();
  const { data: gaps } = useKnowledgeWebGaps();
  const { data: growth } = useKnowledgeWebGrowth();

  const searching = q.trim().length >= 2;

  // Merged timeline
  const list = useMemo<BrainItem[]>(() => {
    if (searching) {
      const insightMatches = (searchResults ?? []).map(toBrainItem);
      const savedMatches = searchInSaved(saved, q).map(toBrainItemFromContent);
      return [...insightMatches, ...savedMatches].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return [
      ...insights.map(toBrainItem),
      ...saved.map(toBrainItemFromContent),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [insights, saved, searchResults, searching, q]);

  // Graph data for knowledge map
  const graphInsights = useMemo(() => {
    if (DEMO_MODE) return mockGraphInsights;
    return insights;
  }, [insights]);

  const graphEdges = useMemo(() => {
    if (DEMO_MODE) return mockEdges;
    return []; // Will come from a future full-graph endpoint
  }, []);

  const loading = insightsLoading && savedLoading;

  return (
    <div className="rise">
      {/* ── Header ──────────────────────────────────────────────────────────────── */}
      <header className="kw-header">
        <div className="page-kicker">Understand once. Remember forever.</div>
        <h1 className="page-title kw-title">
          Your Knowledge Web
        </h1>
        <p className="page-sub">
          {stats
            ? `${stats.totalInsights} insights · ${stats.totalEdges} connections${stats.activeStreakDays > 1 ? ` · ${stats.activeStreakDays}-day streak` : ''}`
            : 'A connected web of everything you\'ve learned.'}
        </p>
      </header>

      {/* ── Stats dashboard ──────────────────────────────────────────────────────── */}
      {stats && (
        <div className="kw-stats">
          <div className="kw-stat">
            <div className="kw-stat__num">{stats.totalInsights}</div>
            <div className="kw-stat__label">Insights</div>
          </div>
          <div className="kw-stat">
            <div className="kw-stat__num">{stats.totalEdges}</div>
            <div className="kw-stat__label">Connections</div>
          </div>
          <div className="kw-stat kw-stat--accent">
            <div className="kw-stat__num">{stats.newThisWeek > 0 ? `+${stats.newThisWeek}` : '0'}</div>
            <div className="kw-stat__label">This week</div>
          </div>
          <button className="kw-stat kw-stat--clickable" onClick={() => navigate('/review')}>
            <div className="kw-stat__num" style={{ color: dueCount ? 'var(--cyan)' : 'var(--text-faint)' }}>
              {dueCount}
            </div>
            <div className="kw-stat__label">Due now →</div>
          </button>
        </div>
      )}

      {!stats && (
        <div className="kw-stats">
          <div className="kw-stat"><div className="kw-stat__num">{insights.length}</div><div className="kw-stat__label">Insights</div></div>
          <div className="kw-stat"><div className="kw-stat__num">{saved.length}</div><div className="kw-stat__label">Saved</div></div>
          <button className="kw-stat kw-stat--clickable" onClick={() => navigate('/review')}>
            <div className="kw-stat__num" style={{ color: dueCount ? 'var(--cyan)' : undefined }}>{dueCount}</div>
            <div className="kw-stat__label">Due now →</div>
          </button>
          <button className="kw-stat kw-stat--clickable" onClick={() => navigate('/weekly')}>
            <div className="kw-stat__num">★</div>
            <div className="kw-stat__label">This week →</div>
          </button>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <div className="kw-tabs">
        <button
          className={`kw-tab${activeTab === 'overview' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Icon name="feed" size={16} /> Overview
        </button>
        <button
          className={`kw-tab${activeTab === 'graph' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          <Icon name="link" size={16} /> Map
        </button>
        <button
          className={`kw-tab${activeTab === 'timeline' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Icon name="brain" size={16} /> Timeline
        </button>
      </div>

      {/* ── Search bar (always visible) ────────────────────────────────────────────── */}
      <div className="searchbar" style={{ marginTop: '0.75rem' }}>
        <Icon name="search" size={18} />
        <input
          placeholder="What do I know about…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {searching && (
          <button className="kw-search-clear" onClick={() => setQ('')} aria-label="Clear search">
            <Icon name="x" size={16} />
          </button>
        )}
      </div>

      {/* ── Tab: Overview ─────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && !searching && (
        <div className="kw-overview">
          {/* Knowledge Map */}
          {graphInsights.length >= 2 && (
            <section className="kw-section">
              <div className="kw-section__head">
                <h3 className="kw-section__title">Knowledge Map</h3>
                <button className="kw-section__action" onClick={() => setActiveTab('graph')}>
                  Expand <Icon name="right" size={14} />
                </button>
              </div>
              <div className="kw-section__body">
                <KnowledgeGraph
                  insights={graphInsights}
                  edges={graphEdges}
                  onNodeClick={(id) => navigate(`/insight/${id}`)}
                />
              </div>
            </section>
          )}

          {/* Growth chart */}
          {growth && growth.weeks.some((w) => w.insightCount > 0) && (
            <section className="kw-section">
              <div className="kw-section__head">
                <h3 className="kw-section__title">Weekly Growth</h3>
              </div>
              <div className="kw-section__body">
                <GrowthChart weeks={growth.weeks} />
              </div>
            </section>
          )}

          {/* Top tags */}
          {stats && stats.topTags.length > 0 && (
            <section className="kw-section">
              <div className="kw-section__head">
                <h3 className="kw-section__title">Top Topics</h3>
              </div>
              <div className="kw-tags-row">
                {stats.topTags.map((t) => (
                  <span key={t.tag} className="badge badge--insight">
                    #{t.tag}
                    <span className="kw-tag-count">{t.count}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Knowledge gaps */}
          {gaps && gaps.gaps.length > 0 && (
            <section className="kw-section">
              <div className="kw-section__head">
                <h3 className="kw-section__title">
                  <span className="kw-gap-icon">🔍</span> Knowledge Gaps
                </h3>
              </div>
              <div className="kw-section__body">
                {gaps.gaps.map((g) => (
                  <div key={g.topic} className="kw-gap">
                    <div className="kw-gap__head">
                      <span className="badge">#{g.topic}</span>
                      <span className="kw-gap__meta">
                        {g.insightCount} insight{g.insightCount !== 1 ? 's' : ''} · tier {g.avgTier.toFixed(1)}
                      </span>
                    </div>
                    <p className="kw-gap__tip">{g.suggestion}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {loading ? (
            <div className="kw-loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60, marginBottom: '0.6rem' }} />
              ))}
            </div>
          ) : graphInsights.length === 0 && saved.length === 0 ? (
            <div className="empty" style={{ minHeight: '30vh' }}>
              <h3>Your knowledge web is empty</h3>
              <p>Save content from the feed or capture a link to start building your web.</p>
              <button className="btn btn--primary" onClick={() => navigate('/capture')}>
                <Icon name="capture" size={18} /> Capture something
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Tab: Map (full graph view) ───────────────────────────────────────── */}
      {activeTab === 'graph' && !searching && (
        <div className="kw-graph-view">
          {graphInsights.length >= 2 ? (
            <>
              <div className="kw-graph-view__canvas">
                <svg viewBox="0 0 800 400" className="kw-graph-full">
                  {(() => {
                    const count = Math.min(graphInsights.length, 12);
                    const nodes = graphInsights.slice(0, count).map((insight, i) => {
                      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                      const radius = 160;
                      return { ...insight, x: 400 + Math.cos(angle) * radius, y: 200 + Math.sin(angle) * radius };
                    });
                    const ids = new Set(nodes.map((n) => n.id));
                    const edges = graphEdges.filter((e) => ids.has(e.fromInsightId) && ids.has(e.toInsightId));
                    return (
                      <>
                        {edges.map((e) => {
                          const from = nodes.find((n) => n.id === e.fromInsightId);
                          const to = nodes.find((n) => n.id === e.toInsightId);
                          if (!from || !to) return null;
                          return (
                            <line
                              key={e.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                              stroke="var(--cyan)" strokeWidth={Math.max(1, Number(e.strength) * 3)}
                              strokeOpacity={Math.max(0.15, Number(e.strength))}
                            />
                          );
                        })}
                        {nodes.map((n) => (
                          <g
                            key={n.id} className="kw-graph__node"
                            onClick={() => navigate(`/insight/${n.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <circle
                              cx={n.x} cy={n.y} r={36}
                              fill={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--bg-2)'}
                              fillOpacity={0.12}
                              stroke={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--border-strong)'}
                              strokeWidth={n.tier === 1 ? 2.5 : 1.5}
                            />
                            <circle
                              cx={n.x} cy={n.y} r={5}
                              fill={n.tier === 1 ? 'var(--amber)' : n.tier === 2 ? 'var(--cyan)' : 'var(--text-faint)'}
                            />
                            <text
                              x={n.x} y={n.y + 52} textAnchor="middle"
                              fill="var(--text)" fontSize={10} fontWeight={600}
                            >
                              {n.title.length > 22 ? n.title.slice(0, 20) + '…' : n.title}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <p className="kw-graph-view__hint">
                Click a node to view that insight. Connected insights are linked by lines — thicker means stronger connection.
              </p>
            </>
          ) : (
            <div className="empty" style={{ minHeight: '20vh' }}>
              <h3>Not enough to map yet</h3>
              <p>Save at least 2 insights to see your knowledge map.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Timeline / Search results ──────────────────────────────────── */}
      {(activeTab === 'timeline' || searching) && (
        <div className="kw-timeline">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 72, marginBottom: '0.6rem' }} />
            ))
          ) : list.length === 0 ? (
            <div className="empty">
              <h3>{searching ? 'No matches' : 'Your timeline is empty'}</h3>
              <p>{searching ? 'Try another word.' : 'Start capturing insights to build your knowledge.'}</p>
            </div>
          ) : (
            <div className="stack">
              {list.map((item) => (
                <div
                  key={`${item.kind}:${item.id}`}
                  className="listrow"
                  style={{ cursor: 'default', padding: 0, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => navigate(item.href)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '0.9rem',
                      padding: '0.9rem 1rem', background: 'none', border: 'none',
                      color: 'inherit', cursor: 'pointer', textAlign: 'left', minWidth: 0,
                    }}
                  >
                    <div className="listrow__main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span className="listrow__title" style={{ flex: 1 }}>{item.title}</span>
                        {item.badge && (
                          <span className={`badge ${item.kind === 'insight' ? 'badge--insight' : 'badge--saved'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="listrow__sub">{item.subtitle}</div>
                      <div className="listrow__sub" style={{ color: 'var(--text-faint)', fontSize: '0.65rem', marginTop: '0.1rem' }}>
                        {timeAgo(item.createdAt)}
                      </div>
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
      )}
    </div>
  );
}
