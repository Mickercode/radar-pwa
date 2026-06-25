import type { Insight, InsightEdge } from '../../lib/types';

export const mockInsights: Insight[] = [
  {
    id: 'i1', userId: 'demo', tier: 1, tags: ['fintech', 'nigeria', 'regulation'],
    title: 'CBN payment licensing is now three tiers',
    what: 'Payment licences split into Tier 1/2/3 with different capital floors and fund-custody rights.',
    why: 'Your licence tier defines what product you can legally ship in Nigeria.',
    edge: 'Pre-seed? Build on a Tier-1 partner\'s rails instead of chasing your own licence.',
    createdAt: '2026-06-09T08:10:00Z', updatedAt: '2026-06-09T08:10:00Z',
  },
  {
    id: 'i2', userId: 'demo', tier: 2, tags: ['ai', 'machine-learning'],
    title: 'Attention is weighted key-value lookup',
    what: 'Queries match keys to pull weighted values; the rest is scale.',
    why: 'Explains the quadratic cost of long context windows.',
    edge: 'Judge a model by its attention variant, not parameter count.',
    createdAt: '2026-06-09T07:00:00Z', updatedAt: '2026-06-09T07:00:00Z',
  },
  {
    id: 'i3', userId: 'demo', tier: 2, tags: ['work', 'talent', 'startups'],
    title: '4-day week held output, cut burnout',
    what: '61 firms kept output steady on a shorter week while attrition fell.',
    why: 'Retention lever that may beat salary bumps for Lagos startups.',
    edge: 'Pilot on one team for a quarter; the cost of trying is ~zero.',
    createdAt: '2026-06-08T18:00:00Z', updatedAt: '2026-06-08T18:00:00Z',
  },
  {
    id: 'i4', userId: 'demo', tier: 1, tags: ['fintech', 'mobile-money'],
    title: 'Mobile money agents now outnumber bank branches 6:1',
    what: 'Agent network expanded 40% YoY, reaching 80% of LGAs.',
    why: 'Distribution is the moat — whoever owns the agent network owns the customer.',
    edge: 'Build agent-facing tools, not consumer apps, to ride this wave.',
    createdAt: '2026-06-07T14:00:00Z', updatedAt: '2026-06-07T14:00:00Z',
  },
  {
    id: 'i5', userId: 'demo', tier: 3, tags: ['startups', 'fundraising'],
    title: 'Y Combinator startups raised $4B in 2025',
    what: 'YC portfolio companies raised $4B across 200+ rounds last year.',
    why: 'Network effects and brand signal drive fundraising outcomes.',
    edge: 'If fundraising, signal matters more than traction in early rounds.',
    createdAt: '2026-06-06T11:00:00Z', updatedAt: '2026-06-06T11:00:00Z',
  },
];

export const mockEdges: InsightEdge[] = [
  { id: 'e1', userId: 'demo', fromInsightId: 'i1', toInsightId: 'i4', strength: 0.85, source: 'auto', createdAt: '2026-06-09T10:00:00Z' },
  { id: 'e2', userId: 'demo', fromInsightId: 'i1', toInsightId: 'i3', strength: 0.72, source: 'auto', createdAt: '2026-06-09T10:00:00Z' },
  { id: 'e3', userId: 'demo', fromInsightId: 'i4', toInsightId: 'i5', strength: 0.68, source: 'auto', createdAt: '2026-06-09T10:00:00Z' },
];
