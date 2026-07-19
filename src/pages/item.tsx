import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { type ContentItem, api } from '../lib/api';
import { getSavedItems, type SavedItem } from '../lib/saved';
import { DetailView } from '../components/DetailView';
import { Icon } from '../components/Icon';

function savedToContent(s: SavedItem): ContentItem {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    source: s.source,
    duration: 0,
    thumbnailUrl: s.thumbnailUrl,
    audioUrl: s.audioUrl,
    articleUrl: s.articleUrl,
    videoUrl: s.videoUrl,
    createdAt: s.savedAt,
    summary: {
      id: s.id,
      contentId: s.id,
      summary: s.summary ?? '',
      keyTakeaways: s.keyTakeaways,
      whyItMatters: s.whyItMatters ?? '',
      howItMattersToYou: s.howItMattersToYou,
      glossary: s.glossary,
    },
  };
}

export function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateItem = (location.state as { item?: ContentItem } | null)?.item;

  // Try state → saved items → API fetch (handles shared links with no state)
  const localItem = useMemo<ContentItem | null>(() => {
    if (stateItem) return stateItem;
    if (!id) return null;
    const saved = getSavedItems().find(s => s.id === id);
    return saved ? savedToContent(saved) : null;
  }, [id, stateItem]);

  const [fetchedItem, setFetchedItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(!localItem);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localItem || !id) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    api.contentById(id)
      .then(item => { setFetchedItem(item); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id, localItem]);

  const item = localItem ?? fetchedItem;

  if (loading) {
    return (
      <div className="dv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="feed-spinner" />
      </div>
    );
  }

  if (!item || error) {
    return (
      <div className="dv" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Icon name="feed" size={48} />
        <p style={{ color: 'var(--text-dim)', margin: 0 }}>Content not available</p>
        <button className="btn btn--primary" onClick={() => navigate('/')}>Go to feed</button>
      </div>
    );
  }

  return <DetailView item={item} />;
}
