import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PwaInstall } from './PwaInstall';
import { Icon } from './Icon';

const LEFT_NAV  = [
  { to: '/',      icon: 'feed'     as const, label: 'Feed'  },
  { to: '/saved', icon: 'bookmark' as const, label: 'Saved' },
] as const;

const RIGHT_NAV = [
  { to: '/brain',   icon: 'brain'   as const, label: 'Brain' },
  { to: '/profile', icon: 'profile' as const, label: 'You'   },
] as const;

// Pages that show the logo top-bar (no back button)
const MAIN_PATHS = new Set(['/', '/saved', '/brain', '/profile', '/clips', '/podcasts', '/notebook']);

// Sub-page back targets
const SUB_PAGE_META: Record<string, { title: string; back: string }> = {
  '/settings':  { title: 'Settings',    back: '/profile' },
  '/capture':   { title: 'Capture',     back: '/'        },
  '/notebook':  { title: 'Notebook',    back: '/profile' },
  '/clips':     { title: 'Clips',       back: '/'        },
  '/podcasts':  { title: 'Podcasts',    back: '/'        },
};

export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMain = MAIN_PATHS.has(pathname);
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
            <NavLink to="/settings" className="icon-btn" aria-label="Settings">
              <Icon name="settings" size={20} />
            </NavLink>
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
        {LEFT_NAV.map(item => (
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

        {/* Centre FAB — Capture */}
        <button
          className="dock__fab"
          onClick={() => navigate('/capture')}
          aria-label="Capture"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {RIGHT_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
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
