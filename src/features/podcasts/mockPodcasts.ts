import type { PodcastFeed, RecommendedPodcast } from '../../lib/types';

// The curated podcast list from the user — serves as both mock search results
// and recommended shows on the Podcasts page.
export const MOCK_SEARCH_RESULTS: PodcastFeed[] = [
  // Climate
  { id: 1001, title: 'Outrage + Optimism', url: '', image: '', description: 'A podcast about climate change, sustainability, and the future of our planet.', author: 'Christiana Figueres, Tom Rivett-Carnac', language: 'en', categories: { Climate: 'Climate' } },
  { id: 1002, title: 'The Energy Gang', url: '', image: '', description: 'Weekly discussions about energy, cleantech, and the transition to a low-carbon economy.', author: 'Stephen Lacey', language: 'en', categories: { Climate: 'Climate' } },
  { id: 1003, title: 'The Climate Question', url: '', image: '', description: 'BBC podcast exploring the climate issues that matter, with real-world answers.', author: 'BBC', language: 'en', categories: { Climate: 'Climate' } },
  // Health
  { id: 1004, title: 'Health Check', url: '', image: '', description: 'BBC health podcast covering global health stories, medical breakthroughs, and public health.', author: 'BBC', language: 'en', categories: { Health: 'Health' } },
  { id: 1005, title: 'The Lancet Voice', url: '', image: '', description: 'The Lancet podcast featuring interviews with leading medical experts and researchers.', author: 'The Lancet', language: 'en', categories: { Health: 'Health' } },
  { id: 1006, title: 'Public Health On Call', url: '', image: '', description: 'Expert insights on public health issues from the Johns Hopkins Bloomberg School.', author: 'Johns Hopkins', language: 'en', categories: { Health: 'Health' } },
  // Science
  { id: 1007, title: 'Science Vs', url: '', image: '', description: 'Facts vs. fads — separating science from pseudoscience on trending topics.', author: 'Gimlet Media', language: 'en', categories: { Science: 'Science' } },
  { id: 1008, title: 'Nature Podcast', url: '', image: '', description: 'The Nature Podcast brings you the best stories from the world of science.', author: 'Nature', language: 'en', categories: { Science: 'Science' } },
  { id: 1009, title: 'Science Friday', url: '', image: '', description: 'Weekly science news and discussion from NPR.', author: 'NPR', language: 'en', categories: { Science: 'Science' } },
  // Technology
  { id: 1010, title: 'Hard Fork', url: '', image: '', description: 'The New York Times podcast about tech, AI, and the future.', author: 'NYT', language: 'en', categories: { Technology: 'Technology' } },
  { id: 1011, title: 'The Vergecast', url: '', image: '', description: 'The Verge\'s flagship podcast covering the intersection of technology and culture.', author: 'The Verge', language: 'en', categories: { Technology: 'Technology' } },
  { id: 1012, title: 'Acquired', url: '', image: '', description: 'Deep-dive episodes about the greatest technology companies and the stories behind them.', author: 'Ben Gilbert, David Rosenthal', language: 'en', categories: { Technology: 'Technology' } },
  // Business & Finance
  { id: 1013, title: 'Planet Money', url: '', image: '', description: 'The economy explained in everyday language from NPR.', author: 'NPR', language: 'en', categories: { Business: 'Business' } },
  { id: 1014, title: 'Odd Lots', url: '', image: '', description: 'Bloomberg podcast about the weird and wonderful parts of finance and economics.', author: 'Bloomberg', language: 'en', categories: { Business: 'Business' } },
  { id: 1015, title: 'How I Built This', url: '', image: '', description: 'NPR podcast about the stories behind the world\'s most successful companies.', author: 'NPR', language: 'en', categories: { Business: 'Business' } },
  // Politics
  { id: 1016, title: 'The Daily', url: '', image: '', description: 'The New York Times podcast — 20 minutes of the biggest news story of the day.', author: 'NYT', language: 'en', categories: { Politics: 'Politics' } },
  { id: 1017, title: 'Global News Podcast', url: '', image: '', description: 'BBC global news in 30 minutes — the stories that matter from around the world.', author: 'BBC', language: 'en', categories: { Politics: 'Politics' } },
  { id: 1018, title: 'The Intelligence', url: '', image: '', description: 'The Economist\'s daily news podcast covering the week\'s top stories.', author: 'The Economist', language: 'en', categories: { Politics: 'Politics' } },
  // Sports
  { id: 1019, title: 'Football Daily', url: '', image: '', description: 'BBC football podcast with expert analysis and discussion.', author: 'BBC', language: 'en', categories: { Sports: 'Sports' } },
  { id: 1020, title: 'The Athletic FC Podcast', url: '', image: '', description: 'In-depth football analysis from The Athletic\'s global team of journalists.', author: 'The Athletic', language: 'en', categories: { Sports: 'Sports' } },
  { id: 1021, title: 'Men in Blazers', url: '', image: '', description: 'Two blazers talking about football (soccer) with humour and insight.', author: 'Men in Blazers', language: 'en', categories: { Sports: 'Sports' } },
  // Music
  { id: 1022, title: 'Afrobeats Intelligence', url: '', image: '', description: 'Deep dives into African music, Afrobeats culture, and the artists shaping the sound.', author: 'Joey Akan', language: 'en', categories: { Music: 'Music' } },
  { id: 1023, title: 'Song Exploder', url: '', image: '', description: 'Musicians break down their songs piece by piece.', author: 'Hrishikesh Hirway', language: 'en', categories: { Music: 'Music' } },
  { id: 1024, title: 'Popcast', url: '', image: '', description: 'The New York Times pop music podcast.', author: 'NYT', language: 'en', categories: { Music: 'Music' } },
  // Film & TV
  { id: 1025, title: 'The Big Picture', url: '', image: '', description: 'The Ringer\'s flagship film podcast with smart, entertaining movie analysis.', author: 'The Ringer', language: 'en', categories: { Film: 'Film' } },
  { id: 1026, title: 'IndieWire Screen Talk', url: '', image: '', description: 'Weekly podcast about independent film and the entertainment industry.', author: 'IndieWire', language: 'en', categories: { Film: 'Film' } },
  { id: 1027, title: 'Scriptnotes', url: '', image: '', description: 'A podcast about screenwriting and things that are interesting to screenwriters.', author: 'John August', language: 'en', categories: { Film: 'Film' } },
  // Education
  { id: 1028, title: 'The EdSurge Podcast', url: '', image: '', description: 'Exploring the future of education, edtech, and lifelong learning.', author: 'EdSurge', language: 'en', categories: { Education: 'Education' } },
  { id: 1029, title: 'Future U', url: '', image: '', description: 'Conversations about the future of higher education.', author: 'Michael B. Horn', language: 'en', categories: { Education: 'Education' } },
  { id: 1030, title: 'Education Next', url: '', image: '', description: 'Evidence-based analysis of education policy and practice.', author: 'Education Next', language: 'en', categories: { Education: 'Education' } },
  // Fashion & Travel
  { id: 1031, title: 'Women Who Travel', url: '', image: '', description: 'Condé Nast Traveler podcast about adventurous women and their travels.', author: 'CN Traveler', language: 'en', categories: { Travel: 'Travel' } },
  { id: 1032, title: 'The Business of Fashion Podcast', url: '', image: '', description: 'In-depth conversations with the people shaping the fashion industry.', author: 'BoF', language: 'en', categories: { Fashion: 'Fashion' } },
  { id: 1033, title: 'Zero To Travel', url: '', image: '', description: 'Actionable travel tips and inspiration for living a life of travel.', author: 'Jason Moore', language: 'en', categories: { Travel: 'Travel' } },
  // Faith & Philosophy
  { id: 1034, title: 'Philosophize This!', url: '', image: '', description: 'Beginner-friendly episodes about the history of philosophy and big ideas.', author: 'Stephen West', language: 'en', categories: { Philosophy: 'Philosophy' } },
  { id: 1035, title: 'On Being', url: '', image: '', description: 'Conversations about meaning, faith, ethics, and what it means to be human.', author: 'Krista Tippett', language: 'en', categories: { Philosophy: 'Philosophy' } },
  { id: 1036, title: 'The Partially Examined Life', url: '', image: '', description: 'A philosophy podcast by guys who were at least somewhat part of the academic world.', author: 'Mark Linsenmayer', language: 'en', categories: { Philosophy: 'Philosophy' } },
];

