import { api, isNotFound } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import {
  getMockContent,
  getMockKeyMoments,
  mockContent,
  mockTopics,
} from '../../lib/mockData';
import { fetchNewsFromMediaStack, fetchNewsByTopic } from '../../lib/mediastack';
import { getSourcesByCategoryAndLocation } from '../../lib/contentSources';
import type { ContentItem, ContentType, FeedResult, KeyMoment, Topic } from '../../lib/types';

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

// Fetch news from MediaStack API (supplements backend data)
export async function fetchMediaStackNews(location?: string, limit: number = 20): Promise<ContentItem[]> {
  return fetchNewsFromMediaStack(undefined, location, limit);
}

// Fetch news from MediaStack for specific topic
export async function fetchMediaStackNewsByTopic(topicSlug: string, location?: string): Promise<ContentItem[]> {
  return fetchNewsByTopic(topicSlug, location, 10);
}

// Fetch content sources for a category and location
export function fetchContentSources(category: string, location: string) {
  return getSourcesByCategoryAndLocation(category, location);
}
