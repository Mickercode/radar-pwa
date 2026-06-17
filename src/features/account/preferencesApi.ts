import { api } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import type { UserPreferences } from '../../lib/types';

// User preferences (topics, content types, playback speed, push token).
// preferred_country / notification_time are NOT in the backend yet — see
// BACKEND_HANDOFF.md. We persist them client-side for now.
const DEMO_KEY = 'radar_demo_prefs';

export async function fetchPreferences(): Promise<UserPreferences | null> {
  if (DEMO_MODE) {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      return raw ? (JSON.parse(raw) as UserPreferences) : null;
    } catch {
      return null;
    }
  }
  const { data } = await api.get('/preferences');
  return data;
}

export async function savePreferences(patch: Partial<UserPreferences>): Promise<void> {
  if (DEMO_MODE) {
    const current = (await fetchPreferences()) ?? {
      topic_ids: [],
      content_types: [],
      playback_speed: 1,
    };
    localStorage.setItem(DEMO_KEY, JSON.stringify({ ...current, ...patch }));
    return;
  }
  await api.put('/preferences', patch);
}
