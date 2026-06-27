import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { PwaInstall } from './PwaInstall';
import { Icon } from './Icon';

const LEFT_NAV  = [
  { to: '/',         icon: 'feed'       as const, label: 'Feed'     },
  { to: '/clips',    icon: 'play'       as const, label: 'Clips'    },
  { to: '/podcasts', icon: 'headphones' as const, label: 'Podcasts' },
] as const;

const RIGHT_NAV = [
  { to: '/brain',    icon: 'brain'      as const, label: 'Brain'    },
  { to: '/notebook', icon: 'notebook'   as const, label: 'Notes'    },
  { to: '/profile',  icon: 'profile'    as const, label: 'You'      },
] as const;

export function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="shell">
      {/* Top bar */}
      <nav className="nav">
        <div className="nav__brand">
          <img src="/assets/logo-icon.jpeg" alt="Radar" className="nav__logo" width={52} height={52} />
        </div>
        <div className="nav__spacer" />
        <NavLink to="/saved" className="icon-btn" aria-label="Saved">
          <Icon name="bookmark" size={20} />
        </NavLink>
        <NavLink to="/settings" className="icon-btn" aria-label="Settings">
          <Icon name="settings" size={20} />
        </NavLink>
      </nav>

      <main className="shell__main">
        <Outlet />
      </main>

      <PwaInstall />

      {/* Bottom dock with center FAB */}
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

        {/* Centre FAB */}
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
