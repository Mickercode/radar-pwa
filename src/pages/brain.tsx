import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { getSavedItems, type SavedItem } from '../lib/saved';
import { DetailView } from '../components/DetailView';
import type { ContentItem } from '../lib/api';
import { buildGraph } from '../lib/graph';
import { KnowledgeGraph } from '../features/knowledge/KnowledgeGraph';

type Tab = 'web' | 'reminders' | 'checkin';

const CHECKIN_TABS = [
  { key: 'weekly'    as const, label: 'Weekly'    },
  { key: 'monthly'   as const, label: 'Monthly'   },
  { key: 'quarterly' as const, label: 'Quarterly' },
];

function savedToContent(s: SavedItem): ContentItem {
  return {
    id: s.id, type: s.type, title: s.title, source: s.source, duration: 0,
    thumbnailUrl: s.thumbnailUrl, audioUrl: s.audioUrl,
    articleUrl: s.articleUrl, videoUrl: s.videoUrl, createdAt: s.savedAt,
    summary: {
      id: s.id, contentId: s.id, summary: s.summary ?? '',
      keyTakeaways: s.keyTakeaways, whyItMatters: '',
      howItMattersToYou: s.howItMattersToYou, glossary: s.glossary,
    },
  };
}

function relTime(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

type WebView = 'graph' | 'list';

export function BrainPage() {
  const [tab, setTab]             = useState<Tab>('web');
  const [checkinTab, setCheckinTab] = useState<'weekly'|'monthly'|'quarterly'>('weekly');
  const [search, setSearch]       = useState('');
  const [detail, setDetail]       = useState<ContentItem | null>(null);
  const [webView, setWebView]     = useState<WebView>('list');
  const saved = getSavedItems();
  const graphData = useMemo(() => buildGraph(saved), [saved]);

  const filtered = search.trim()
    ? saved.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.summary?.toLowerCase().includes(search.toLowerCase()) ||
        s.keyTakeaways.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : saved;

  if (detail) return <DetailView item={detail} onClose={() => setDetail(null)} />;

  return (
    <div className="brain-page">
      <div className="page-head">
        <div className="page-kicker">Your second brain</div>
        <h1 className="page-title">Knowledge Web</h1>
        <p className="brain-sub">Everything you've learned, automatically connected.</p>
      </div>

      <div className="brain-tabs">
        {([['web','Web'],['reminders','Reminders'],['checkin','Check-ins']] as [Tab,string][]).map(([key, label]) => (
          <button key={key} className={`brain-tab${tab===key?' brain-tab--active':''}`} onClick={()=>setTab(key)}>{label}</button>
        ))}
      </div>

      {/* ── KNOWLEDGE WEB ── */}
      {tab === 'web' && (
        <div className="brain-content">
          {/* Stats bar */}
          <div className="brain-stats">
            <div className="brain-stat"><span className="brain-stat__n">{saved.length}</span><span className="brain-stat__l">Saved</span></div>
            <div className="brain-stat"><span className="brain-stat__n">{new Set(saved.map(s=>s.type)).size}</span><span className="brain-stat__l">Types</span></div>
            <div className="brain-stat"><span className="brain-stat__n">{saved.reduce((a,s)=>a+s.keyTakeaways.length,0)}</span><span className="brain-stat__l">Insights</span></div>
            <div className="brain-stat"><span className="brain-stat__n">{graphData.edges.length}</span><span className="brain-stat__l">Links</span></div>
          </div>

          {/* View toggle + search */}
          <div className="brain-controls">
            {saved.length > 0 && (
              <div className="brain-view-toggle">
                <button
                  className={`brain-view-btn${webView === 'graph' ? ' brain-view-btn--active' : ''}`}
                  onClick={() => setWebView('graph')}
                  aria-label="Graph view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/>
                    <line x1="12" y1="7.5" x2="5" y2="16.5"/><line x1="12" y1="7.5" x2="19" y2="16.5"/>
                  </svg>
                  Graph
                </button>
                <button
                  className={`brain-view-btn${webView === 'list' ? ' brain-view-btn--active' : ''}`}
                  onClick={() => setWebView('list')}
                  aria-label="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  List
                </button>
              </div>
            )}

            {webView === 'list' && (
              <div className="brain-search-wrap">
                <Icon name="search" size={15} className="brain-search-icon" />
                <input className="brain-search" placeholder='Ask your knowledge — e.g. "fintech in Nigeria"' value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
            )}
          </div>

          {saved.length === 0 ? (
            <div className="empty" style={{marginTop:'2rem'}}>
              <Icon name="brain" size={48} />
              <h3>Your web is empty</h3>
              <p>Save articles, podcasts and clips from your Feed. They appear here and get automatically connected.</p>
            </div>
          ) : webView === 'graph' ? (
            <div className="brain-graph-wrap">
              <KnowledgeGraph
                data={graphData}
                onSelect={(id) => {
                  const item = saved.find(s => s.id === id);
                  if (item) setDetail(savedToContent(item));
                }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty" style={{marginTop:'2rem'}}>
              <Icon name="search" size={40} /><h3>No matches</h3><p>Try different keywords.</p>
            </div>
          ) : (
            <ul className="brain-list">
              {filtered.map(item => (
                <li key={item.id} className="brain-item" onClick={()=>setDetail(savedToContent(item))}>
                  <div className="brain-item__head">
                    <span className={`brain-item__type brain-item__type--${item.type}`}>{item.type}</span>
                    <span className="brain-item__time">{relTime(item.savedAt)}</span>
                  </div>
                  <p className="brain-item__title">{item.title}</p>
                  <p className="brain-item__source">{item.source}</p>
                  {item.keyTakeaways.length > 0 && (
                    <ul className="brain-item__takes">
                      {item.keyTakeaways.slice(0,2).map((t,i)=>(
                        <li key={i}><span className="brain-bullet"/>{t}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── SMART REMINDERS ── */}
      {tab === 'reminders' && (
        <div className="brain-content">
          <p className="remind-intro">Radar surfaces your most connected insights — ideas that link to many things you already know.</p>
          {saved.length === 0 ? (
            <div className="empty" style={{marginTop:'1.5rem'}}>
              <Icon name="brain" size={48} /><h3>No reminders yet</h3>
              <p>Save insights from your feed. Radar will surface the most important ones at the right time.</p>
            </div>
          ) : (
            <ul className="brain-list" style={{marginTop:'1rem'}}>
              {saved.slice(0,5).map(item=>(
                <li key={item.id} className="brain-item brain-item--remind" onClick={()=>setDetail(savedToContent(item))}>
                  <div className="brain-item__head">
                    <span className="remind-badge">Review now</span>
                    <span className="brain-item__time">{relTime(item.savedAt)}</span>
                  </div>
                  <p className="brain-item__title">{item.title}</p>
                  {item.keyTakeaways[0] && <p className="brain-item__source">{item.keyTakeaways[0]}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── CHECK-INS ── */}
      {tab === 'checkin' && (
        <div className="brain-content">
          <div className="checkin-tabs">
            {CHECKIN_TABS.map(ct=>(
              <button key={ct.key} className={`checkin-tab${checkinTab===ct.key?' checkin-tab--active':''}`} onClick={()=>setCheckinTab(ct.key)}>{ct.label}</button>
            ))}
          </div>

          {checkinTab === 'weekly' && (
            <div className="checkin-card">
              <div className="checkin-icon">📅</div>
              <h2 className="checkin-title">This Week</h2>
              <p className="checkin-desc">New ideas you saved, strongest connections made this week, and 2–3 quick reviews.</p>
              <div className="checkin-stat-row">
                <div className="checkin-stat"><span>{saved.filter(s=>(Date.now()-new Date(s.savedAt).getTime())<7*86_400_000).length}</span><small>saved this week</small></div>
                <div className="checkin-stat"><span>{saved.reduce((a,s)=>a+s.keyTakeaways.length,0)}</span><small>total insights</small></div>
              </div>
              <p className="checkin-note">{saved.length===0?'Start saving content from your feed to get your weekly summary.':'Keep saving — your web grows stronger with every insight.'}</p>
            </div>
          )}

          {checkinTab === 'monthly' && (
            <div className="checkin-card">
              <div className="checkin-icon">📊</div>
              <h2 className="checkin-title">This Month</h2>
              <p className="checkin-desc">Main topics you're learning, which areas are strong, and suggested focus areas for next month.</p>
              {saved.length > 0 ? (
                <div className="checkin-topics">
                  {Array.from(new Set(saved.map(s=>s.type))).map(type=>(
                    <div key={type} className={`checkin-topic checkin-topic--${type}`}>
                      <span className="checkin-topic__name">{type}</span>
                      <span className="checkin-topic__count">{saved.filter(s=>s.type===type).length} saved</span>
                    </div>
                  ))}
                </div>
              ) : <p className="checkin-note">Save content from your feed to see your monthly learning map.</p>}
            </div>
          )}

          {checkinTab === 'quarterly' && (
            <div className="checkin-card">
              <div className="checkin-icon">🏆</div>
              <h2 className="checkin-title">3-Month Report</h2>
              <p className="checkin-desc">Your biggest wins, clear knowledge gaps, how much your web has grown, and what to focus on next.</p>
              {saved.length >= 5 ? (
                <div className="checkin-report">
                  <div className="checkin-report__row"><span className="checkin-report__label">Knowledge items</span><span className="checkin-report__val">{saved.length}</span></div>
                  <div className="checkin-report__row"><span className="checkin-report__label">Total insights</span><span className="checkin-report__val">{saved.reduce((a,s)=>a+s.keyTakeaways.length,0)}</span></div>
                  <div className="checkin-report__row"><span className="checkin-report__label">Content types</span><span className="checkin-report__val">{new Set(saved.map(s=>s.type)).size}</span></div>
                  <p className="checkin-note" style={{marginTop:'1rem'}}>A full AI report unlocks after 3 months of consistent saving.</p>
                </div>
              ) : <p className="checkin-note">Save at least 5 items to unlock your first quarterly report.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
