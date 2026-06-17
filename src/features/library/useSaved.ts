import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../stores/auth';
import { fetchSavedIds, removeSavedItem, saveItem } from './libraryApi';

// Saved-content state with an optimistic toggle (bookmark flips instantly).
export function useSaved() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  const key = ['saved-ids', userId];

  const { data: ids = [] } = useQuery({
    queryKey: key,
    queryFn: fetchSavedIds,
    enabled: !!userId,
  });
  const set = useMemo(() => new Set(ids), [ids]);

  const toggle = useMutation({
    mutationFn: ({ contentId, save }: { contentId: string; save: boolean }) =>
      save ? saveItem(contentId) : removeSavedItem(contentId),
    onMutate: async ({ contentId, save }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<string[]>(key) ?? [];
      const next = save
        ? Array.from(new Set([contentId, ...prev]))
        : prev.filter((id) => id !== contentId);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const isSaved = useCallback((id: string) => set.has(id), [set]);
  const toggleSave = useCallback(
    (id: string) => toggle.mutate({ contentId: id, save: !set.has(id) }),
    [set, toggle],
  );

  return { isSaved, toggleSave };
}
