import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { MiniPlayer } from '../components/MiniPlayer';
import './shell.css';

function Bars() {
  return (
    <span className="nav__bars" aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `dock__item${isActive ? ' is-active' : ''}`;

export function AppShell() {
  return (
    <div className="shell">
      <header className="nav">
        <NavLink to="/" className="nav__brand">
          <Bars />
          Radar
        </NavLink>
      </header>

      <main className="shell__main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <MiniPlayer />

      {/* Floating pill dock — the primary navigation on every viewport. */}
      <nav className="dock">
        <NavLink to="/" end className={itemClass}>
          <Icon name="feed" size={22} />
          Feed
        </NavLink>
        <NavLink to="/brain" className={itemClass}>
          <Icon name="brain" size={22} />
          Brain
        </NavLink>
        <NavLink to="/capture" className="dock__fab" aria-label="Save to Radar">
          <Icon name="capture" size={24} />
        </NavLink>
        <NavLink to="/review" className={itemClass}>
          <Icon name="review" size={22} />
          Review
        </NavLink>
        <NavLink to="/profile" className={itemClass}>
          <Icon name="profile" size={22} />
          You
        </NavLink>
      </nav>
    </div>
  );
}
