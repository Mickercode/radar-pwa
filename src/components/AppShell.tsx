import { Outlet, NavLink } from 'react-router-dom';
import { PwaInstall } from './PwaInstall';
import { Icon } from './Icon';

const navItems = [
  { to: '/',          icon: 'feed'       as const, label: 'Feed'     },
  { to: '/clips',     icon: 'play'       as const, label: 'Clips'    },
  { to: '/podcasts',  icon: 'headphones' as const, label: 'Podcasts' },
  { to: '/capture',   icon: 'capture'    as const, label: 'Capture'  },
  { to: '/brain',     icon: 'brain'      as const, label: 'Brain'    },
  { to: '/profile',   icon: 'profile'    as const, label: 'You'      },
] as const;

export function AppShell() {
  return (
    <div className="shell">
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

      <nav className="dock" role="navigation" aria-label="Main navigation">
        {navItems.map(item => (
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
