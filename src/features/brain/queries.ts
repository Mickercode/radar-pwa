import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../stores/auth';
import {
  fetchKnowledgeWebGaps,
  fetchKnowledgeWebGrowth,
  fetchKnowledgeWebStats,
} from './knowledgeWebApi';

export function useKnowledgeWebStats() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['knowledge-web-stats', userId],
    queryFn: fetchKnowledgeWebStats,
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useKnowledgeWebGaps() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['knowledge-web-gaps', userId],
    queryFn: fetchKnowledgeWebGaps,
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useKnowledgeWebGrowth() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ['knowledge-web-growth', userId],
    queryFn: fetchKnowledgeWebGrowth,
    enabled: !!userId,
    staleTime: 60_000,
  });
}
