import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../components/Icon';
import { api, type PodcastFeed, type PodcastEpisode } from '../../lib/api';
import { usePlayer } from '../../components/AudioPlayer';
import { stripHtml } from '../../lib/text';

interface Props {
  feed: PodcastFeed;
  onBack: () => void;
}

function fmtDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m} min`;
}

function fmtDate(ts: number): string {
  const d = new Date(ts * 1000);
  const now = Date.now();
  const diff = (now - d.getTime()) / 86_400_000;
  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return `${Math.floor(diff)}d ago`;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function PodcastDetail({ feed, onBack }: Props) {
  const [episodes, setEpisodes]     = useState<PodcastEpisode[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const { play, pause, resume, track, playing } = usePlayer();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.podcastEpisodes(feed.id, 30)
      .then((res) => { setEpisodes(res.items ?? []); setLoading(false); })
      .catch(() => { setError('Could not load episodes.'); setLoading(false); });
  }, [feed.id]);

  const handlePlay = useCallback((ep: PodcastEpisode) => {
    if (track?.contentId === `pi:${ep.id}`) {
      playing ? pause() : resume();
    } else {
      play({
        src: ep.enclosureUrl,
        title: ep.title,
        source: feed.title,
        contentId: `pi:${ep.id}`,
        artwork: ep.feedImage ?? feed.image,
      });
    }
  }, [play, pause, resume, track, playing, feed.title, feed.image]);

  const isPlaying = (ep: PodcastEpisode) => track?.contentId === `pi:${ep.id}` && playing;

  return (
    <div className="pod-detail">
      {/* Top bar */}
      <div className="pod-detail__bar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="left" size={20} />
        </button>
        <div className="pod-detail__bar-title">Podcast</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Artwork + info */}
      <div className="pod-detail__hero">
        <div className="pod-detail__art">
          {feed.image
            ? <img src={feed.image} alt="" />
            : <div className="pod-detail__art-ph"><Icon name="headphones" size={48} /></div>
          }
        </div>
        <h1 className="pod-detail__title">{feed.title}</h1>
        {feed.author && (
          <p className="pod-detail__author">by {feed.author}</p>
        )}
        {feed.description && (
          <p className="pod-detail__desc">{stripHtml(feed.description)}</p>
        )}
        {feed.language && (
          <span className="pod-detail__lang">{feed.language.toUpperCase()}</span>
        )}
      </div>

      {/* Episodes header */}
      <div className="pod-detail__ep-header">
        <span className="pod-detail__ep-label">Episodes</span>
        {episodes.length > 0 && (
          <span className="pod-detail__ep-count">{episodes.length}</span>
        )}
      </div>

      {/* Episodes list */}
      <div className="pod-detail__scroll">
        {loading && (
          <div className="feed-loading"><div className="feed-spinner" /><p>Loading episodes…</p></div>
        )}

        {!loading && error && (
          <div className="empty" style={{ minHeight: '20vh' }}>
            <Icon name="headphones" size={40} />
            <h3>Could not load episodes</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && episodes.length === 0 && (
          <div className="empty" style={{ minHeight: '20vh' }}>
            <Icon name="headphones" size={40} />
            <h3>No episodes</h3>
            <p>This podcast has no episodes available.</p>
          </div>
        )}

        {!loading && episodes.length > 0 && (
          <div className="pod-detail__list">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className={`pod-detail__item${isPlaying(ep) ? ' pod-detail__item--active' : ''}`}
              >
                <div className="pod-detail__item-body" onClick={() => handlePlay(ep)}>
                  <p className="pod-detail__item-title">{ep.title}</p>
                  <div className="pod-detail__item-meta">
                    {ep.duration > 0 && <span>{fmtDuration(ep.duration)}</span>}
                    {ep.duration > 0 && ep.datePublished > 0 && <span className="pod-detail__dot">·</span>}
                    {ep.datePublished > 0 && <span>{fmtDate(ep.datePublished)}</span>}
                  </div>
                  {ep.description && (
                    <p className="pod-detail__item-desc">{stripHtml(ep.description).slice(0, 150)}</p>
                  )}
                </div>
                <button
                  className={`pod-detail__item-play${isPlaying(ep) ? ' pod-detail__item-play--on' : ''}`}
                  onClick={() => handlePlay(ep)}
                  aria-label={isPlaying(ep) ? 'Pause' : 'Play'}
                >
                  {isPlaying(ep)
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    : <Icon name="play" size={16} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
