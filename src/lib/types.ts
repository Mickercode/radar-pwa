// Domain types — mirror the shapes radar-backend serializes (ported from the
// old app's types/content.ts). Keep in sync with the backend serializers.

export type ContentType = 'podcast' | 'news' | 'clip' | 'essay' | 'longform';

export interface Topic {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface AISummary {
  id: string;
  contentId: string;
  summary: string;
  keyTakeaways: string[];
  whyItMatters: string;
  what?: string;
  why?: string;
  edge?: string;
  tier?: 1 | 2 | 3;
  nigeriaRelevance?: 0 | 1 | 2 | 3;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  source: string;
  duration: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  articleUrl?: string;
  videoUrl?: string;
  externalId?: string;
  aspectRatio?: number;
  topicId: string | null;
  createdAt: string;
  summary?: AISummary;
}

export interface FeedResult {
  items: ContentItem[];
  isFallback: boolean;
  matchedTopics: number;
}

export interface KeyMoment {
  id: string;
  contentId: string;
  timestamp: number;
  label: string;
}

// ── Knowledge graph ──────────────────────────────────────────────────────────

export type InsightEdgeSource = 'auto' | 'manual';

export interface Insight {
  id: string;
  userId: string;
  sourceContentId?: string;
  title: string;
  what: string;
  why: string;
  edge: string;
  sourceText?: string;
  sourcePositionSec?: number;
  tier: 1 | 2 | 3;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InsightEdge {
  id: string;
  userId: string;
  fromInsightId: string;
  toInsightId: string;
  strength: number;
  reason?: string;
  source: InsightEdgeSource;
  createdAt: string;
}

export interface InsightGraphSlice {
  root: Insight;
  edges: InsightEdge[];
  neighbours: Insight[];
}

// ── Spaced repetition ─────────────────────────────────────────────────────────

export interface InsightReview {
  id: string;
  userId: string;
  insightId: string;
  dueAt: string;
  lastReviewedAt?: string;
  step: number;
  lastGrade?: 0 | 1;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DueReview {
  review: InsightReview;
  insight: Insight;
}

// ── Quiz ───────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  displayOrder: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  insightId: string;
  correctCount: number;
  totalCount: number;
  attemptedAt: string;
}

// ── Weekly review ──────────────────────────────────────────────────────────────

export interface WeeklyReview {
  weekStartIso: string;
  weekEndIso: string;
  insightsSaved: number;
  reviewsCompleted: number;
  daysActive: number;
  topInsight: Insight | null;
  insights: Insight[];
}

// ── Capture ────────────────────────────────────────────────────────────────────

export interface CapturedInsight {
  sourceUrl: string;
  title: string;
  what: string;
  why: string;
  edge: string;
  tier: 1 | 2 | 3;
  nigeriaRelevance: 0 | 1 | 2 | 3;
}

// ── Auth / prefs ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface Session {
  token: string;
  user: AuthUser;
}

export interface UserPreferences {
  topic_ids: string[];
  content_types: string[];
  playback_speed: number;
  push_token?: string | null;
}
