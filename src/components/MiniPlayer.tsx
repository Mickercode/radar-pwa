import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../stores/player';
import { Icon } from './Icon';
import '../features/player/player.css';

export function MiniPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const toggle = usePlayer((s) => s.toggle);
  const close = usePlayer((s) => s.close);

  if (!current || location.pathname === '/player') return null;

  return (
    <div className="mini" onClick={() => navigate('/player')}>
      <div className="mini__art" />
      <div className="mini__main">
        <div className="mini__title">{current.title}</div>
        <div className="mini__src">{current.source}</div>
      </div>
      <button
        className="mini__btn"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <Icon name={playing ? 'pause' : 'play'} size={18} />
      </button>
      <button
        className="mini__close"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Close player"
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  );
}
