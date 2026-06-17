import { useQuery } from '@tanstack/react-query';
import { fetchDueCount, fetchDueReviews, fetchWeeklyReview } from './reviewsApi';

export function useDueReviews(limit = 20) {
  return useQuery({ queryKey: ['due-reviews', limit], queryFn: () => fetchDueReviews(limit) });
}

export function useDueCount() {
  return useQuery({ queryKey: ['due-count'], queryFn: fetchDueCount, staleTime: 60_000 });
}

export function useWeeklyReview() {
  return useQuery({ queryKey: ['weekly-review'], queryFn: fetchWeeklyReview });
}
