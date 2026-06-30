import type { ContentItem } from './api';
import { getToken } from './auth';

const KEY = 'radar:saved';
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

// UUID format check — only real content IDs (from the DB) sync to the BE.
// Captured items use 'capture:timestamp' IDs and stay local only.
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SavedItem {
  id: string;
  type: 'news' | 'podcast' | 'clip';
  title: string;
  source: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  articleUrl?: string;
  videoUrl?: string;
  externalId?: string;
  summary?: string;
  keyTakeaways: string[];
  whyItMatters?: string;
  howItMattersToYou?: string;
  glossary: string[];
  savedAt: string;
}

// ── Local storage ─────────────────────────────────────────────────────────────

function load(): SavedItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedItem[]; }
  catch { return []; }
}

function persist(items: SavedItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

// ── Sync: pull BE saved items into localStorage ───────────────────────────────

export async function syncSavedFromBE(): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${BASE}/saved`, { headers: authHeader() });
    if (!res.ok) return;
    const items: ContentItem[] = await res.json();
    // Merge BE items with existing local items (captures stay, BE items overwrite)
    const local = load().filter(i => !isUuid(i.id)); // keep non-UUID (captured) items
    const beItems: SavedItem[] = items.map(content => ({
      id: content.id,
      type: content.type,
      title: content.title,
      source: content.source,
      thumbnailUrl: content.thumbnailUrl,
      audioUrl: content.audioUrl,
      articleUrl: content.articleUrl,
      videoUrl: content.videoUrl,
      externalId: content.externalId,
      summary: content.summary?.what ?? content.summary?.summary,
      keyTakeaways: content.summary?.keyTakeaways ?? [],
      whyItMatters: content.summary?.whyItMatters,
      howItMattersToYou: content.summary?.howItMattersToYou,
      glossary: content.summary?.glossary ?? [],
      savedAt: content.createdAt,
    }));
    persist([...beItems, ...local]);
  } catch { /* network error — keep local state */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getSavedItems(): SavedItem[] {
  return load().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function isSaved(contentId: string): boolean {
  return load().some((i) => i.id === contentId);
}

export function saveItem(content: ContentItem): void {
  const items = load();
  if (items.some((i) => i.id === content.id)) return;

  const item: SavedItem = {
    id: content.id,
    type: content.type,
    title: content.title,
    source: content.source,
    thumbnailUrl: content.thumbnailUrl,
    audioUrl: content.audioUrl,
    articleUrl: content.articleUrl,
    videoUrl: content.videoUrl,
    externalId: content.externalId,
    summary: content.summary?.what ?? content.summary?.summary,
    keyTakeaways: content.summary?.keyTakeaways ?? [],
    howItMattersToYou: content.summary?.howItMattersToYou,
    glossary: content.summary?.glossary ?? [],
    savedAt: new Date().toISOString(),
  };
  persist([item, ...items]);

  // Fire-and-forget sync to BE for real content IDs
  if (isUuid(content.id) && getToken()) {
    fetch(`${BASE}/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ contentId: content.id }),
    }).catch(() => {});
  }
}

export function unsaveItem(contentId: string): void {
  persist(load().filter((i) => i.id !== contentId));

  if (isUuid(contentId) && getToken()) {
    fetch(`${BASE}/saved/${contentId}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).catch(() => {});
  }
}
