import { api } from '../../lib/api';
import type { PodcastSearchResult, EpisodeResult, RecommendedPodcast } from '../../lib/types';
import { RECOMMENDED_PODCASTS, MOCK_SEARCH_RESULTS } from './mockPodcasts';

const DEMO_MODE = !import.meta.env.VITE_API_URL;

// ── Search ─────────────────────────────────────────────────────────────────────

export async function searchPodcasts(q: string, max = 20): Promise<PodcastSearchResult> {
  if (DEMO_MODE) {
    const ql = q.toLowerCase();
    const feeds = MOCK_SEARCH_RESULTS.filter(
      (f) =>
        f.title.toLowerCase().includes(ql) ||
        (f.author ?? '').toLowerCase().includes(ql) ||
        f.description.toLowerCase().includes(ql),
    ).slice(0, max);
    return { status: true, feeds, count: feeds.length };
  }

  const { data } = await api.get('/podcasts/search', { params: { q, max } });
  return data;
}

// ── Episodes ───────────────────────────────────────────────────────────────────

export async function getEpisodes(feedId: number, max = 20): Promise<EpisodeResult> {
  if (DEMO_MODE) {
    const feed = MOCK_SEARCH_RESULTS.find((f) => f.id === feedId);
    if (!feed) return { status: true, items: [], count: 0 };
    // Generate some mock episodes
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: feedId * 1000 + i,
      title: `${i === 0 ? 'Latest: ' : ''}Episode ${i + 1}: ${feed.title} — ${['Deep Dive', 'Expert Interview', 'Weekly Roundup', 'Special Edition', 'Q&A Session', 'Behind the Scenes', 'Year in Review', 'Breakthrough'][i] ?? 'Episode'}`,
      enclosureUrl: '',
      enclosureType: 'audio/mpeg',
      description: `A fascinating episode about ${feed.title.toLowerCase()} featuring in-depth analysis and expert perspectives.`,
      duration: 1800 + Math.floor(Math.random() * 3600),
      datePublished: Math.floor(Date.now() / 1000) - i * 86400 * 3, // every 3 days
      feedId,
      feedTitle: feed.title,
      feedImage: feed.image,
    }));
    return { status: true, items, count: items.length };
  }

  const { data } = await api.get(`/podcasts/${feedId}/episodes`, { params: { max } });
  return data;
}

// ── Recommended podcasts ───────────────────────────────────────────────────────

export function getRecommendedPodcasts(): RecommendedPodcast[] {
  return RECOMMENDED_PODCASTS;
}

// ── Episode audio playback ─────────────────────────────────────────────────────

/**
 * Play a podcast episode in the built-in player. Creates a ContentItem-like object
 * from a PodcastEpisode so it works with the existing player store.
 */
export function episodeToPlayable(ep: PodcastEpisode) {
  return {
    id: `podcast-ep-${ep.id}`,
    type: 'podcast' as const,
    title: ep.title,
    source: ep.feedTitle,
    duration: ep.duration,
    audioUrl: ep.enclosureUrl || undefined,
    thumbnailUrl: ep.feedImage,
    articleUrl: undefined,
    videoUrl: undefined,
    externalId: String(ep.id),
    aspectRatio: undefined,
    topicId: null,
    createdAt: new Date(ep.datePublished * 1000).toISOString(),
  };
}
