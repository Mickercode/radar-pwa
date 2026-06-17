import { api, isNotFound } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import {
  getMockContent,
  getMockKeyMoments,
  mockContent,
  mockTopics,
} from '../../lib/mockData';
import type { ContentItem, ContentType, FeedResult, KeyMoment, Topic } from '../../lib/types';

// Catalog data from radar-backend (or mock data in demo mode).

export async function fetchTopics(): Promise<Topic[]> {
  if (DEMO_MODE) return mockTopics;
  const { data } = await api.get('/topics');
  return data;
}

export async function fetchFeed(topicIds?: string[]): Promise<FeedResult> {
  if (DEMO_MODE) {
    return { items: mockContent, isFallback: false, matchedTopics: mockContent.length };
  }
  const params = topicIds && topicIds.length ? { topicIds: topicIds.join(',') } : undefined;
  const { data } = await api.get('/feed', { params });
  return data;
}

export async function fetchContentByType(type: ContentType): Promise<ContentItem[]> {
  if (DEMO_MODE) return mockContent.filter((c) => c.type === type);
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
