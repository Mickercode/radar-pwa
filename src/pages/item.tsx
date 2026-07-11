import { useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { type ContentItem } from '../lib/api';
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

  const item = useMemo<ContentItem | null>(() => {
    if (stateItem) return stateItem;
    if (!id) return null;
    const saved = getSavedItems().find(s => s.id === id);
    return saved ? savedToContent(saved) : null;
  }, [id, stateItem]);

  if (!item) {
    return (
      <div className="dv" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Icon name="feed" size={48} />
        <p style={{ color: 'var(--text-dim)', margin: 0 }}>Content not available</p>
        <button className="btn btn--primary" onClick={() => navigate(-1 as never)}>Go back</button>
      </div>
    );
  }

  return <DetailView item={item} />;
}
