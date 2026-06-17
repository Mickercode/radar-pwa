import type {
  DueReview,
  Insight,
  InsightEdge,
  InsightGraphSlice,
  QuizQuestion,
  WeeklyReview,
} from './types';

// Mutable in-memory brain for demo mode (resets on reload — fine for previewing).

function ins(partial: Partial<Insight> & Pick<Insight, 'id' | 'title' | 'what' | 'why' | 'edge'>): Insight {
  return {
    userId: 'demo',
    tier: 2,
    tags: [],
    createdAt: '2026-06-08T10:00:00Z',
    updatedAt: '2026-06-08T10:00:00Z',
    ...partial,
  };
}

export const mockInsights: Insight[] = [
  ins({
    id: 'i1', tier: 1, tags: ['fintech', 'nigeria'],
    title: 'CBN payment licensing is now three tiers',
    what: 'Payment licences split into Tier 1/2/3 with different capital floors and fund-custody rights.',
    why: 'Your licence tier defines what product you can legally ship in Nigeria.',
    edge: 'Pre-seed? Build on a Tier-1 partner’s rails instead of chasing your own licence.',
    createdAt: '2026-06-09T08:10:00Z',
  }),
  ins({
    id: 'i2', tags: ['ai'],
    title: 'Attention is weighted key-value lookup',
    what: 'Queries match keys to pull weighted values; the rest is scale.',
    why: 'Explains the quadratic cost of long context windows.',
    edge: 'Judge a model by its attention variant, not parameter count.',
    createdAt: '2026-06-09T07:00:00Z',
  }),
  ins({
    id: 'i3', tags: ['work', 'talent'],
    title: '4-day week held output, cut burnout',
    what: '61 firms kept output steady on a shorter week while attrition fell.',
    why: 'Retention lever that may beat salary bumps for Lagos startups.',
    edge: 'Pilot on one team for a quarter; the cost of trying is ~zero.',
    createdAt: '2026-06-08T18:00:00Z',
  }),
];

const edges: InsightEdge[] = [
  {
    id: 'e1', userId: 'demo', fromInsightId: 'i1', toInsightId: 'i3',
    strength: 0.78, source: 'auto', createdAt: '2026-06-09T08:11:00Z',
    reason: 'Both about Nigerian startup strategy',
  },
];

export function mockGraph(id: string): InsightGraphSlice | null {
  const root = mockInsights.find((i) => i.id === id);
  if (!root) return null;
  const rel = edges.filter((e) => e.fromInsightId === id || e.toInsightId === id);
  const ids = new Set(rel.flatMap((e) => [e.fromInsightId, e.toInsightId]).filter((x) => x !== id));
  return { root, edges: rel, neighbours: mockInsights.filter((i) => ids.has(i.id)) };
}

export const mockDueReviews: DueReview[] = mockInsights.slice(0, 2).map((insight, idx) => ({
  insight,
  review: {
    id: `r${idx}`, userId: 'demo', insightId: insight.id,
    dueAt: '2026-06-09T00:00:00Z', step: idx, reviewCount: idx,
    createdAt: insight.createdAt, updatedAt: insight.createdAt,
  },
}));

export function mockWeekly(): WeeklyReview {
  return {
    weekStartIso: '2026-06-02T00:00:00Z',
    weekEndIso: '2026-06-09T00:00:00Z',
    insightsSaved: mockInsights.length,
    reviewsCompleted: 4,
    daysActive: 5,
    topInsight: mockInsights[0] ?? null,
    insights: mockInsights,
  };
}

export function mockQuiz(insightId: string): QuizQuestion[] {
  const i = mockInsights.find((x) => x.id === insightId);
  const subject = i?.title ?? 'this insight';
  return [
    { id: 'q1', displayOrder: 0, correctIndex: 1,
      question: `What is the core claim of "${subject}"?`,
      options: ['It’s unrelated trivia', i?.what ?? 'The main fact', 'A pricing table', 'A personal opinion'] },
    { id: 'q2', displayOrder: 1, correctIndex: 0,
      question: 'Why does it matter?',
      options: [i?.why ?? 'It has real consequences', 'It never matters', 'Only to academics', 'It’s a joke'] },
    { id: 'q3', displayOrder: 2, correctIndex: 2,
      question: 'What’s the smart action (edge)?',
      options: ['Ignore it', 'Wait indefinitely', i?.edge ?? 'Take the concrete next step', 'Panic'] },
  ];
}

export function addMockInsight(input: Omit<Insight, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Insight {
  const created = ins({ ...input, id: `i${mockInsights.length + 1}-${Date.now() % 10000}` });
  mockInsights.unshift(created);
  return created;
}
