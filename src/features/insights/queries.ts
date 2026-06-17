import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  return useQuery({ queryKey: ['insights', limit], queryFn: () => fetchInsights(limit) });
}

export function useBrainSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['brain-search', trimmed.toLowerCase()],
    queryFn: () => searchInsights(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function useInsightGraph(id: string | undefined) {
  return useQuery({
    queryKey: ['insight-graph', id],
    queryFn: () => fetchInsightGraph(id!),
    enabled: !!id,
  });
}

export function useQuiz(insightId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', insightId],
    queryFn: () => fetchQuiz(insightId!),
    enabled: !!insightId,
  });
}

export function useSaveInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveInsightInput) => {
      const insight = await saveInsight(input);
      autolinkInsight(insight.id); // fire-and-forget
      return insight;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insights'] }),
  });
}

export function useCaptureUrl() {
  return useMutation({ mutationFn: (url: string) => captureUrl(url) });
}
