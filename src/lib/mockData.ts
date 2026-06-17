import type { ContentItem, KeyMoment, Topic } from './types';

// Sample data for demo mode (no backend). Mirrors the shapes radar-backend
// serializes, so swapping to the real API is a no-op for the UI.

export const mockTopics: Topic[] = [
  { id: 't-tech', name: 'Technology', slug: 'tech', color: '#22d3ee' },
  { id: 't-biz', name: 'Business', slug: 'business', color: '#a855f7' },
  { id: 't-sci', name: 'Science', slug: 'science', color: '#a3e635' },
  { id: 't-startups', name: 'Startups', slug: 'startups', color: '#fb7185' },
  { id: 't-finance', name: 'Finance', slug: 'finance', color: '#fbbf24' },
];

export const mockContent: ContentItem[] = [
  {
    id: '1', type: 'news', title: 'Nigeria’s new fintech licensing tiers, explained',
    source: 'Nairametrics', duration: 240, topicId: 't-finance', createdAt: '2026-06-09T08:00:00Z',
    articleUrl: 'https://nairametrics.com',
    summary: {
      id: 's1', contentId: '1', tier: 1, nigeriaRelevance: 3,
      what: 'The CBN split payment licences into three tiers with different capital requirements, reshaping who can build what in Nigerian fintech.',
      why: 'It decides which startups can legally hold funds vs. merely route them — a make-or-break detail for any founder building payments in Nigeria.',
      edge: 'If you’re pre-seed, build on a Tier-1 partner’s rails instead of chasing your own licence — it saves 18 months and ₦2bn in capital.',
      summary: 'CBN introduces three-tier payment licensing.',
      keyTakeaways: [
        'Tier-1 licences require the highest capital but allow holding customer funds.',
        'Tier-3 is route-only — no fund custody, far lower capital floor.',
        'Existing licences are grandfathered for 12 months before re-tiering.',
      ],
      whyItMatters: 'Licensing tier dictates your entire product surface and fundraising timeline.',
    },
  },
  {
    id: '2', type: 'podcast', title: 'Why transformer attention actually works',
    source: 'Latent Space', duration: 3120, topicId: 't-tech', createdAt: '2026-06-09T06:30:00Z',
    audioUrl: 'https://example.com/audio.mp3',
    summary: {
      id: 's2', contentId: '2', tier: 2, nigeriaRelevance: 0,
      what: 'Attention is a soft dictionary lookup: queries match keys to pull weighted values. Everything else is scale and plumbing.',
      why: 'Understanding the core mechanism lets you reason about why bigger context windows cost quadratically — and where the next efficiency wins come from.',
      edge: 'When evaluating a model, ask about attention variant (flash, sliding-window, linear) — it predicts cost and latency more than parameter count does.',
      summary: 'Attention is weighted key-value lookup.',
      keyTakeaways: [
        'Q·K similarity decides how much each value contributes.',
        'Cost scales with sequence length squared — the context-window tax.',
        'Most “efficiency” research is just cheaper attention.',
      ],
      whyItMatters: 'It’s the single idea behind every modern LLM.',
    },
  },
  {
    id: '3', type: 'clip', title: 'The 4-day work week trial results are in',
    source: 'TechCabal', duration: 95, topicId: 't-biz', createdAt: '2026-06-08T17:00:00Z',
    videoUrl: 'https://youtube.com',
    summary: {
      id: 's3', contentId: '3', tier: 2, nigeriaRelevance: 2,
      what: 'Across 61 companies that kept a 4-day week, output held steady while burnout and attrition dropped sharply.',
      why: 'For Lagos startups fighting talent churn, a shorter week may retain engineers more cheaply than salary bumps.',
      edge: 'Pilot it on one team for a quarter and measure retention — the cost of trying is near zero.',
      summary: '4-day week held output, cut burnout.',
      keyTakeaways: [
        'No measurable drop in output across the cohort.',
        'Burnout and sick days fell notably.',
        'Most firms made the change permanent.',
      ],
      whyItMatters: 'Retention is cheaper than recruitment.',
    },
  },
  {
    id: '4', type: 'news', title: 'A cheaper path to green hydrogen',
    source: 'BBC Science', duration: 180, topicId: 't-sci', createdAt: '2026-06-08T12:00:00Z',
    articleUrl: 'https://bbc.com',
    summary: {
      id: 's4', contentId: '4', tier: 3, nigeriaRelevance: 1,
      what: 'A new catalyst lowers the energy needed to split water, nudging green hydrogen toward cost parity with fossil sources.',
      why: 'Cheap hydrogen could reshape fertiliser and heavy industry — sectors central to African food security.',
      edge: 'Watch catalyst-cost curves, not headline efficiency — that’s where parity actually gets decided.',
      summary: 'New catalyst cuts hydrogen energy cost.',
      keyTakeaways: [
        'The catalyst reduces the electrical overpotential of electrolysis.',
        'Still lab-stage — durability at scale is unproven.',
        'Fertiliser is the likeliest first market.',
      ],
      whyItMatters: 'Energy input is the whole green-hydrogen cost story.',
    },
  },
];

const KEY_MOMENTS: Record<string, KeyMoment[]> = {
  '2': [
    { id: 'k1', contentId: '2', timestamp: 320, label: 'The dictionary-lookup analogy' },
    { id: 'k2', contentId: '2', timestamp: 1450, label: 'Why context windows cost so much' },
    { id: 'k3', contentId: '2', timestamp: 2600, label: 'What comes after transformers' },
  ],
};

export function getMockContent(id: string): ContentItem | undefined {
  return mockContent.find((c) => c.id === id);
}

export function getMockKeyMoments(contentId: string): KeyMoment[] {
  return KEY_MOMENTS[contentId] ?? [];
}
