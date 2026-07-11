/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map Radar's existing CSS token names to Tailwind
        border:      'var(--border)',
        input:       'var(--border)',
        ring:        'var(--accent)',
        background:  'var(--bg)',
        foreground:  'var(--text)',
        primary: {
          DEFAULT:    'var(--cyan)',
          foreground: '#04141a',
        },
        secondary: {
          DEFAULT:    'var(--bg-2)',
          foreground: 'var(--text)',
        },
        destructive: {
          DEFAULT:    'var(--coral)',
          foreground: '#fff',
        },
        muted: {
          DEFAULT:    'var(--bg-1)',
          foreground: 'var(--text-dim)',
        },
        accent: {
          DEFAULT:    'var(--bg-hover)',
          foreground: 'var(--text)',
        },
        card: {
          DEFAULT:    'var(--bg-card)',
          foreground: 'var(--text)',
        },
        popover: {
          DEFAULT:    'var(--bg-card)',
          foreground: 'var(--text)',
        },
      },
      borderRadius: {
        lg:   'var(--r-lg)',
        md:   'var(--r)',
        sm:   'var(--r-sm)',
        pill: 'var(--r-pill)',
      },
      fontFamily: {
        sans:    ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
