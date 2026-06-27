import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateInterests, useAuth } from '../lib/auth';

interface Interest {
  id: string;
  label: string;
  emoji: string;
}

const INTERESTS: Interest[] = [
  { id: 'tech',      label: 'Tech',              emoji: '💻' },
  { id: 'business',  label: 'Business',          emoji: '📈' },
  { id: 'finance',   label: 'Finance',           emoji: '💰' },
  { id: 'politics',  label: 'Politics',          emoji: '🏛️' },
  { id: 'science',   label: 'Science',           emoji: '🔬' },
  { id: 'health',    label: 'Health',            emoji: '❤️' },
  { id: 'climate',   label: 'Climate',           emoji: '🌍' },
  { id: 'sports',    label: 'Sports',            emoji: '⚽' },
  { id: 'music',     label: 'Music',             emoji: '🎵' },
  { id: 'film',      label: 'Film & TV',         emoji: '🎬' },
  { id: 'education', label: 'Education',         emoji: '📚' },
  { id: 'fashion',   label: 'Fashion',           emoji: '👗' },
  { id: 'travel',    label: 'Travel & Lifestyle', emoji: '✈️' },
  { id: 'faith',     label: 'Faith & Philosophy', emoji: '🙏' },
];

function detectLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data = await res.json() as { address?: { city?: string; state?: string; country?: string; country_code?: string } };
          const a = data.address;
          const parts = [a?.city ?? a?.state, a?.country].filter(Boolean);
          resolve(parts.join(', ') || null);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 5000 },
    );
  });
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setPrefs, interests: existingInterests, onboardingDone } = useAuth();
  const isEditing = onboardingDone;
  const [selected, setSelected] = useState<Set<string>>(new Set(existingInterests));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Auto-detect location in background
  const [location, setLocation] = useState<string | null>(null);
  const [locationAsked, setLocationAsked] = useState(false);

  useEffect(() => {
    // Passively ask — no hard block on user flow
    detectLocation().then(setLocation);
    setLocationAsked(true);
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size < 3) { setError('Pick at least 3 topics to personalise your feed.'); return; }
    setLoading(true);
    setError('');
    try {
      const interests = [...selected];
      await updateInterests(interests, location ?? undefined, true);
      setPrefs({ interests, location: location ?? null, onboardingDone: true });
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    // Skip — mark onboarding done silently, go home
    updateInterests([], undefined, true).catch(() => {});
    navigate('/', { replace: true });
  }

  return (
    <div className="onboarding">
      <div className="onboarding__inner">
        <div className="onboarding__head">
          <div className="onboarding__logo">⚡</div>
          <h1 className="onboarding__title">{isEditing ? 'Your interests' : 'What moves you?'}</h1>
          <p className="onboarding__sub">
            {isEditing
              ? 'Update the topics you care about. Your feed will reflect your picks.'
              : 'Pick at least 3 topics and Radar will curate a feed built around your world.'}
          </p>
        </div>

        <div className="onboarding__grid">
          {INTERESTS.map(({ id, label, emoji }) => (
            <button
              key={id}
              type="button"
              className={`onboarding__chip${selected.has(id) ? ' onboarding__chip--active' : ''}`}
              onClick={() => toggle(id)}
            >
              <span className="onboarding__chip-emoji">{emoji}</span>
              <span className="onboarding__chip-label">{label}</span>
              {selected.has(id) && <span className="onboarding__chip-check">✓</span>}
            </button>
          ))}
        </div>

        {location && (
          <p className="onboarding__location">
            📍 {location} detected — we'll show local context in your feed.
          </p>
        )}

        {error && <p className="auth-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}

        <div className="onboarding__actions">
          <button
            className="btn btn--primary onboarding__cta"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : isEditing ? `Save (${selected.size})` : `Continue${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
          {!isEditing && (
            <button className="auth-link onboarding__skip" type="button" onClick={handleSkip}>
              Skip for now
            </button>
          )}
          {isEditing && (
            <button className="auth-link onboarding__skip" type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
