import { Icon } from './Icon';
import { type ContentItem } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { useState } from 'react';

interface Props {
  item: ContentItem;
  onClose: () => void;
  onPlay?: (item: ContentItem) => void;
  isPlaying?: boolean;
}

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SummarySheet({ item, onClose, onPlay, isPlaying }: Props) {
  const s = item.summary;
  const [saved, setSaved] = useState(() => isSaved(item.id));

  function toggleSave() {
    if (saved) { unsaveItem(item.id); setSaved(false); }
    else { saveItem(item); setSaved(true); }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="sheet__bar">
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
          <span className="sheet__source">{item.source} · {timeAgo(item.createdAt)}</span>
          <button
            className={`icon-btn${saved ? ' save-active' : ''}`}
            onClick={toggleSave}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Icon name="bookmark" size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="sheet__scroll">
          {item.thumbnailUrl && (
            <img src={item.thumbnailUrl} alt="" className="sheet__thumb" />
          )}

          <div className="sheet__content">
            <div className={`sheet__type-badge sheet__type-badge--${item.type}`}>
              {item.type === 'podcast' && <Icon name="headphones" size={12} />}
              {item.type === 'clip' && <Icon name="play" size={12} />}
              {item.type === 'news' && <Icon name="feed" size={12} />}
              {item.type}
            </div>

            <h1 className="sheet__title">{item.title}</h1>

            {/* Play button for podcasts/clips */}
            {(item.type === 'podcast' && item.audioUrl && onPlay) && (
              <button
                className={`sheet__play-btn${isPlaying ? ' sheet__play-btn--playing' : ''}`}
                onClick={() => onPlay(item)}
              >
                {isPlaying
                  ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
                  : <><Icon name="play" size={18} /> Play episode</>
                }
              </button>
            )}

            {item.type === 'clip' && item.videoUrl && (
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sheet__play-btn"
              >
                <Icon name="play" size={18} /> Watch clip
              </a>
            )}

            {/* ── What ── */}
            {s?.what && (
              <section className="sum-section">
                <h2 className="sum-label sum-label--what">What</h2>
                <p className="sum-prose">{s.what}</p>
              </section>
            )}
            {!s?.what && s?.summary && (
              <section className="sum-section">
                <p className="sum-prose">{s.summary}</p>
              </section>
            )}

            {/* ── Key Takeaways ── */}
            {s && s.keyTakeaways?.length > 0 && (
              <section className="sum-section">
                <h2 className="sum-label sum-label--takeaways">Key Takeaways</h2>
                <ul className="sum-takeaways">
                  {s.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </section>
            )}

            {/* ── Why It Matters ── */}
            {s?.whyItMatters && (
              <section className="sum-section">
                <h2 className="sum-label sum-label--why">Why It Matters</h2>
                <p className="sum-prose">{s.whyItMatters}</p>
              </section>
            )}
            {s?.why && !s?.whyItMatters && (
              <section className="sum-section">
                <h2 className="sum-label sum-label--why">Why It Matters</h2>
                <p className="sum-prose">{s.why}</p>
              </section>
            )}

            {/* ── How It Matters to You (Edge) ── */}
            {s?.howItMattersToYou && (
              <section className="sum-section">
                <h2 className="sum-label sum-label--edge">How It Matters to You</h2>
                <p className="sum-prose">{s.howItMattersToYou}</p>
              </section>
            )}

            {/* ── Glossary ── */}
            {s && s.glossary?.length > 0 && (
              <section className="sum-section sum-section--glossary">
                <h2 className="sum-label sum-label--glossary">Glossary</h2>
                {s.glossary.map((entry, i) => {
                  const colon = entry.indexOf(':');
                  const term = colon > -1 ? entry.slice(0, colon).trim() : entry;
                  const def = colon > -1 ? entry.slice(colon + 1).trim() : '';
                  return (
                    <div key={i} className="sum-gloss-entry">
                      <span className="sum-gloss-term">{term}</span>
                      {def && <span className="sum-gloss-def">{def}</span>}
                    </div>
                  );
                })}
              </section>
            )}

            {/* Read / Watch links */}
            {item.articleUrl && (
              <a href={item.articleUrl} target="_blank" rel="noopener noreferrer" className="sheet__ext-link">
                <Icon name="link" size={15} /> Read full article
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
