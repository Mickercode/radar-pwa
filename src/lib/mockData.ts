import type { ContentItem, KeyMoment, Topic } from './types';

// Sample data for demo mode (no backend). Mirrors the shapes radar-backend
// serializes, so swapping to the real API is a no-op for the UI.

export const mockTopics: Topic[] = [
  { id: 't-climate', name: 'Climate', slug: 'climate', color: '#22d3ee' },
  { id: 't-health', name: 'Health', slug: 'health', color: '#a855f7' },
  { id: 't-sci', name: 'Science', slug: 'science', color: '#a3e635' },
  { id: 't-tech', name: 'Tech', slug: 'tech', color: '#fb7185' },
  { id: 't-biz', name: 'Business', slug: 'business', color: '#fbbf24' },
  { id: 't-finance', name: 'Finance', slug: 'finance', color: '#22d3ee' },
  { id: 't-politics', name: 'Politics', slug: 'politics', color: '#a855f7' },
  { id: 't-sports', name: 'Sports', slug: 'sports', color: '#a3e635' },
  { id: 't-music', name: 'Music', slug: 'music', color: '#fb7185' },
  { id: 't-film', name: 'Film and TV', slug: 'film-tv', color: '#fbbf24' },
  { id: 't-education', name: 'Education', slug: 'education', color: '#22d3ee' },
  { id: 't-fashion', name: 'Fashion', slug: 'fashion', color: '#a855f7' },
  { id: 't-travel', name: 'Travel and Lifestyle', slug: 'travel-lifestyle', color: '#a3e635' },
  { id: 't-faith', name: 'Faith & Philosophy', slug: 'faith-philosophy', color: '#fb7185' },
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
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    externalId: 'dQw4w9WgXcQ',
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

// ── Clip-specific mock data (short video content) ───────────────────────────
export const mockClips: ContentItem[] = [
  {
    id: 'c1', type: 'clip', title: 'AI coding assistants are changing how we build',
    source: 'The Verge', duration: 180, topicId: 't-tech', createdAt: '2026-06-10T10:00:00Z',
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    externalId: 'jNQXAC9IVRw',
    aspectRatio: 16 / 9,
    summary: {
      id: 'sc1', contentId: 'c1', tier: 1, nigeriaRelevance: 2,
      what: 'AI pair-programming tools now handle boilerplate, tests, and refactoring — letting developers focus on architecture and logic.',
      why: 'For Nigerian dev shops competing globally, AI-assisted coding can double output without doubling headcount.',
      edge: 'The edge isn\'t the AI — it\'s having the taste to know when the AI is wrong.',
      summary: 'AI coding assistants are levelling the playing field.',
      keyTakeaways: [
        'Boilerplate generation is where AI assistants save the most time.',
        'Code review shifts from spotting typos to evaluating architecture decisions.',
        'Junior devs become productive faster — widening the talent pool.',
      ],
      whyItMatters: 'AI tools don\'t replace developers; they raise the baseline of what one developer can ship.',
    },
  },
  {
    id: 'c2', type: 'clip', title: 'Why Lagos traffic might finally get better',
    source: 'TechCabal', duration: 145, topicId: 't-tech', createdAt: '2026-06-09T14:00:00Z',
    videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    externalId: 'dQw4w9WgXcQ',
    aspectRatio: 16 / 9,
    summary: {
      id: 'sc2', contentId: 'c2', tier: 2, nigeriaRelevance: 3,
      what: 'New AI-powered traffic light system piloting in three Lagos junctions cut average wait times by 34%.',
      why: 'Traffic costs Lagos an estimated ₦4 trillion annually in lost productivity — even small improvements compound massively.',
      edge: 'If the pilot holds, expect rapid expansion. Real estate along pilot corridors could see value shifts within 6 months.',
      summary: 'AI traffic lights cut Lagos wait times by 34%.',
      keyTakeaways: [
        'Pilot covers three major junctions: Ikeja, VI, and Lekki.',
        'System adapts in real-time to traffic volume, not fixed timers.',
        'Full rollout would require upgrading 200+ intersections.',
      ],
      whyItMatters: 'Lagos traffic isn\'t just an annoyance — it\'s a structural drag on economic output.',
    },
  },
  {
    id: 'c3', type: 'clip', title: 'This fintech is banking the unbanked in rural Nigeria',
    source: 'Nairametrics', duration: 210, topicId: 't-finance', createdAt: '2026-06-08T09:00:00Z',
    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    externalId: '9bZkp7q19f0',
    aspectRatio: 16 / 9,
    summary: {
      id: 'sc3', contentId: 'c3', tier: 1, nigeriaRelevance: 3,
      what: 'A new fintech uses USSD + agent networks to reach farmers and traders in 14 states with no bank branch.',
      why: '56% of Nigerian adults remain unbanked. Mobile-money agents are cheaper than branches and reach deeper into rural areas.',
      edge: 'The moat won\'t be the app — it\'ll be the trust relationship with local agents. Fintechs that invest in agent training will win.',
      summary: 'USSD + agent banking is reaching the last mile.',
      keyTakeaways: [
        'No smartphone required — USSD works on any phone.',
        'Agents earn commission on every transaction, creating local jobs.',
        '14-state network already processing ₦500M+ monthly.',
      ],
      whyItMatters: 'Financial inclusion in Nigeria means going where smartphones haven\'t arrived yet.',
    },
  },
  {
    id: 'c4', type: 'clip', title: 'How protein powder is made (industrial scale)',
    source: 'BBC Reel', duration: 280, topicId: 't-sci', createdAt: '2026-06-07T16:00:00Z',
    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    externalId: '9bZkp7q19f0',
    aspectRatio: 16 / 9,
    summary: {
      id: 'sc4', contentId: 'c4', tier: 3, nigeriaRelevance: 1,
      what: 'A tour of the largest protein powder facility in West Africa, producing 40 tons per month from locally sourced soy.',
      why: 'Nigeria imports most protein supplements despite having the raw materials — local production could drastically lower prices.',
      edge: 'Watch for local supplement brands disrupting the imported premium market within 12 months.',
      summary: 'Local protein production scales up in West Africa.',
      keyTakeaways: [
        'Facility processes 200 tons of soybeans monthly.',
        'End-product retails at 40% less than imported equivalents.',
        'Plans to expand into plant-based meat alternatives.',
      ],
      whyItMatters: 'Import substitution in health supplements is a growing opportunity.',
    },
  },
  {
    id: 'c5', type: 'clip', title: 'Lagos\' new Blue Line rail — first ride review',
    source: 'Pulse Nigeria', duration: 165, topicId: 't-politics', createdAt: '2026-06-06T11:00:00Z',
    videoUrl: 'https://youtu.be/jNQXAC9IVRw',
    externalId: 'jNQXAC9IVRw',
    aspectRatio: 16 / 9,
    summary: {
      id: 'sc5', contentId: 'c5', tier: 2, nigeriaRelevance: 3,
      what: 'First-hand ride review of Lagos Blue Line from Marina to Mile 2 — smooth ride, 15 minutes vs 1.5 hours by road.',
      why: 'Lagos rail could fundamentally reshape commuting patterns and property values along the corridor.',
      edge: 'Real estate within 1km of Blue Line stations is still undervalued — the full impact won\'t be priced in for another 6-12 months.',
      summary: 'Lagos Blue Line rail is a game-changer for commuters.',
      keyTakeaways: [
        'Journey time cut by 80% compared to road.',
        'Air-conditioned carriages with reliable power.',
        'Phase 2 extending to Okokomaiko already under construction.',
      ],
      whyItMatters: 'Urban rail is the single highest-leverage infrastructure investment for African megacities.',
    },
  },
];

/** Returns all clip-type mock items sorted by recency. */
export function getMockClips(): ContentItem[] {
  return [...mockClips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

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
