import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../stores/auth';
import {
  autolinkInsight,
  captureUrl,
  fetchInsightGraph,
  fetchInsights,
  fetchQuiz,
  saveInsight,
  searchInsights,
  type SaveInsightInput,
} from './insightsApi';

export function useInsights(limit = 50) {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['insights', userId, limit],
    queryFn: () => fetchInsights(limit),
    enabled: !!userId,
  });
}

export function useBrainSearch(query: string) {
  const userId = useAuth((s) => s.user?.id);
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['brain-search', userId, trimmed.toLowerCase()],
    queryFn: () => searchInsights(trimmed),
    enabled: trimmed.length >= 2 && !!userId,
    staleTime: 30_000,
  });
}

export function useInsightGraph(id: string | undefined) {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['insight-graph', userId, id],
    queryFn: () => fetchInsightGraph(id!),
    enabled: !!id && !!userId,
  });
}

export function useQuiz(insightId: string | undefined) {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['quiz', userId, insightId],
    queryFn: () => fetchQuiz(insightId!),
    enabled: !!insightId && !!userId,
  });
}

export function useSaveInsight() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveInsightInput) => {
      const insight = await saveInsight(input);
      autolinkInsight(insight.id); // fire-and-forget
      return insight;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insights', userId] }),
  });
}

export function useCaptureUrl() {
  return useMutation({ mutationFn: (url: string) => captureUrl(url) });
}
