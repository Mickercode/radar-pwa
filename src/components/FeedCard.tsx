import type { ContentItem } from '../lib/types';

const TIER_LABEL: Record<number, string> = { 1: '★ MUST-SEE', 2: '', 3: '' };

function durationLabel(seconds: number): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} MIN` : `${Math.floor(m / 60)}H ${m % 60}M`;
}

export function FeedCard({ item, onOpen }: { item: ContentItem; onOpen?: (id: string) => void }) {
  const tier = item.summary?.tier ?? 2;
  const what = item.summary?.what ?? item.summary?.summary ?? '';
  const ng = item.summary?.nigeriaRelevance ?? 0;

  return (
    <article className="card fcard" data-tier={tier} onClick={() => onOpen?.(item.id)}>
      <div className="fcard__media">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <div className="fcard__media-fallback">
            <img src="/assets/logo-icon.jpeg" alt="" className="fcard__fallback-logo" />
          </div>
        )}
        <span className="badge fcard__type">{item.type}</span>
        {TIER_LABEL[tier] && <span className="fcard__tier">{TIER_LABEL[tier]}</span>}
      </div>
      <div className="fcard__body">
        <h3 className="fcard__title">{item.title}</h3>
        {what && <p className="fcard__what">{what}</p>}
        <div className="fcard__meta">
          <span>{item.source}</span>
          {durationLabel(item.duration) && <span>· {durationLabel(item.duration)}</span>}
          {ng >= 2 && <span className="fcard__ng">· 🇳🇬 NG</span>}
        </div>
      </div>
    </article>
  );
}
