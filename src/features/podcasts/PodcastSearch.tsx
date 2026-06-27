import { useState, useCallback } from 'react';
import { Icon } from '../../components/Icon';
import { api, type PodcastFeed } from '../../lib/api';
import { stripHtml, truncate } from '../../lib/text';

interface Props {
  onSelect: (feed: PodcastFeed) => void;
}

export function PodcastSearch({ onSelect }: Props) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<PodcastFeed[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.searchPodcasts(q);
      setResults(res.feeds ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="pod-search-page">
      {/* Inline search bar */}
      <div className="pod-search-row" style={{ paddingTop: '0.5rem' }}>
        <div className="pod-search-wrap">
          <Icon name="search" size={16} className="pod-search-icon" />
          <input
            className="pod-search"
            type="search"
            placeholder="Search Podcast Index…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <button className="pod-search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="pod-search-scroll">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Searching podcasts…</p></div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty" style={{ minHeight: '30vh' }}>
            <Icon name="headphones" size={48} />
            <h3>No results</h3>
            <p>Try a different search term.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="pod-search-results">
            {results.map((feed) => (
              <article
                key={feed.id}
                className="pod-search-card"
                onClick={() => onSelect(feed)}
              >
                <div className="pod-search-card__art">
                  {feed.image
                    ? <img src={feed.image} alt="" loading="lazy" />
                    : <div className="pod-search-card__art-ph"><Icon name="headphones" size={28} /></div>
                  }
                </div>
                <div className="pod-search-card__body">
                  <h3 className="pod-search-card__title">{feed.title}</h3>
                  {feed.author && (
                    <p className="pod-search-card__author">{feed.author}</p>
                  )}
                  {feed.description && (
                    <p className="pod-search-card__desc">{truncate(stripHtml(feed.description), 180)}</p>
                  )}
                  <div className="pod-search-card__meta">
                    {feed.language && <span>{feed.language.toUpperCase()}</span>}
                    {feed.categories && Object.keys(feed.categories).length > 0 && (
                      <>
                        <span className="pod-search-card__dot">·</span>
                        <span>{Object.values(feed.categories).slice(0, 2).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="pod-search-card__action">
                  <Icon name="right" size={18} />
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !searched && (
          <div className="empty" style={{ minHeight: '30vh' }}>
            <Icon name="headphones" size={48} />
            <h3>Discover new shows</h3>
            <p>Search thousands of podcasts to find episodes on any topic.</p>
          </div>
        )}
      </div>
    </div>
  );
}
