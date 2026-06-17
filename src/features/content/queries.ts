import { useQuery } from '@tanstack/react-query';
import type { ContentType } from '../../lib/types';
import { fetchContentById, fetchFeed, fetchKeyMoments, fetchTopics } from './contentApi';

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
