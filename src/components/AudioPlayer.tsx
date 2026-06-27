import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { Icon } from './Icon';

// ── Context ───────────────────────────────────────────────────────────────────

export interface Track {
  src: string;
  title: string;
  source: string;
  contentId: string;
  artwork?: string;
}

interface PlayerCtx {
  track: Track | null;
  playing: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  openPlayer: () => void;
  seekTo: (seconds: number) => void;
}

const PlayerContext = createContext<PlayerCtx>({
  track: null, playing: false,
  play: () => {}, pause: () => {}, resume: () => {}, openPlayer: () => {},
  seekTo: () => {},
});

export function usePlayer() { return useContext(PlayerContext); }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2,'0')}:${String(Math.floor(s % 60)).padStart(2,'0')}`;
  return `${m}:${String(Math.floor(s % 60)).padStart(2,'0')}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

// ── Provider ──────────────────────────────────────────────────────────────────

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack]           = useState<Track | null>(null);
  const [playing, setPlaying]       = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [loading, setLoading]       = useState(false);
  const [speed, setSpeed]           = useState(1);
  const [expanded, setExpanded]     = useState(false);

  const storageKey = (id: string) => `radar:pos:${id}`;

  const play = useCallback((t: Track) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    if (track?.contentId === t.contentId) {
      audio.play().catch(() => {});
      setPlaying(true);
      return;
    }

    setTrack(t);
    setLoading(true);
    setCurrentTime(0);
    setDuration(0);
    audio.src = t.src;
    audio.playbackRate = speed;
    audio.load();
    const saved = parseFloat(localStorage.getItem(storageKey(t.contentId)) ?? '0');
    if (saved > 0) audio.currentTime = saved;
    audio.play().catch(() => setPlaying(false));
    setExpanded(true);
  }, [track, speed]);

  const pause  = useCallback(() => { audioRef.current?.pause(); setPlaying(false); }, []);
  const resume = useCallback(() => { audioRef.current?.play().catch(() => {}); setPlaying(true); }, []);
  const openPlayer = useCallback(() => setExpanded(true), []);

  const seekTo = useCallback((seconds: number) => {
    if (!audioRef.current || !Number.isFinite(seconds)) return;
    audioRef.current.currentTime = Math.max(0, seconds);
    setCurrentTime(seconds);
  }, []);

  // Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay   = () => setPlaying(true);
    const onPause  = () => setPlaying(false);
    const onTime   = () => {
      setCurrentTime(audio.currentTime);
      if (track) localStorage.setItem(storageKey(track.contentId), String(audio.currentTime));
    };
    const onDur    = () => setDuration(audio.duration);
    const onCan    = () => setLoading(false);
    const onEnd    = () => { setPlaying(false); if (track) localStorage.removeItem(storageKey(track.contentId)); };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('canplay', onCan);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('canplay', onCan);
      audio.removeEventListener('ended', onEnd);
    };
  }, [track]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const skip = useCallback((secs: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
  }, [duration]);

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider value={{ track, playing, play, pause, resume, openPlayer, seekTo }}>
      {children}

      {/* ── Full-screen player ─────────────────────── */}
      {track && expanded && (
        <div className="player-fs">
          {/* Top bar */}
          <div className="player-fs__bar">
            <button className="icon-btn" onClick={() => setExpanded(false)} aria-label="Minimise">
              <Icon name="left" size={22} />
            </button>
            <span className="player-fs__label">Now Playing</span>
            <div style={{ width: 40 }} />
          </div>

          {/* Artwork */}
          <div className="player-fs__art">
            {track.artwork
              ? <img src={track.artwork} alt="" />
              : <div className="player-fs__art-ph"><Icon name="headphones" size={64} /></div>
            }
          </div>

          {/* Info */}
          <div className="player-fs__info">
            <h2 className="player-fs__title">{track.title}</h2>
            <p className="player-fs__source">{track.source.toUpperCase()}</p>
          </div>

          {/* Progress */}
          <div className="player-fs__prog-wrap">
            <div className="player-fs__prog-track">
              <div className="player-fs__prog-fill" style={{ width: `${progress}%` }} />
              <div className="player-fs__prog-dot" style={{ left: `${progress}%` }} />
              <input
                className="player-fs__prog-input"
                type="range" min={0} max={duration || 100} step={0.5}
                value={currentTime} onChange={seek}
                aria-label="Seek"
              />
            </div>
            <div className="player-fs__times">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="player-fs__controls">
            <button className="player-fs__skip" onClick={() => skip(-15)} aria-label="Back 15s">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>15</span>
            </button>

            <button
              className="player-fs__play"
              onClick={playing ? pause : resume}
              aria-label={playing ? 'Pause' : 'Play'}
              disabled={loading}
            >
              {loading ? (
                <span className="player-fs__spin" />
              ) : playing ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <Icon name="play" size={28} />
              )}
            </button>

            <button className="player-fs__skip" onClick={() => skip(30)} aria-label="Forward 30s">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              <span>30</span>
            </button>
          </div>

          {/* Speed */}
          <div className="player-fs__speeds">
            {SPEEDS.map(s => (
              <button
                key={s}
                className={`player-fs__speed${speed === s ? ' player-fs__speed--active' : ''}`}
                onClick={() => changeSpeed(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Mini bar (shows when minimised) ────────── */}
      {track && !expanded && (
        <div className="audio-player" onClick={() => setExpanded(true)} role="button" tabIndex={0}>
          <div className="audio-player__progress-bar">
            <div className="audio-player__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="audio-player__row">
            {track.artwork
              ? <img src={track.artwork} alt="" className="audio-player__art" />
              : <div className="audio-player__art audio-player__art--ph"><Icon name="headphones" size={16} /></div>
            }
            <div className="audio-player__info">
              <p className="audio-player__title">{track.title}</p>
              <p className="audio-player__source">{track.source}</p>
            </div>
            <div className="audio-player__controls" onClick={e => e.stopPropagation()}>
              <span className="audio-player__time">{fmt(currentTime)}</span>
              <button
                className="audio-player__play"
                onClick={playing ? pause : resume}
                aria-label={playing ? 'Pause' : 'Play'}
                disabled={loading}
              >
                {loading ? <span className="audio-player__loading" /> :
                  playing
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    : <Icon name="play" size={18} />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}
