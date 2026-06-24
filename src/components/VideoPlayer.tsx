import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  /** YouTube video ID (extracted from externalId or videoUrl). */
  videoId: string;
  /** Optional aspect ratio; defaults to 16:9. Vertical clips pass ~0.5625 (9:16). */
  aspectRatio?: number;
  /** Autoplay on mount. Default false to honour data plans. */
  autoplay?: boolean;
}

/**
 * YouTube iframe embed for clip-type content.
 *
 * Uses the standard YouTube IFrame Player API via the /embed/ URL.
 * Inline playback on mobile requires playsinline + modestbranding params.
 * Falls back to a placeholder if the provider isn't YouTube.
 */
export function VideoPlayer({ videoId, aspectRatio = 16 / 9, autoplay = false }: VideoPlayerProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  // Fallback: dismiss skeleton after 5s even if onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? '1' : '0'}&modestbranding=1&rel=0&playsinline=1`;

  if (error) {
    return (
      <div
        className="video-player video-player--error"
        style={{
          aspectRatio: String(aspectRatio),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-2)',
          borderRadius: 'var(--r)',
          color: 'var(--text-faint)',
          fontSize: 'var(--step--1)',
          gap: '0.5rem',
          flexDirection: 'column',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16" strokeLinecap="round" />
        </svg>
        <span>Video unavailable</span>
      </div>
    );
  }

  return (
    <div
      className="video-player"
      style={{
        position: 'relative',
        aspectRatio: String(aspectRatio),
        width: '100%',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        background: 'var(--bg-2)',
      }}
    >
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-2)',
            zIndex: 1,
          }}
        >
          <div
            className="skeleton"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 0,
              background: 'linear-gradient(100deg, var(--bg-2) 30%, var(--bg-hover) 50%, var(--bg-2) 70%)',
              backgroundSize: '200% 100%',
            }}
          />
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.8"
            style={{ position: 'absolute', opacity: 0.6 }}
            aria-hidden
          >
            <path d="M6 3l16 9-16 9z" />
          </svg>
        </div>
      )}
      <iframe
        src={embedUrl}
        title="Video player"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setReady(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * Extracts a YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Or returns the string as-is if it looks like a raw ID.
 */
export function extractYoutubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;

  // Already a raw ID (alphanumeric + dashes/underscores, 11 chars typical)
  if (/^[A-Za-z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes('youtube.com')) {
      // /watch?v=ID or /embed/ID or /shorts/ID
      const v = u.searchParams.get('v');
      if (v) return v;
      const path = u.pathname.replace(/^\//, '');
      const match = path.match(/^(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
      if (match) return match[1];
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '');
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // Not a URL — return null
  }

  return null;
}
