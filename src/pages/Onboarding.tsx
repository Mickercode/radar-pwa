import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopics } from '../features/content/queries';
import { savePreferences } from '../features/account/preferencesApi';
import { useAuth } from '../stores/auth';
import { Icon } from '../components/Icon';

const CONTENT_TYPES = [
  { key: 'podcast', label: 'Podcasts', icon: 'headphones' },
  { key: 'news', label: 'News articles', icon: 'feed' },
  { key: 'clip', label: 'Short clips', icon: 'play' },
];
const LOCATIONS = ['Nigeria', 'Other African country', 'International'];

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useAuth((s) => s.completeOnboarding);
  const name = useAuth((s) => s.user?.name);
  const { data: topics = [] } = useTopics();

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function finish() {
    // preferred_country is client-side only for now (no backend field yet).
    await savePreferences({ topic_ids: picked, content_types: types });
    localStorage.setItem('radar_country', location);
    completeOnboarding();
    navigate('/', { replace: true });
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: 560 }}>
      <div className="page-kicker">Step {step + 1} of 3</div>

      {step === 0 && (
        <div className="rise">
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
            Welcome{name ? `, ${name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="page-sub" style={{ marginBottom: '1.5rem' }}>Pick at least 3 things you care about.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            {topics.map((t) => {
              const on = picked.includes(t.id);
              return (
                <button key={t.id} className="listrow" style={{ borderColor: on ? 'var(--cyan)' : undefined, justifyContent: 'space-between' }} onClick={() => toggle(picked, setPicked, t.id)}>
                  <div className="listrow__title">{t.name}</div>
                  {on && <Icon name="check" size={18} className="listrow__chev" style={{ color: 'var(--cyan)' }} />}
                </button>
              );
            })}
          </div>
          <button className="btn btn--primary btn--block" style={{ marginTop: '1.5rem' }} disabled={picked.length < 3} onClick={() => setStep(1)}>
            Continue ({picked.length}/3)
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="rise">
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>What do you want to see?</h1>
          <p className="page-sub" style={{ marginBottom: '1.5rem' }}>Pick at least one format.</p>
          <div className="stack">
            {CONTENT_TYPES.map((c) => {
              const on = types.includes(c.key);
              return (
                <button key={c.key} className="listrow" style={{ borderColor: on ? 'var(--cyan)' : undefined }} onClick={() => toggle(types, setTypes, c.key)}>
                  <Icon name={c.icon} size={20} className="listrow__chev" />
                  <div className="listrow__main"><div className="listrow__title">{c.label}</div></div>
                  {on && <Icon name="check" size={18} className="listrow__chev" style={{ color: 'var(--cyan)' }} />}
                </button>
              );
            })}
          </div>
          <div className="actionbar">
            <button className="btn btn--ghost" onClick={() => setStep(0)}>Back</button>
            <button className="btn btn--primary" disabled={types.length < 1} onClick={() => setStep(2)}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rise">
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Where are you based?</h1>
          <p className="page-sub" style={{ marginBottom: '1.5rem' }}>Tunes your Nigeria-first ranking.</p>
          <div className="stack">
            {LOCATIONS.map((l) => (
              <button key={l} className="listrow" style={{ borderColor: location === l ? 'var(--cyan)' : undefined }} onClick={() => setLocation(l)}>
                <div className="listrow__main"><div className="listrow__title">{l}</div></div>
                {location === l && <Icon name="check" size={18} className="listrow__chev" style={{ color: 'var(--cyan)' }} />}
              </button>
            ))}
          </div>
          <div className="actionbar">
            <button className="btn btn--ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn--primary" disabled={!location} onClick={finish}>Enter Radar</button>
          </div>
        </div>
      )}
    </div>
  );
}
