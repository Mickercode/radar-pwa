import { api, isNotFound } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import {
  getMockContent,
  getMockKeyMoments,
  getMockClips,
  mockContent,
  mockTopics,
} from '../../lib/mockData';
import { fetchNewsFromMediaStack, fetchNewsByTopic } from '../../lib/mediastack';
import { getSourcesByCategoryAndLocation } from '../../lib/contentSources';
import type { CapturedInsight, ContentItem, ContentType, FeedResult, KeyMoment, Topic } from '../../lib/types';

// Catalog data from radar-backend (or mock data in demo mode).

export async function fetchTopics(): Promise<Topic[]> {
  if (DEMO_MODE) return mockTopics;
  const { data } = await api.get('/topics');
  return data;
}

export async function fetchFeed(topicIds?: string[]): Promise<FeedResult> {
  if (DEMO_MODE) {
    // Filter mock content by selected topicIds if provided
    const filteredItems = topicIds && topicIds.length
      ? mockContent.filter((item) => item.topicId && topicIds.includes(item.topicId))
      : mockContent;
    return {
      items: filteredItems,
      isFallback: false,
      matchedTopics: filteredItems.length,
    };
  }
  const params = topicIds && topicIds.length ? { topicIds: topicIds.join(',') } : undefined;
  const { data } = await api.get('/feed', { params });
  return data;
}

export async function fetchContentByType(type: ContentType): Promise<ContentItem[]> {
  if (DEMO_MODE) {
    // Include both mockContent clips and dedicated mockClips
    if (type === 'clip') {
      const contentClips = mockContent.filter((c) => c.type === type);
      return [...contentClips, ...getMockClips()];
    }
    return mockContent.filter((c) => c.type === type);
  }
  const { data } = await api.get('/content', { params: { type } });
  return data;
}

export async function fetchContentById(id: string): Promise<ContentItem | null> {
  if (DEMO_MODE) return getMockContent(id) ?? null;
  try {
    const { data } = await api.get(`/content/${id}`);
    return data;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function fetchKeyMoments(contentId: string): Promise<KeyMoment[]> {
  if (DEMO_MODE) return getMockKeyMoments(contentId);
  const { data } = await api.get(`/content/${contentId}/key-moments`);
  return data;
}

// Fetch news from MediaStack API (supplements backend data)
export async function fetchMediaStackNews(location?: string, limit: number = 20): Promise<ContentItem[]> {
  return fetchNewsFromMediaStack(undefined, location, limit);
}

// Fetch news from MediaStack for specific topic
export async function fetchMediaStackNewsByTopic(topicSlug: string, location?: string): Promise<ContentItem[]> {
  return fetchNewsByTopic(topicSlug, location, 10);
}

// ── File upload ─────────────────────────────────────────────────────────────

/** Upload a PDF, Word, or text file for AI analysis. Returns a CapturedInsight preview. */
export async function uploadFile(file: File): Promise<CapturedInsight> {
  if (DEMO_MODE) {
    return {
      sourceUrl: 'upload',
      title: file.name.replace(/\.[^/.]+$/, '') || 'Uploaded document',
      what: 'A concise distillation of the uploaded document would appear here once the backend AI pipeline runs.',
      why: 'Radar explains why it matters for a Nigerian / African reader.',
      edge: 'And gives you one concrete, non-obvious action to take.',
      tier: 2,
      nigeriaRelevance: 1,
    };
  }
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/content/analyse/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Fetch content sources for a category and location
export function fetchContentSources(category: string, location: string) {
  return getSourcesByCategoryAndLocation(category, location);
}
