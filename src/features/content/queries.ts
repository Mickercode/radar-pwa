import { useQuery } from '@tanstack/react-query';
import type { ContentType } from '../../lib/types';
import { fetchContentById, fetchContentSources, fetchFeed, fetchKeyMoments, fetchMediaStackNews, fetchMediaStackNewsByTopic, fetchTopics } from './contentApi';

export function useTopics() {
  return useQuery({ queryKey: ['topics'], queryFn: fetchTopics, staleTime: 5 * 60_000 });
}

export function useFeed(topicIds?: string[]) {
  return useQuery({
    queryKey: ['feed', topicIds ?? []],
    queryFn: () => fetchFeed(topicIds),
  });
}

export function useContent(id: string | undefined) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => fetchContentById(id!),
    enabled: !!id,
  });
}

export function useKeyMoments(contentId: string | undefined) {
  return useQuery({
    queryKey: ['key-moments', contentId],
    queryFn: () => fetchKeyMoments(contentId!),
    enabled: !!contentId,
  });
}

// Re-export for screens that want a type-narrowed filter helper.
export type { ContentType };

// MediaStack news hooks
export function useMediaStackNews(location?: string) {
  return useQuery({
    queryKey: ['mediastack-news', location],
    queryFn: () => fetchMediaStackNews(location),
    staleTime: 10 * 60_000, // 10 minutes
  });
}

export function useMediaStackNewsByTopic(topicSlug: string, location?: string) {
  return useQuery({
    queryKey: ['mediastack-news-topic', topicSlug, location],
    queryFn: () => fetchMediaStackNewsByTopic(topicSlug, location),
    staleTime: 10 * 60_000,
    enabled: !!topicSlug,
  });
}

// Content sources hook
export function useContentSources(category: string, location: string) {
  return useQuery({
    queryKey: ['content-sources', category, location],
    queryFn: () => fetchContentSources(category, location),
    staleTime: 60 * 60_000, // 1 hour - sources don't change often
  });
}
