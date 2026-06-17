import { create } from 'zustand';
import type { ContentItem } from '../lib/types';

// The actual <audio> element is owned by <AudioController> and registered here
// so store actions can drive it without React in the loop.
let el: HTMLAudioElement | null = null;
export function bindAudioEl(node: HTMLAudioElement | null): void {
  el = node;
}

interface PlayerState {
  current: ContentItem | null;
  playing: boolean;
  position: number;
  duration: number;
  speed: number;

  play: (item: ContentItem) => void;
  toggle: () => void;
  close: () => void;
  seek: (t: number) => void;
  skip: (delta: number) => void;
  setSpeed: (s: number) => void;
  _sync: (p: Partial<Pick<PlayerState, 'position' | 'duration' | 'playing'>>) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  playing: false,
  position: 0,
  duration: 0,
  speed: 1,

  play: (item) => {
    if (get().current?.id === item.id) {
      get().toggle();
      return;
    }
    set({ current: item, position: 0, duration: 0, playing: true });
  },
  toggle: () => {
    const playing = !get().playing;
    set({ playing });
    if (el) playing ? void el.play().catch(() => {}) : el.pause();
  },
  close: () => {
    if (el) el.pause();
    set({ current: null, playing: false, position: 0, duration: 0 });
  },
  seek: (t) => {
    if (el) el.currentTime = t;
    set({ position: t });
  },
  skip: (delta) => get().seek(Math.max(0, get().position + delta)),
  setSpeed: (speed) => {
    set({ speed });
    if (el) el.playbackRate = speed;
  },
  _sync: (p) => set(p),
}));
