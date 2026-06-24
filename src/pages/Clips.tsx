import { useNavigate } from 'react-router-dom';
import { useClips } from '../features/content/queries';
import { FeedCard } from '../components/FeedCard';
import { Icon } from '../components/Icon';
import type { ContentItem } from '../lib/types';
import './feed.css';

// Screen — Short Video Clips. A dedicated discoverable surface for clip-type
// content. Each clip card opens the content detail (which shows the YouTube
// embed and the What-Why-Edge analysis).
export default function Clips() {
  const navigate = useNavigate();
  const { data: items = [], isLoading, isError } = useClips();

  return (
    <div className="rise">
      <header className="page-head">
        <div className="page-kicker">Short video</div>
        <h1 className="page-title">Clips</h1>
        <p className="page-sub">Quick, sharp videos worth your attention — ranked for you.</p>
      </header>

      {isLoading ? (
        <div className="wall">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 320 }} />
          ))}
        </div>
      ) : isError ? (
        <div className="empty">
          <h3>Couldn’t load clips</h3>
          <p>Check your connection and try again.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <Icon name="play" size={40} style={{ color: 'var(--text-faint)' }} />
          <h3>No clips yet</h3>
          <p>Fresh short-form video lands here as we pull from curated channels.</p>
          <button className="btn btn--ghost" onClick={() => navigate('/')}>
            Back to feed
          </button>
        </div>
      ) : (
        <div className="wall">
          {items.map((item: ContentItem) => (
            <FeedCard key={item.id} item={item} onOpen={(id) => navigate(`/content/${id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
