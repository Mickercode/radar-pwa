import { useState } from 'react';
import { Icon } from './Icon';
import { type ContentItem } from '../lib/api';
import { saveItem, unsaveItem, isSaved } from '../lib/saved';
import { usePlayer } from './AudioPlayer';

interface Props {
  item: ContentItem;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.floor(h * 60)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

function fmtStamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Derive estimated chapter markers from duration
const CHAPTER_NAMES = [
  'Introduction and overview',
  'Main topic begins',
  'Key insight discussed',
  'Deep dive into details',
  'Conclusions and takeaways',
];
function buildChapters(durationSecs: number) {
  if (durationSecs < 120) return [];
  const count = Math.min(5, Math.max(2, Math.floor(durationSecs / 600)));
  return Array.from({ length: count }, (_, i) => ({
    time: Math.floor((durationSecs / count) * i),
    label: CHAPTER_NAMES[i] ?? `Chapter ${i + 1}`,
  }));
}

export function DetailView({ item, onClose }: Props) {
  const s = item.summary;
  const [saved, setSaved]     = useState(() => isSaved(item.id));
  const { play, pause, resume, track, playing, openPlayer, seekTo } = usePlayer();

  const isPlayingThis = track?.contentId === item.id && playing;
  const isPodcast = item.type === 'podcast';
  const chapters  = isPodcast && item.duration > 0 ? buildChapters(item.duration) : [];

  function toggleSave() {
    if (saved) { unsaveItem(item.id); setSaved(false); }
    else { saveItem(item); setSaved(true); }
  }

  function handlePlay(startAt?: number) {
    if (!item.audioUrl) return;
    if (track?.contentId === item.id) {
      if (startAt !== undefined) seekTo(startAt);
      playing ? pause() : resume();
    } else {
      play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id, artwork: item.thumbnailUrl });
    }
  }

  function handleListen() {
    if (!item.audioUrl) return;
    if (track?.contentId !== item.id) {
      play({ src: item.audioUrl, title: item.title, source: item.source, contentId: item.id, artwork: item.thumbnailUrl });
    } else {
      openPlayer();
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.articleUrl ?? location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(item.articleUrl ?? location.href).catch(() => {});
    }
  }

  return (
    <div className="dv">
      {/* Top bar */}
      <div className="dv__bar">
        <button className="dv__back icon-btn" onClick={onClose} aria-label="Go back">
          <Icon name="left" size={20} />
        </button>
        <span className="dv__type">{item.type.toUpperCase()}</span>
        <button
          className={`icon-btn dv__bookmark${saved ? ' save-active' : ''}`}
          onClick={toggleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Icon name="bookmark" size={20} />
        </button>
      </div>

      {/* Scroll body */}
      <div className="dv__scroll">
        {/* Meta line */}
        <div className="dv__meta">
          <span className="dv__source">{item.source}</span>
          <span className="dv__sep">·</span>
          <span>{timeAgo(item.createdAt)}</span>
          {item.duration > 0 && (
            <><span className="dv__sep">·</span><span>{formatDuration(item.duration)}</span></>
          )}
          <span className="dv__sep">·</span>
          <span className="dv__ng">🇳🇬 Nigeria</span>
        </div>

        {/* Title */}
        <h1 className="dv__title">{item.title}</h1>

        {/* ── SUMMARY / WHAT ── */}
        {(s?.what || s?.summary) && (
          <section className="dv__section">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--cyan" />
              <span className="dv__label-text">SUMMARY</span>
            </div>
            <p className="dv__summary-text">{s?.what ?? s?.summary}</p>
          </section>
        )}

        {/* ── KEY TAKEAWAYS ── */}
        {s?.keyTakeaways && s.keyTakeaways.length > 0 && (
          <section className="dv__section">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--lime" />
              <span className="dv__label-text">KEY TAKEAWAYS</span>
            </div>
            <ul className="dv__takeaways">
              {s.keyTakeaways.map((t, i) => (
                <li key={i}>
                  <span className="dv__bullet" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── WHY IT MATTERS ── */}
        {(s?.whyItMatters || s?.why) && (
          <section className="dv__section">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--cyan" />
              <span className="dv__label-text">WHY IT MATTERS</span>
            </div>
            <p className="dv__prose">{s?.whyItMatters ?? s?.why}</p>
          </section>
        )}

        {/* ── THE EDGE (How It Matters to You) ── */}
        {(s?.howItMattersToYou) && (
          <section className="dv__section dv__section--edge">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--amber" />
              <span className="dv__label-text">THE EDGE</span>
            </div>
            <p className="dv__edge-text">{s.howItMattersToYou}</p>
          </section>
        )}

        {/* ── KEY MOMENTS (podcast chapters) ── */}
        {chapters.length > 0 && (
          <section className="dv__section">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--faint" />
              <span className="dv__label-text">KEY MOMENTS</span>
            </div>
            <div className="dv__chapters">
              {chapters.map((ch, i) => (
                <button
                  key={i}
                  className="dv__chapter"
                  onClick={() => handlePlay(ch.time)}
                  aria-label={`Jump to ${ch.label}`}
                >
                  <span className="dv__chapter-time">{fmtStamp(ch.time)}</span>
                  <span className="dv__chapter-label">{ch.label}</span>
                  <span className="dv__chapter-play">
                    <Icon name="play" size={14} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── GLOSSARY ── */}
        {s?.glossary && s.glossary.length > 0 && (
          <section className="dv__section">
            <div className="dv__section-label">
              <span className="dv__dot dv__dot--faint" />
              <span className="dv__label-text">GLOSSARY</span>
            </div>
            <div className="dv__glossary">
              {s.glossary.map((entry, i) => {
                const colon = entry.indexOf(':');
                const term = colon > -1 ? entry.slice(0, colon).trim() : entry;
                const def  = colon > -1 ? entry.slice(colon + 1).trim() : '';
                return (
                  <div key={i} className="dv__gloss-entry">
                    <span className="dv__gloss-term">{term}</span>
                    {def && <span className="dv__gloss-def">{def}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Read more link for news */}
        {item.type === 'news' && item.articleUrl && (
          <a href={item.articleUrl} target="_blank" rel="noopener noreferrer" className="dv__ext">
            <Icon name="link" size={14} /> Read full article
          </a>
        )}
      </div>

      {/* ── Bottom action bar ── */}
      <div className="dv__actions">
        <button className={`dv__action${saved ? ' dv__action--active' : ''}`} onClick={toggleSave}>
          <Icon name="bookmark" size={18} />
          <span>Save</span>
        </button>

        <button className="dv__action" onClick={toggleSave}>
          <Icon name="brain" size={18} />
          <span>Save to Brain</span>
        </button>

        <button className="dv__action" onClick={handleShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span>Share</span>
        </button>

        {isPodcast && item.audioUrl && (
          <button
            className={`dv__action dv__action--listen${isPlayingThis ? ' dv__action--playing' : ''}`}
            onClick={handleListen}
          >
            <Icon name="headphones" size={18} />
            <span>{isPlayingThis ? 'Playing' : 'Listen'}</span>
          </button>
        )}

        {item.type === 'clip' && item.videoUrl && (
          <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="dv__action dv__action--listen">
            <Icon name="play" size={18} />
            <span>Watch</span>
          </a>
        )}
      </div>
    </div>
  );
}
