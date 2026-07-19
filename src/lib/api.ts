// Typed API client for the Radar backend.
import { getToken, clearAuth as clearAuthStore } from './auth';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

/** Build headers, injecting the Bearer token when available. */
function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Extract a human-readable message from an error response, never leaking raw JSON. */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    const json = JSON.parse(text) as Record<string, unknown>;
    const msg = (json.error ?? json.message ?? json.msg) as string | undefined;
    if (msg && typeof msg === 'string') return msg;
  } catch { /* not JSON */ }
  const GENERIC: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'You need to sign in to do that.',
    403: 'You don\'t have permission to do that.',
    404: 'That resource could not be found.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again.',
    502: 'Service temporarily unreachable. Please try again.',
    503: 'Service temporarily unavailable. Please try again later.',
  };
  return GENERIC[res.status] ?? 'Something went wrong. Please try again.';
}

/** Handle 401 responses — clear auth and redirect to login. */
function handleAuthError(status: number): void {
  if (status === 401) {
    clearAuthStore();
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.pathname = '/login';
    }
  }
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    handleAuthError(res.status);
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Summary {
  id: string;
  contentId: string;
  summary: string;
  keyTakeaways: string[];
  whyItMatters: string;
  what?: string;
  why?: string;
  howItMattersToYou?: string;
  glossary: string[];
  tier?: 1 | 2 | 3;
  nigeriaRelevance?: 0 | 1 | 2 | 3;
}

export interface ContentItem {
  id: string;
  type: 'news' | 'podcast' | 'clip';
  title: string;
  source: string;
  duration: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  articleUrl?: string;
  videoUrl?: string;
  externalId?: string;
  topicId?: string | null;
  topicSlug?: string;
  /** Slug returned by live routes (no DB topicId available) */
  topic?: string;
  createdAt: string;
  summary?: Summary;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

export interface FeedResult {
  items: ContentItem[];
  isFallback: boolean;
  matchedTopics: number;
}

// ── Podcast Index types (mirrors the backend return shape) ─────────────────────

export interface PodcastFeed {
  id: number;
  title: string;
  url: string;
  image: string;
  description: string;
  author?: string;
  language: string;
  categories?: Record<string, string>;
  itunesId?: number;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  enclosureUrl: string;
  enclosureType: string;
  description: string;
  duration: number;
  datePublished: number;
  feedId: number;
  feedTitle: string;
  feedImage?: string;
}

interface PodcastSearchResult {
  status: boolean;
  feeds: PodcastFeed[];
  count: number;
}

interface EpisodeResult {
  status: boolean;
  items: PodcastEpisode[];
  count: number;
}

// ── Capture types ────────────────────────────────────────────────────────────

export interface KeyMoment {
  id: string;
  contentId: string;
  timestampSec: number;
  label: string;
}

export interface InsightsReport {
  pattern: string;
  strengths: string;
  blindSpots: string;
  topTypes: Record<string, number>;
  totalItems: number;
}

export interface CapturedInsight {
  sourceUrl: string;
  title: string;
  what: string;
  keyTakeaways: string[];
  why: string;
  howItMattersToYou: string;
  glossary: string[];
  tier: 1 | 2 | 3;
  nigeriaRelevance: 0 | 1 | 2 | 3;
}

// ── Endpoints ──────────────────────────────────────────────────────────────────

export const api = {
  topics: () => get<Topic[]>('/topics'),

  feed: (topicIds?: string[], country?: string, interests?: string[]) => {
    const params: Record<string, string> = {};
    if (topicIds?.length) params.topicIds = topicIds.join(',');
    if (country) params.country = country;
    if (interests?.length) params.interests = interests.join(',');
    return get<FeedResult>('/feed', params);
  },

  contentByType: (type: 'news' | 'podcast' | 'clip') =>
    get<ContentItem[]>('/content', { type }),

  liveClips: () => get<ContentItem[]>('/clips/live'),

  livePodcasts: () => get<ContentItem[]>('/podcasts/live'),

  searchPodcasts: (q: string, max = 20) =>
    get<PodcastSearchResult>('/podcasts/search', { q, max: String(max) }),

  podcastEpisodes: (feedId: number, max = 20) =>
    get<EpisodeResult>(`/podcasts/${feedId}/episodes`, { max: String(max) }),

  podcastEpisodesByFeedUrl: (url: string, max = 20) =>
    get<EpisodeResult>('/podcasts/by-feed-url/episodes', { url, max: String(max) }),

  contentById: (id: string) => get<ContentItem>(`/content/${id}`),

  keyMoments: (contentId: string) => get<KeyMoment[]>(`/content/${contentId}/key-moments`),

  insightsReport: (items: Array<{ title: string; type: string; source: string }>) =>
    fetch(BASE + '/ai/insights-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ items }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      return res.json() as Promise<InsightsReport>;
    }),

  capture: (url: string) => {
    const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
    return fetch(BASE + '/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ url }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      return res.json() as Promise<CapturedInsight>;
    });
  },

  adminStats: () => get<import('../pages/admin').AdminStats>('/admin/stats'),

  grantAdmin: (email: string) =>
    fetch(BASE + '/admin/grant-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      return res.json() as Promise<{ ok: boolean; email: string }>;
    }),

  analyseFile: (file: File) => {
    const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
    const form = new FormData();
    form.append('file', file);
    return fetch(BASE + '/content/analyse/upload', {
      method: 'POST',
      headers: authHeaders(), // no Content-Type — browser sets multipart boundary
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        if (res.status === 402) throw new Error('Monthly upload limit reached. Upgrade to premium.');
        throw new Error(await extractErrorMessage(res));
      }
      return res.json() as Promise<CapturedInsight>;
    });
  },
};
