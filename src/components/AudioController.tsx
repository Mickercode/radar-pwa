import { useEffect, useRef } from 'react';
import { bindAudioEl, usePlayer } from '../stores/player';

// Owns the single <audio> element and syncs it with the player store.
// Mounted once at the app root.
export function AudioController() {
  const ref = useRef<HTMLAudioElement>(null);
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const speed = usePlayer((s) => s.speed);
  const sync = usePlayer((s) => s._sync);

  useEffect(() => {
    bindAudioEl(ref.current);
    return () => bindAudioEl(null);
  }, []);

  // Load a new track when `current` changes.
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const url = current?.audioUrl ?? '';
    if (url && a.getAttribute('src') !== url) {
      a.src = url;
      a.playbackRate = speed;
    }
    if (current && playing) void a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Reflect play/pause.
  useEffect(() => {
    const a = ref.current;
    if (!a || !current) return;
    playing ? void a.play().catch(() => {}) : a.pause();
  }, [playing, current]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  return (
    <audio
      ref={ref}
      hidden
      onTimeUpdate={(e) => sync({ position: e.currentTarget.currentTime })}
      onLoadedMetadata={(e) => sync({ duration: e.currentTarget.duration })}
      onEnded={() => sync({ playing: false })}
    />
  );
}
