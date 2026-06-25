import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { usePlayer } from '../stores/player';
import { useSaveInsight } from '../features/insights/queries';
import { useToast } from '../components/Toast';
import type { PodcastFeed, PodcastEpisode } from '../lib/types';
import {
  searchPodcasts,
  getEpisodes,
  getRecommendedPodcasts,
  episodeToPlayable,
} from '../features/podcasts/podcastApi';
import './podcasts.css';

type View = 'browse' | 'search' | 'podcast';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#00c2cb',
  Business: '#f59e0b',
  Science: '#8b5cf6',
  Politics: '#ef4444',
  Climate: '#10b981',
  Health: '#ec4899',
  Sports: '#3b82f6',
  Music: '#f97316',
  Film: '#a855f7',
  Travel: '#14b8a6',
  Fashion: '#e11d48',
  Education: '#6366f1',
  Philosophy: '#d946ef',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function timeAgo(ts: number): string {
  const days = Math.floor((Date.now() / 1000 - ts) / 86400);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function Podcasts() {
  const navigate = useNavigate();
  const play = usePlayer((s) => s.play);

  // View state
  const [view, setView] = useState<View>('browse');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PodcastFeed[]>([]);
  const [searching, setSearching] = useState(false);

  // Podcast detail state
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastFeed | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Recommended podcasts
  const [recommended] = useState(getRecommendedPodcasts);

  // Group recommended by category
  const categories = recommended.reduce<Record<string, RecommendedPodcast[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  // ── Search ─────────────────────────────────────────────────────────────────

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setSearching(true);
    setView('search');
    try {
      const result = await searchPodcasts(q, 30);
      setSearchResults(result.feeds);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  // ── Podcast detail ─────────────────────────────────────────────────────────

  const openPodcast = useCallback(async (feed: PodcastFeed) => {
    setSelectedPodcast(feed);
    setView('podcast');
    setLoadingEpisodes(true);
    try {
      const result = await getEpisodes(feed.id, 30);
      setEpisodes(result.items);
    } catch {
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  }, []);

  const playEpisode = useCallback(
    (ep: PodcastEpisode) => {
      // In mock/demo mode, audioUrl is empty — just navigate to player anyway
      const item = episodeToPlayable(ep);
      play(item);
      navigate('/player');
    },
    [play, navigate],
  );

  // ── Save to Brain modal ───────────────────────────────────────────────────

  const save = useSaveInsight();
  const { toast } = useToast();
  const [savingEpisode, setSavingEpisode] = useState<PodcastEpisode | null>(null);
  const [saveForm, setSaveForm] = useState({ what: '', why: '', edge: '' });

  const openSaveModal = useCallback((ep: PodcastEpisode) => {
    setSavingEpisode(ep);
    setSaveForm({ what: '', why: '', edge: '' });
  }, []);

  const closeSaveModal = useCallback(() => {
    setSavingEpisode(null);
    setSaveForm({ what: '', why: '', edge: '' });
  }, []);

  const handleSave = useCallback(async () => {
    if (!savingEpisode) return;
    const { what, why, edge } = saveForm;
    if (!what.trim()) return;

    try {
      await save.mutateAsync({
        title: savingEpisode.title,
        what: what.trim(),
        why: why.trim() || 'Insight from a podcast episode worth remembering.',
        edge: edge.trim() || 'Review this idea and think about how it applies to your context.',
        tags: [savingEpisode.feedTitle.toLowerCase().replace(/\s+/g, '-')],
      });
      toast('Saved to your Brain', 'check');
      closeSaveModal();
    } catch {
      toast('Failed to save. Try again.', 'x');
    }
  }, [savingEpisode, saveForm, save, toast, closeSaveModal]);

  // ── Back navigation ────────────────────────────────────────────────────────

  const goBack = () => {
    if (view === 'podcast') {
      setSelectedPodcast(null);
      setEpisodes([]);
      setView(query ? 'search' : 'browse');
    } else if (view === 'search') {
      setQuery('');
      setSearchResults([]);
      setView('browse');
    }
  };



  // ── Render ──────────────────────────────────────────────────────────────────

  const renderSearchBar = () => (
    <form className="pod-search" onSubmit={handleSearchSubmit}>
      <div className="pod-search__input-wrap">
        <Icon name="search" size={18} />
        <input
          className="pod-search__input"
          type="text"
          placeholder="Search any podcast..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={view !== 'browse'}
        />
        {query && (
          <button type="button" className="pod-search__clear" onClick={() => { setQuery(''); setView('browse'); }}>
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      <button type="submit" className="pod-search__btn">Search</button>
    </form>
  );

  const renderHeader = () => {
    if (view === 'podcast') {
      return (
        <div className="subhead">
          <button className="backbtn" onClick={goBack} aria-label="Back">
            <Icon name="left" size={20} />
          </button>
          <span className="page-kicker">{selectedPodcast?.title ?? 'Podcast'}</span>
        </div>
      );
    }
    return (
      <div className="subhead">
        {view === 'search' ? (
          <button className="backbtn" onClick={goBack} aria-label="Back">
            <Icon name="left" size={20} />
          </button>
        ) : (
          <span className="page-kicker">Podcasts</span>
        )}
      </div>
    );
  };

  // ── Browse view ──────────────────────────────────────────────────────────────

  const renderBrowse = () => (
    <div className="pod-browse">
      <div className="pod-browse__hero">
        <h1 className="pod-browse__title">Discover Podcasts</h1>
        <p className="pod-browse__sub">Search millions of shows or browse curated picks. Tap an episode to listen instantly.</p>
      </div>

      {Object.entries(categories).map(([cat, podcasts]) => (
        <section key={cat} className="pod-section">
          <div className="pod-section__header">
            <span
              className="pod-section__dot"
              style={{ background: CATEGORY_COLORS[cat] ?? '#5a6378' }}
            />
            <h2 className="pod-section__title">{cat}</h2>
          </div>
          <div className="pod-section__grid">
            {podcasts.map((p) => (
              <button
                key={p.id}
                className="pod-card"
                onClick={() =>
                  openPodcast({
                    id: p.id,
                    title: p.title,
                    url: p.feedUrl,
                    image: p.image,
                    description: p.description,
                    author: p.author,
                    language: 'en',
                    categories: { [cat]: cat },
                  })
                }
              >
                <div
                  className="pod-card__art"
                  style={{ background: `radial-gradient(circle at 30% 20%, ${CATEGORY_COLORS[cat] ?? '#00c2cb'}44, #121216)` }}
                >
                  <Icon name="headphones" size={28} />
                </div>
                <div className="pod-card__body">
                  <h3 className="pod-card__title">{p.title}</h3>
                  <p className="pod-card__author">{p.author}</p>
                  <p className="pod-card__desc">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  // ── Search results view ────────────────────────────────────────────────────

  const renderSearchResults = () => (
    <div className="pod-results">
      {searching ? (
        <div className="pod-results__loading">
          <div className="loader" />
          <p>Searching podcasts...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="pod-results__empty">
          <Icon name="search" size={40} />
          <p>No podcasts found for "{query}"</p>
          <p className="pod-results__hint">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="pod-results__count">{searchResults.length} result{searchResults.length > 1 ? 's' : ''}</p>
          <div className="pod-results__list">
            {searchResults.map((feed) => (
              <button
                key={feed.id}
                className="pod-result-card"
                onClick={() => openPodcast(feed)}
              >
                <div className="pod-result-card__art">
                  <Icon name="headphones" size={24} />
                </div>
                <div className="pod-result-card__body">
                  <h3 className="pod-result-card__title">{feed.title}</h3>
                  {feed.author && <p className="pod-result-card__author">{feed.author}</p>}
                  <p className="pod-result-card__desc">{feed.description}</p>
                  {feed.language && <span className="pod-result-card__lang">{feed.language}</span>}
                </div>
                <Icon name="right" size={16} className="pod-result-card__arrow" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ── Podcast detail view ─────────────────────────────────────────────────────

  const renderPodcastDetail = () => {
    if (!selectedPodcast) return null;
    return (
      <div className="pod-detail">
        <div className="pod-detail__header">
          <div className="pod-detail__art">
            <Icon name="headphones" size={48} />
          </div>
          <div className="pod-detail__info">
            <h1 className="pod-detail__title">{selectedPodcast.title}</h1>
            {selectedPodcast.author && <p className="pod-detail__author">{selectedPodcast.author}</p>}
            <p className="pod-detail__desc">{selectedPodcast.description}</p>
          </div>
        </div>

        <h2 className="pod-detail__episodes-heading">Episodes</h2>

        {loadingEpisodes ? (
          <div className="pod-detail__loading">
            <div className="loader" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="pod-detail__empty">
            <p>No episodes available</p>
            <p className="pod-results__hint">Episodes will appear when the Podcast Index API is connected</p>
          </div>
        ) : (
          <div className="pod-detail__episodes">
            {episodes.map((ep) => (
              <div key={ep.id} className="pod-episode-wrap">
                <button
                  className="pod-episode"
                  onClick={() => playEpisode(ep)}
                >
                  <div className="pod-episode__play-btn">
                    <Icon name="play" size={12} />
                  </div>
                  <div className="pod-episode__body">
                    <h3 className="pod-episode__title">{ep.title}</h3>
                    <div className="pod-episode__meta">
                      <span>{timeAgo(ep.datePublished)}</span>
                      <span className="pod-episode__dot">·</span>
                      <span>{formatDuration(ep.duration)}</span>
                    </div>
                  </div>
                </button>
                <button
                  className="pod-episode__save"
                  onClick={(e) => { e.stopPropagation(); openSaveModal(ep); }}
                  aria-label="Save to Brain"
                >
                  <Icon name="save" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Save modal ──────────────────────────────────────────────────────────────

  const renderSaveModal = () => {
    if (!savingEpisode) return null;
    return (
      <div className="pod-save-overlay" onClick={closeSaveModal}>
        <div className="pod-save" onClick={(e) => e.stopPropagation()}>
          <div className="pod-save__header">
            <h2 className="pod-save__title">Save to Brain</h2>
            <button className="pod-save__close" onClick={closeSaveModal}>
              <Icon name="x" size={18} />
            </button>
          </div>

          <p className="pod-save__ep-title">{savingEpisode.title}</p>

          <div className="pod-save__form">
            <div className="pod-save__field">
              <label className="pod-save__label">
                <span className="dot" /> What — the key idea
              </label>
              <textarea
                className="pod-save__area"
                placeholder="What did you learn from this episode?"
                rows={3}
                value={saveForm.what}
                onChange={(e) => setSaveForm((f) => ({ ...f, what: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="pod-save__field">
              <label className="pod-save__label">
                <span className="dot" style={{ background: 'var(--purple)' }} /> Why — why it matters
              </label>
              <textarea
                className="pod-save__area"
                placeholder="Why does this matter in your context?"
                rows={2}
                value={saveForm.why}
                onChange={(e) => setSaveForm((f) => ({ ...f, why: e.target.value }))}
              />
            </div>

            <div className="pod-save__field">
              <label className="pod-save__label">
                <span className="dot" style={{ background: 'var(--amber)' }} /> Edge — what to do
              </label>
              <textarea
                className="pod-save__area"
                placeholder="What's one action or decision this changes?"
                rows={2}
                value={saveForm.edge}
                onChange={(e) => setSaveForm((f) => ({ ...f, edge: e.target.value }))}
              />
            </div>

            <button
              className="btn btn--primary btn--block"
              disabled={save.isPending || !saveForm.what.trim()}
              onClick={handleSave}
            >
              <Icon name="save" size={18} />
              {save.isPending ? 'Saving…' : 'Save insight'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rise">
      {renderHeader()}
      {renderSearchBar()}
      {view === 'browse' && renderBrowse()}
      {view === 'search' && renderSearchResults()}
      {view === 'podcast' && renderPodcastDetail()}
      {renderSaveModal()}
    </div>
  );
}
