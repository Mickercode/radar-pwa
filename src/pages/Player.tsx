import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../stores/player';
import { Icon } from '../components/Icon';
import { clock } from '../lib/format';
import '../features/player/player.css';

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function Player() {
  const navigate = useNavigate();
  const { current, playing, position, duration, speed, toggle, seek, skip, setSpeed } = usePlayer();

  useEffect(() => {
    if (!current) navigate('/', { replace: true });
  }, [current, navigate]);

  if (!current) return null;

  return (
    <div className="rise">
      <div className="subhead">
        <button className="backbtn" onClick={() => navigate(-1)} aria-label="Minimise">
          <Icon name="left" size={20} />
        </button>
        <span className="page-kicker">Now playing</span>
      </div>

      <div className="player">
        <div className="player__art">
          <Icon name="headphones" size={64} />
        </div>
        <div>
          <h1 className="player__title">{current.title}</h1>
        </div>
        <div className="player__src">{current.source}</div>

        <div className="player__seek">
          <input
            className="player__range"
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(position, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
          />
          <div className="player__time">
            <span>{clock(position)}</span>
            <span>{duration ? clock(duration) : '--:--'}</span>
          </div>
        </div>

        <div className="player__controls">
          <button className="player__skip" onClick={() => skip(-15)}>
            <Icon name="left" size={26} />
            15
          </button>
          <button className="player__play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            <Icon name={playing ? 'pause' : 'play'} size={30} />
          </button>
          <button className="player__skip" onClick={() => skip(30)}>
            <Icon name="right" size={26} />
            30
          </button>
        </div>

        <div className="player__speeds">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`seg${speed === s ? ' is-active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
