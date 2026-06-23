import axios from 'axios';
import type { ContentItem } from './types';

// MediaStack API integration for news data
// https://mediastack.com/documentation

const MEDIASTACK_API_KEY = import.meta.env.VITE_MEDIASTACK_API_KEY;
const MEDIASTACK_BASE_URL = 'http://api.mediastack.com/v1';

export interface MediaStackArticle {
  author: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string;
  category: string;
  language: string;
  country: string;
  published_at: string;
}

export interface MediaStackResponse {
  status: string;
  data: MediaStackArticle[];
}

// Map MediaStack categories to our topic slugs
const CATEGORY_TO_TOPIC: Record<string, string> = {
  general: 't-tech',
  technology: 't-tech',
  business: 't-biz',
  finance: 't-finance',
  science: 't-sci',
  health: 't-health',
  sports: 't-sports',
  entertainment: 't-film',
  politics: 't-politics',
};

// Map country selection to MediaStack country codes
const LOCATION_TO_COUNTRIES: Record<string, string[]> = {
  Nigeria: ['ng'],
  Africa: ['ng', 'za', 'ke', 'eg', 'et', 'dz'], // Nigeria, South Africa, Kenya, Egypt, Ethiopia, Algeria
  World: [], // Empty means all countries
};

export async function fetchNewsFromMediaStack(
  category?: string,
  location?: string,
  limit: number = 20
): Promise<ContentItem[]> {
  if (!MEDIASTACK_API_KEY) {
    console.warn('MediaStack API key not found');
    return [];
  }

  try {
    const countries = location ? LOCATION_TO_COUNTRIES[location] ?? [] : [];
    const params: Record<string, string> = {
      access_key: MEDIASTACK_API_KEY,
      limit: limit.toString(),
      sort: 'published_desc',
    };

    if (category && CATEGORY_TO_TOPIC[category]) {
      params.categories = category;
    }

    if (countries.length > 0) {
      params.countries = countries.join(',');
    }

    const { data } = await axios.get<MediaStackResponse>(
      `${MEDIASTACK_BASE_URL}/news`,
      { params }
    );

    if (data.status !== 'success') {
      console.error('MediaStack API error:', data);
      return [];
    }

    // Transform MediaStack articles to ContentItem format
    return data.data.map((article, index) => ({
      id: `mediastack-${Date.now()}-${index}`,
      type: 'news' as const,
      title: article.title,
      source: article.source,
      duration: 180, // Default 3 minutes for news articles
      thumbnailUrl: article.image || undefined,
      articleUrl: article.url,
      topicId: CATEGORY_TO_TOPIC[article.category] || null,
      createdAt: article.published_at,
    }));
  } catch (error) {
    console.error('Error fetching from MediaStack:', error);
    return [];
  }
}

export async function fetchNewsByTopic(
  topicSlug: string,
  location?: string,
  limit: number = 10
): Promise<ContentItem[]> {
  // Reverse map topic slug to MediaStack category
  const topicToCategory: Record<string, string> = {};
  Object.entries(CATEGORY_TO_TOPIC).forEach(([category, topic]) => {
    topicToCategory[topic] = category;
  });

  const category = topicToCategory[topicSlug];
  if (!category) return [];

  return fetchNewsFromMediaStack(category, location, limit);
}
