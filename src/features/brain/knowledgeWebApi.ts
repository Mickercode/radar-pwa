import { api } from '../../lib/api';
import { DEMO_MODE } from '../../lib/demo';
import type { KnowledgeWebStats, KnowledgeWebGaps, KnowledgeWebGrowth } from '../../lib/types';
import { mockInsights, mockEdges } from './mockKnowledgeWeb';

export async function fetchKnowledgeWebStats(): Promise<KnowledgeWebStats> {
  if (DEMO_MODE) {
    const uniqueTags = new Set<string>();
    for (const i of mockInsights) {
      for (const t of i.tags) uniqueTags.add(t);
    }
    const tagCount = new Map<string, number>();
    for (const i of mockInsights) {
      for (const t of i.tags) {
        tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
      }
    }
    const topTags = [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalInsights: mockInsights.length,
      totalEdges: mockEdges.length,
      tierDistribution: { '1': 1, '2': 2, '3': 0 },
      newThisWeek: 2,
      newThisMonth: mockInsights.length,
      activeStreakDays: 5,
      topTags,
    };
  }
  const { data } = await api.get('/knowledge-web/stats');
  return data;
}

export async function fetchKnowledgeWebGaps(): Promise<KnowledgeWebGaps> {
  if (DEMO_MODE) {
    return {
      gaps: [
        { topic: 'startups', insightCount: 1, avgTier: 2.0, suggestion: 'You\'ve only covered "startups" once. Explore more to build depth.' },
        { topic: 'regulation', insightCount: 1, avgTier: 1.0, suggestion: 'You\'ve only covered "regulation" once. Explore more to build depth.' },
      ],
      totalTags: 5,
    };
  }
  const { data } = await api.get('/knowledge-web/gaps');
  return data;
}

export async function fetchKnowledgeWebGrowth(): Promise<KnowledgeWebGrowth> {
  if (DEMO_MODE) {
    const now = new Date();
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weeks.push({
        weekStart: d.toISOString().slice(0, 10),
        insightCount: i < 3 ? 0 : i < 8 ? 1 : 2,
        edgeCount: i < 5 ? 0 : 1,
      });
    }
    return { weeks };
  }
  const { data } = await api.get('/knowledge-web/growth');
  return data;
}
