import { api, isNotFound } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import { addMockInsight, mockGraph, mockInsights, mockQuiz } from '../../lib/mockBrain';
import type {
  CapturedInsight,
  Insight,
  InsightGraphSlice,
  QuizAttempt,
  QuizQuestion,
} from '../../lib/types';

export interface SaveInsightInput {
  sourceContentId?: string;
  title: string;
  what: string;
  why: string;
  edge: string;
  sourceText?: string;
  sourcePositionSec?: number;
  tier?: 1 | 2 | 3;
  tags?: string[];
}

// NOTE: backend has no DELETE /insights/:id yet — see BACKEND_HANDOFF.md.
export async function deleteInsight(id: string): Promise<void> {
  if (DEMO_MODE) {
    const idx = mockInsights.findIndex((i) => i.id === id);
    if (idx >= 0) mockInsights.splice(idx, 1);
    return;
  }
  await api.delete(`/insights/${id}`);
}

export async function fetchInsights(limit = 50): Promise<Insight[]> {
  if (DEMO_MODE) return mockInsights.slice(0, limit);
  const { data } = await api.get('/insights', { params: { limit } });
  return data;
}

export async function searchInsights(q: string): Promise<Insight[]> {
  const query = q.trim();
  if (!query) return [];
  if (DEMO_MODE) {
    const ql = query.toLowerCase();
    return mockInsights.filter((i) =>
      [i.title, i.what, i.why, i.edge].join(' ').toLowerCase().includes(ql),
    );
  }
  const { data } = await api.get('/insights', { params: { q: query } });
  return data;
}

export async function fetchInsightGraph(id: string): Promise<InsightGraphSlice | null> {
  if (DEMO_MODE) return mockGraph(id);
  try {
    const { data } = await api.get(`/insights/${id}/graph`);
    return data;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function saveInsight(input: SaveInsightInput): Promise<Insight> {
  if (DEMO_MODE) {
    return addMockInsight({
      title: input.title, what: input.what, why: input.why, edge: input.edge,
      tier: input.tier ?? 2, tags: input.tags ?? [],
      sourceContentId: input.sourceContentId, sourceText: input.sourceText,
      sourcePositionSec: input.sourcePositionSec,
    });
  }
  const { data } = await api.post('/insights', input);
  return data;
}

/** Fire-and-forget — embeds the insight and writes auto-edges server-side. */
export async function autolinkInsight(id: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await api.post(`/insights/${id}/autolink`);
  } catch {
    /* non-fatal */
  }
}

export async function recordShare(id: string, platform?: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await api.post(`/insights/${id}/share`, { platform });
  } catch {
    /* analytics only */
  }
}

function demoCapture(url: string): CapturedInsight {
  return {
    sourceUrl: url,
    title: 'Captured: ' + url.replace(/^https?:\/\//, '').slice(0, 40),
    what: 'A concise distillation of the linked page would appear here once the backend AI pipeline runs.',
    why: 'Radar explains why it matters for a Nigerian / African reader.',
    edge: 'And gives you one concrete, non-obvious action to take.',
    tier: 2,
    nigeriaRelevance: 1,
  };
}

export async function captureUrl(url: string): Promise<CapturedInsight> {
  if (DEMO_MODE) return demoCapture(url);
  const { data } = await api.post('/capture', { url });
  return data;
}

export async function fetchQuiz(insightId: string): Promise<QuizQuestion[]> {
  if (DEMO_MODE) return mockQuiz(insightId);
  const { data } = await api.get(`/insights/${insightId}/quiz`);
  return data;
}

export async function submitQuizAttempt(
  insightId: string,
  correctCount: number,
  totalCount: number,
): Promise<QuizAttempt | null> {
  if (DEMO_MODE) return null;
  try {
    const { data } = await api.post(`/insights/${insightId}/quiz/attempt`, {
      correctCount,
      totalCount,
    });
    return data;
  } catch {
    return null;
  }
}
