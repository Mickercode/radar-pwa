import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PwaInstall } from './PwaInstall';
import { Icon } from './Icon';

// ── Bottom dock — 5 items, no FAB ─────────────────────────────────────────────
// Clips and Podcasts are now top-level nav destinations.
// Capture moved into the Profile/You page as a contextual action.
// Saved + Brain merged into Library (two tabs within /library).
const DOCK_NAV = [
  { to: '/',         icon: 'feed'       as const, label: 'Feed'     },
  { to: '/clips',    icon: 'play'       as const, label: 'Clips'    },
  { to: '/podcasts', icon: 'headphones' as const, label: 'Podcasts' },
  { to: '/library',  icon: 'brain'      as const, label: 'Library'  },
  { to: '/profile',  icon: 'profile'    as const, label: 'You'      },
] as const;

// Pages that show the logo top-bar (no back button)
const MAIN_PATHS = new Set(['/', '/clips', '/podcasts', '/library', '/profile', '/notebook']);

// Prefix match for dynamic routes (DetailView covers the shell anyway via position:fixed z-100)
function isItemRoute(p: string) { return p.startsWith('/item/'); }

// Sub-page back targets
const SUB_PAGE_META: Record<string, { title: string; back: string }> = {
  '/settings':   { title: 'Settings',  back: '/profile' },
  '/capture':    { title: 'Capture',   back: '/profile' },
  '/notebook':   { title: 'Notebook',  back: '/profile' },
  '/saved':      { title: 'Saved',     back: '/library' },
  '/brain':      { title: 'Knowledge', back: '/library' },
};

export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMain  = MAIN_PATHS.has(pathname) || isItemRoute(pathname);
  const subMeta = SUB_PAGE_META[pathname];

  return (
    <div className="shell">
      {/* ── Top bar ───────────────────────────────── */}
      <nav className="nav">
        {isMain ? (
          <>
            <div className="nav__brand">
              <img src="/assets/logo-wide.jpeg" alt="Radar" className="nav__logo-img" />
            </div>
            <div className="nav__spacer" />
          </>
        ) : (
          <>
            <button
              className="icon-btn nav__back"
              onClick={() => navigate(subMeta?.back ?? (-1 as never))}
              aria-label="Go back"
            >
              <Icon name="left" size={20} />
            </button>
            <span className="nav__page-title">
              {subMeta?.title ?? pathname.replace('/', '')}
            </span>
            <div style={{ width: 40 }} />
          </>
        )}
      </nav>

      <main className="shell__main">
        <Outlet />
      </main>

      <PwaInstall />

      {/* ── Bottom dock ───────────────────────────── */}
      <nav className="dock" role="navigation" aria-label="Main navigation">
        {DOCK_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `dock__item${isActive ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
