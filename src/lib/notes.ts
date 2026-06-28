import { getToken } from './auth';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const LOCAL_KEY = 'radar:notes';

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ── Local cache helpers (offline / not-logged-in fallback) ────────────────────

function localLoad(): Note[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as Note[]; }
  catch { return []; }
}

function localSave(notes: Note[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
}

function localUpsert(note: Note) {
  const notes = localLoad().filter(n => n.id !== note.id);
  localSave([note, ...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
}

function localDelete(id: string) {
  localSave(localLoad().filter(n => n.id !== id));
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

function isLoggedIn() { return !!getToken(); }

// ── Public API ────────────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Load notes — from BE if logged in, localStorage otherwise. */
export async function loadNotes(): Promise<Note[]> {
  if (!isLoggedIn()) return localLoad();
  try {
    const res = await fetch(`${BASE}/notes`, { headers: headers({}) });
    if (!res.ok) return localLoad();
    const notes = (await res.json()) as Note[];
    localSave(notes); // keep local cache in sync
    return notes;
  } catch {
    return localLoad();
  }
}

/** Create a new empty note. */
export async function createNote(): Promise<Note> {
  if (!isLoggedIn()) {
    const now = new Date().toISOString();
    const note: Note = { id: crypto.randomUUID(), title: '', body: '', createdAt: now, updatedAt: now };
    localUpsert(note);
    return note;
  }
  const res = await fetch(`${BASE}/notes`, { method: 'POST', headers: headers(), body: JSON.stringify({ title: '', body: '' }) });
  if (!res.ok) throw new Error('Failed to create note');
  const note = (await res.json()) as Note;
  localUpsert(note);
  return note;
}

/** Save title/body changes. Returns updated note. */
export async function updateNote(id: string, changes: { title?: string; body?: string }): Promise<Note> {
  // Optimistically update local cache
  const cached = localLoad().find(n => n.id === id);
  const optimistic: Note = {
    ...(cached ?? { id, title: '', body: '', createdAt: new Date().toISOString() }),
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  localUpsert(optimistic);

  if (!isLoggedIn()) return optimistic;

  try {
    const res = await fetch(`${BASE}/notes/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(changes),
    });
    if (!res.ok) return optimistic;
    const updated = (await res.json()) as Note;
    localUpsert(updated);
    return updated;
  } catch {
    return optimistic;
  }
}

/** Delete a note. */
export async function deleteNote(id: string): Promise<void> {
  localDelete(id);
  if (!isLoggedIn()) return;
  try {
    await fetch(`${BASE}/notes/${id}`, { method: 'DELETE', headers: headers() });
  } catch { /* local delete already done */ }
}