// Recommended podcasts grouped by category for the browse view
export const RECOMMENDED_PODCASTS: RecommendedPodcast[] = [
  // Tech
  { id: 1010, title: 'Hard Fork', author: 'NYT', image: '', description: 'Tech, AI, and the future.', feedUrl: '', category: 'Technology', episodeCount: 200 },
  { id: 1011, title: 'The Vergecast', author: 'The Verge', image: '', description: 'Tech meets culture.', feedUrl: '', category: 'Technology', episodeCount: 500 },
  { id: 1012, title: 'Acquired', author: 'Ben Gilbert, David Rosenthal', image: '', description: 'The greatest tech companies.', feedUrl: '', category: 'Technology', episodeCount: 150 },
  // Business
  { id: 1013, title: 'Planet Money', author: 'NPR', image: '', description: 'The economy, explained.', feedUrl: '', category: 'Business', episodeCount: 1200 },
  { id: 1014, title: 'Odd Lots', author: 'Bloomberg', image: '', description: 'Weird finance and economics.', feedUrl: '', category: 'Business', episodeCount: 300 },
  { id: 1015, title: 'How I Built This', author: 'NPR', image: '', description: 'Company origin stories.', feedUrl: '', category: 'Business', episodeCount: 400 },
  // Science
  { id: 1007, title: 'Science Vs', author: 'Gimlet Media', image: '', description: 'Facts vs. fads.', feedUrl: '', category: 'Science', episodeCount: 180 },
  { id: 1008, title: 'Nature Podcast', author: 'Nature', image: '', description: 'Best stories in science.', feedUrl: '', category: 'Science', episodeCount: 500 },
  // Politics
  { id: 1016, title: 'The Daily', author: 'NYT', image: '', description: 'The biggest news story.', feedUrl: '', category: 'Politics', episodeCount: 2000 },
  { id: 1018, title: 'The Intelligence', author: 'The Economist', image: '', description: 'Global news analysis.', feedUrl: '', category: 'Politics', episodeCount: 800 },
  // Climate
  { id: 1001, title: 'Outrage + Optimism', author: 'Christiana Figueres', image: '', description: 'Climate change and the future.', feedUrl: '', category: 'Climate', episodeCount: 250 },
  { id: 1002, title: 'The Energy Gang', author: 'Stephen Lacey', image: '', description: 'Energy and cleantech.', feedUrl: '', category: 'Climate', episodeCount: 400 },
  // Health
  { id: 1006, title: 'Public Health On Call', author: 'Johns Hopkins', image: '', description: 'Public health insights.', feedUrl: '', category: 'Health', episodeCount: 500 },
  // Sports
  { id: 1019, title: 'Football Daily', author: 'BBC', image: '', description: 'Football analysis.', feedUrl: '', category: 'Sports', episodeCount: 1500 },
  // Music
  { id: 1022, title: 'Afrobeats Intelligence', author: 'Joey Akan', image: '', description: 'African music & culture.', feedUrl: '', category: 'Music', episodeCount: 80 },
  // Film
  { id: 1025, title: 'The Big Picture', author: 'The Ringer', image: '', description: 'Film analysis.', feedUrl: '', category: 'Film', episodeCount: 600 },
];
