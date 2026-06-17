import { api } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import { mockDueReviews, mockWeekly } from '../../lib/mockBrain';
import type { DueReview, InsightReview, WeeklyReview } from '../../lib/types';

export async function fetchDueReviews(limit = 20): Promise<DueReview[]> {
  if (DEMO_MODE) return mockDueReviews.slice(0, limit);
  const { data } = await api.get('/reviews/due', { params: { limit } });
  return data;
}

export async function fetchDueCount(): Promise<number> {
  if (DEMO_MODE) return mockDueReviews.length;
  const { data } = await api.get('/reviews/due/count');
  return data as number;
}

export async function submitReview(reviewId: string, grade: 0 | 1): Promise<InsightReview | null> {
  if (DEMO_MODE) {
    const found = mockDueReviews.find((r) => r.review.id === reviewId);
    return found ? { ...found.review, step: grade ? found.review.step + 1 : 0 } : null;
  }
  const { data } = await api.post(`/reviews/${reviewId}/submit`, { grade });
  return data;
}

export async function fetchWeeklyReview(): Promise<WeeklyReview> {
  if (DEMO_MODE) return mockWeekly();
  const { data } = await api.get('/weekly-review');
  return data;
}
