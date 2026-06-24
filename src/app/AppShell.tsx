import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { MiniPlayer } from '../components/MiniPlayer';
import { PwaInstall } from '../components/PwaInstall';
import './shell.css';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `dock__item${isActive ? ' is-active' : ''}`;

export function AppShell() {
  return (
    <div className="shell">
      <header className="nav">
        <NavLink to="/" className="nav__brand">
          <img src="/assets/logo-banner.jpeg" alt="Radar" className="nav__logo" />
        </NavLink>
      </header>


      <main className="shell__main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <MiniPlayer />
      <PwaInstall />

      {/* Floating pill dock — the primary navigation on every viewport. */}
      <nav className="dock">
        <NavLink to="/" end className={itemClass}>
          <Icon name="feed" size={20} />
          Feed
        </NavLink>
        <NavLink to="/clips" className={itemClass}>
          <Icon name="clip" size={20} />
          Clips
        </NavLink>
        <NavLink to="/capture" className="dock__fab" aria-label="Save to Radar">
          <Icon name="capture" size={24} />
        </NavLink>
        <NavLink to="/brain" className={itemClass}>
          <Icon name="brain" size={20} />
          Brain
        </NavLink>
        <NavLink to="/profile" className={itemClass}>
          <Icon name="profile" size={20} />
          You
        </NavLink>
      </nav>
    </div>
  );
}
