import type { CSSProperties } from 'react';

// Minimal line-icon set (24px, stroke = currentColor) to keep the mono/precise feel
// without pulling an icon library.
const PATHS: Record<string, string> = {
  feed: 'M4 6h16M4 12h16M4 18h10',
  brain:
    'M12 5a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V16a3 3 0 0 0 6 0M12 5a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V16a3 3 0 0 1-6 0M12 5v11',
  review: 'M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  capture: 'M12 5v14M5 12h14',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  play: 'M7 5l12 7-12 7z',
  pause: 'M9 5v14M15 5v14',
  x: 'M6 6l12 12M18 6L6 18',
  right: 'M9 6l6 6-6 6',
  left: 'M15 6l-6 6 6 6',
  save: 'M6 4h12a1 1 0 0 1 1 1v15l-7-4.2L5 20V5a1 1 0 0 1 1-1z',
  share: 'M16 6l-4-4-4 4M12 2v13M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  check: 'M5 12l4 4L19 7',
  link: 'M9 15l6-6M10.5 6.5l1-1a4 4 0 0 1 6 6l-1 1M13.5 17.5l-1 1a4 4 0 0 1-6-6l1-1',
  headphones: 'M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 1 0 0V12a8 8 0 0 1 16 0v2M20 13v6a2 2 0 0 1-2 2h-1v-6h1',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L16.5 2h-4l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L8 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.4h4l.3-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
};

export function Icon({
  name,
  size = 22,
  className,
  style,
}: {
  name: keyof typeof PATHS | string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
