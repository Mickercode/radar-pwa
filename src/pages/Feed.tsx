import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedCard } from '../components/FeedCard';
import { useFeed } from '../features/content/queries';
import { useAuth } from '../stores/auth';
import { fetchPreferences } from '../features/account/preferencesApi';
import { useQuery } from '@tanstack/react-query';
import type { ContentType } from '../lib/types';
import './feed.css';

const FILTERS: { key: 'all' | ContentType | 'clips'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'news', label: 'News' },
  { key: 'clips', label: 'Clips' },
];

export default function Feed() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | ContentType>('all');
  const userId = useAuth((s) => s.user?.id);
  const { data: prefs } = useQuery({
    queryKey: ['feed-prefs', userId],
    queryFn: fetchPreferences,
    enabled: !!userId,
  });
  const topicIds = prefs?.topic_ids?.length ? prefs.topic_ids : undefined;
  const { data, isLoading, isError } = useFeed(topicIds);

  const items = useMemo(() => {
    const all = data?.items ?? [];
    return filter === 'all' ? all : all.filter((i) => i.type === filter);
  }, [data, filter]);

  return (
    <div className="rise">
      <header className="page-head">
        <div className="page-kicker">Today on Radar</div>
        <h1 className="page-title">Your feed</h1>
        <p className="page-sub">The signals worth understanding — ranked for you.</p>
      </header>

      <div className="chiprow">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`badge chip${filter === f.key ? ' is-active' : ''}`}
            onClick={() => f.key === 'clips' ? navigate('/clips') : setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="wall">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280 }} />
          ))}
        </div>
      ) : isError ? (
        <div className="empty">
          <h3>Couldn’t load your feed</h3>
          <p>Check your connection and try again.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>New content lands as it’s ingested. Try a different filter.</p>
        </div>
      ) : (
        <div className="wall">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} onOpen={(id) => navigate(`/content/${id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
