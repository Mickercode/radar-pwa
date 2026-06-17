import { api } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import { mockContent } from '../../lib/mockData';
import type { ContentItem } from '../../lib/types';

// Saved items. Backend scopes by JWT; in demo mode we keep a local set.
const DEMO_KEY = 'radar_demo_saved';

function demoSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}
function writeDemo(set: Set<string>): void {
  localStorage.setItem(DEMO_KEY, JSON.stringify([...set]));
}

export async function fetchSavedIds(): Promise<string[]> {
  if (DEMO_MODE) return [...demoSet()];
  const { data } = await api.get('/saved');
  return (data as ContentItem[]).map((c) => c.id);
}

export async function fetchSavedItems(): Promise<ContentItem[]> {
  if (DEMO_MODE) return mockContent.filter((c) => demoSet().has(c.id));
  const { data } = await api.get('/saved');
  return data;
}

export async function saveItem(contentId: string): Promise<void> {
  if (DEMO_MODE) {
    const s = demoSet();
    s.add(contentId);
    writeDemo(s);
    return;
  }
  await api.post('/saved', { contentId });
}

export async function removeSavedItem(contentId: string): Promise<void> {
  if (DEMO_MODE) {
    const s = demoSet();
    s.delete(contentId);
    writeDemo(s);
    return;
  }
  await api.delete(`/saved/${contentId}`);
}
