// Content sources data structure for Radar PWA
// Organized by category, region, and format

export type ContentRegion = 'nigeria' | 'africa' | 'international';
export type ContentFormat = 'written' | 'podcast';

export interface ContentSource {
  name: string;
  url: string;
  region: ContentRegion;
  format: ContentFormat;
  platforms?: string[];
}

export interface ContentSourcesByCategory {
  [category: string]: {
    [region in ContentRegion]?: ContentSource[];
  };
}

export const CONTENT_SOURCES: ContentSourcesByCategory = {
  climate: {
    nigeria: [
      { name: 'Climate Reporters', url: 'https://climatereporters.com', region: 'nigeria', format: 'written' },
      { name: 'EnviroNews Nigeria', url: 'https://www.environewsnigeria.com', region: 'nigeria', format: 'written' },
      { name: 'NCF Nigeria Blog', url: 'https://ncfnigeria.org/blog', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Africa Climate Wire', url: 'https://africaclimatewire.org', region: 'africa', format: 'written' },
      { name: 'AllAfrica Environment', url: 'https://allafrica.com/environment', region: 'africa', format: 'written' },
      { name: 'Mongabay Africa', url: 'https://news.mongabay.com/africa', region: 'africa', format: 'written' },
      { name: 'African Arguments', url: 'https://africanarguments.org', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Carbon Brief', url: 'https://www.carbonbrief.org', region: 'international', format: 'written' },
      { name: 'Climate Change News', url: 'https://www.climatechangenews.com', region: 'international', format: 'written' },
      { name: 'Yale Climate Connections', url: 'https://yaleclimateconnections.org', region: 'international', format: 'written' },
      { name: 'Inside Climate News', url: 'https://insideclimatenews.org', region: 'international', format: 'written' },
      { name: 'Reuters Sustainability', url: 'https://www.reuters.com/sustainability', region: 'international', format: 'written' },
    ],
  },
  health: {
    nigeria: [
      { name: 'Nigeria Health Watch', url: 'https://nigeriahealthwatch.com', region: 'nigeria', format: 'written' },
      { name: 'Premium Times Health', url: 'https://www.premiumtimesng.com/health', region: 'nigeria', format: 'written' },
      { name: 'Healthwise (Punch)', url: 'https://healthwise.punchng.com', region: 'nigeria', format: 'written' },
      { name: 'Daily Trust Health', url: 'https://dailytrust.com/health', region: 'nigeria', format: 'written' },
      { name: 'Guardian Health', url: 'https://guardian.ng/category/features/health', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Health-e News', url: 'https://health-e.org.za', region: 'africa', format: 'written' },
      { name: 'Africa CDC', url: 'https://africacdc.org', region: 'africa', format: 'written' },
      { name: 'AllAfrica Health', url: 'https://allafrica.com/health', region: 'africa', format: 'written' },
      { name: 'Bhekisisa', url: 'https://bhekisisa.org', region: 'africa', format: 'written' },
      { name: 'WHO Africa', url: 'https://www.afro.who.int', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'The Lancet', url: 'https://www.thelancet.com', region: 'international', format: 'written' },
      { name: 'BMJ', url: 'https://www.bmj.com', region: 'international', format: 'written' },
      { name: 'STAT News', url: 'https://www.statnews.com', region: 'international', format: 'written' },
      { name: 'World Health Organization (WHO)', url: 'https://www.who.int', region: 'international', format: 'written' },
      { name: 'Health Policy Watch', url: 'https://healthpolicy-watch.news', region: 'international', format: 'written' },
    ],
  },
  science: {
    nigeria: [
      { name: 'Science Nigeria', url: 'https://sciencenigeria.com', region: 'nigeria', format: 'written' },
      { name: 'Nigerian Academy of Science', url: 'https://nas.org.ng', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'SciDev.Net Africa', url: 'https://www.scidev.net/sub-saharan-africa', region: 'africa', format: 'written' },
      { name: 'African Academy of Sciences', url: 'https://www.aasciences.africa', region: 'africa', format: 'written' },
      { name: 'The Conversation Africa', url: 'https://theconversation.com/africa', region: 'africa', format: 'written' },
      { name: 'Research Professional News Africa', url: 'https://www.researchprofessionalnews.com/africa', region: 'africa', format: 'written' },
      { name: 'Nature Africa', url: 'https://www.nature.com/subjects/africa', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Nature', url: 'https://www.nature.com', region: 'international', format: 'written' },
      { name: 'Science', url: 'https://www.science.org', region: 'international', format: 'written' },
      { name: 'New Scientist', url: 'https://www.newscientist.com', region: 'international', format: 'written' },
      { name: 'Scientific American', url: 'https://www.scientificamerican.com', region: 'international', format: 'written' },
      { name: 'Live Science', url: 'https://www.livescience.com', region: 'international', format: 'written' },
      { name: 'The Conversation', url: 'https://theconversation.com', region: 'international', format: 'written' },
    ],
  },
  tech: {
    nigeria: [
      { name: 'TechCabal', url: 'https://techcabal.com', region: 'nigeria', format: 'written' },
      { name: 'Technext', url: 'https://technext24.com', region: 'nigeria', format: 'written' },
      { name: 'Benjamin Dada', url: 'https://www.benjamindada.com', region: 'nigeria', format: 'written' },
      { name: 'Techpoint Africa', url: 'https://techpoint.africa', region: 'nigeria', format: 'written' },
      { name: 'Geeky Nigeria', url: 'https://geeky.com.ng', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Disrupt Africa', url: 'https://disruptafrica.com', region: 'africa', format: 'written' },
      { name: 'Connecting Africa', url: 'https://connectingafrica.com', region: 'africa', format: 'written' },
      { name: 'ITWeb Africa', url: 'https://itweb.africa', region: 'africa', format: 'written' },
      { name: 'TechCentral', url: 'https://techcentral.co.za', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'TechCrunch', url: 'https://techcrunch.com', region: 'international', format: 'written' },
      { name: 'The Verge', url: 'https://www.theverge.com', region: 'international', format: 'written' },
      { name: 'WIRED', url: 'https://www.wired.com', region: 'international', format: 'written' },
      { name: 'Ars Technica', url: 'https://arstechnica.com', region: 'international', format: 'written' },
      { name: 'MIT Technology Review', url: 'https://www.technologyreview.com', region: 'international', format: 'written' },
    ],
  },
  business: {
    nigeria: [
      { name: 'BusinessDay', url: 'https://businessday.ng', region: 'nigeria', format: 'written' },
      { name: 'Nairametrics', url: 'https://nairametrics.com', region: 'nigeria', format: 'written' },
      { name: 'ThisDay Business', url: 'https://www.thisdaylive.com/business', region: 'nigeria', format: 'written' },
      { name: 'TheCable Business & Economy', url: 'https://www.thecable.ng/business-economy', region: 'nigeria', format: 'written' },
      { name: 'Leadership Business', url: 'https://leadership.ng/business', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'African Business', url: 'https://african.business', region: 'africa', format: 'written' },
      { name: 'The Africa Report Business', url: 'https://www.theafricareport.com/business', region: 'africa', format: 'written' },
      { name: 'How We Made It In Africa', url: 'https://www.howwemadeitinafrica.com', region: 'africa', format: 'written' },
      { name: 'CNBC Africa', url: 'https://www.cnbcafrica.com', region: 'africa', format: 'written' },
      { name: 'Africa Business+', url: 'https://africabusinessplus.com', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Financial Times', url: 'https://www.ft.com', region: 'international', format: 'written' },
      { name: 'Bloomberg', url: 'https://www.bloomberg.com', region: 'international', format: 'written' },
      { name: 'Reuters Business', url: 'https://www.reuters.com/business', region: 'international', format: 'written' },
      { name: 'The Economist', url: 'https://www.economist.com', region: 'international', format: 'written' },
      { name: 'Wall Street Journal', url: 'https://www.wsj.com', region: 'international', format: 'written' },
    ],
  },
  finance: {
    nigeria: [
      { name: 'Nairametrics', url: 'https://nairametrics.com', region: 'nigeria', format: 'written' },
      { name: 'BusinessDay', url: 'https://businessday.ng', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'African Business', url: 'https://african.business', region: 'africa', format: 'written' },
      { name: 'CNBC Africa', url: 'https://www.cnbcafrica.com', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Bloomberg', url: 'https://www.bloomberg.com', region: 'international', format: 'written' },
      { name: 'Reuters Business', url: 'https://www.reuters.com/business', region: 'international', format: 'written' },
      { name: 'Financial Times', url: 'https://www.ft.com', region: 'international', format: 'written' },
    ],
  },
  politics: {
    nigeria: [
      { name: 'Premium Times Politics', url: 'https://www.premiumtimesng.com/politics', region: 'nigeria', format: 'written' },
      { name: 'TheCable Politics', url: 'https://www.thecable.ng/politics', region: 'nigeria', format: 'written' },
      { name: 'Punch Politics', url: 'https://punchng.com/politics', region: 'nigeria', format: 'written' },
      { name: 'ThisDay Politics', url: 'https://www.thisdaylive.com/politics', region: 'nigeria', format: 'written' },
      { name: 'Daily Trust Politics', url: 'https://dailytrust.com/politics', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'The Africa Report Politics', url: 'https://www.theafricareport.com/politics', region: 'africa', format: 'written' },
      { name: 'African Arguments Politics', url: 'https://africanarguments.org/politics', region: 'africa', format: 'written' },
      { name: 'ISS Africa', url: 'https://issafrica.org', region: 'africa', format: 'written' },
      { name: 'AllAfrica Politics', url: 'https://allafrica.com/politics', region: 'africa', format: 'written' },
      { name: 'Mail & Guardian Politics', url: 'https://mg.co.za/politics', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Politico', url: 'https://www.politico.com', region: 'international', format: 'written' },
      { name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com', region: 'international', format: 'written' },
      { name: 'BBC Politics', url: 'https://www.bbc.com/news/politics', region: 'international', format: 'written' },
      { name: 'Reuters World', url: 'https://www.reuters.com/world', region: 'international', format: 'written' },
      { name: 'The Guardian World', url: 'https://www.theguardian.com/world', region: 'international', format: 'written' },
      { name: 'Chatham House', url: 'https://www.chathamhouse.org', region: 'international', format: 'written' },
    ],
  },
  sports: {
    nigeria: [
      { name: 'Complete Sports', url: 'https://www.completesports.com', region: 'nigeria', format: 'written' },
      { name: 'Brila', url: 'https://brila.net', region: 'nigeria', format: 'written' },
      { name: 'Punch Sports', url: 'https://punchng.com/topics/sports', region: 'nigeria', format: 'written' },
      { name: 'Premium Times Sports', url: 'https://www.premiumtimesng.com/sports-news', region: 'nigeria', format: 'written' },
      { name: 'Guardian Sport', url: 'https://guardian.ng/sport', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'SuperSport', url: 'https://supersport.com', region: 'africa', format: 'written' },
      { name: 'CAF Online', url: 'https://www.cafonline.com', region: 'africa', format: 'written' },
      { name: 'KickOff', url: 'https://www.kickoff.com', region: 'africa', format: 'written' },
      { name: 'Sport News Africa', url: 'https://sportnewsafrica.com', region: 'africa', format: 'written' },
      { name: 'BBC Sport Africa', url: 'https://www.bbc.com/sport/africa', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Sky Sports', url: 'https://www.skysports.com', region: 'international', format: 'written' },
      { name: 'ESPN', url: 'https://www.espn.com', region: 'international', format: 'written' },
      { name: 'BBC Sport', url: 'https://www.bbc.co.uk/sport', region: 'international', format: 'written' },
      { name: 'Goal', url: 'https://www.goal.com', region: 'international', format: 'written' },
    ],
  },
  music: {
    nigeria: [
      { name: 'NotJustOk', url: 'https://notjustok.com', region: 'nigeria', format: 'written' },
      { name: 'Pulse Entertainment', url: 'https://www.pulse.ng/entertainment', region: 'nigeria', format: 'written' },
      { name: 'Kemi Filani', url: 'https://kemifilani.ng', region: 'nigeria', format: 'written' },
      { name: 'NaijaVibe', url: 'https://www.naijavibe.net', region: 'nigeria', format: 'written' },
      { name: 'What Kept Me Up', url: 'https://whatkeptmeup.com', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Music In Africa', url: 'https://www.musicinafrica.net', region: 'africa', format: 'written' },
      { name: 'OkayAfrica', url: 'https://www.okayafrica.com', region: 'africa', format: 'written' },
      { name: 'Africa Is A Country (Culture)', url: 'https://africasacountry.com/culture', region: 'africa', format: 'written' },
      { name: 'The Continent', url: 'https://thecontinent.org', region: 'africa', format: 'written' },
      { name: 'Afrocritik', url: 'https://afrocritik.com', region: 'africa', format: 'written' },
      { name: 'The Culture Custodian', url: 'https://culturecustodian.com', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Billboard', url: 'https://www.billboard.com', region: 'international', format: 'written' },
    ],
  },
  film: {
    nigeria: [
      { name: 'Pulse Entertainment', url: 'https://www.pulse.ng/entertainment', region: 'nigeria', format: 'written' },
      { name: 'Kemi Filani', url: 'https://kemifilani.ng', region: 'nigeria', format: 'written' },
      { name: 'NaijaVibe', url: 'https://www.naijavibe.net', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Africa Film Press', url: 'https://africanfilmpress.com', region: 'africa', format: 'written' },
      { name: 'Sinema Focus', url: 'https://www.sinemafocus.com', region: 'africa', format: 'written' },
      { name: 'Akoroko', url: 'https://akoroko.com', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Variety', url: 'https://variety.com', region: 'international', format: 'written' },
      { name: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com', region: 'international', format: 'written' },
      { name: 'Deadline', url: 'https://deadline.com', region: 'international', format: 'written' },
      { name: 'IndieWire', url: 'https://www.indiewire.com', region: 'international', format: 'written' },
    ],
  },
  education: {
    nigeria: [
      { name: 'EduCeleb', url: 'https://educeleb.com', region: 'nigeria', format: 'written' },
      { name: 'MySchoolGist', url: 'https://www.myschoolgist.com', region: 'nigeria', format: 'written' },
      { name: 'Scholarships Café', url: 'https://scholarshipscafe.com', region: 'nigeria', format: 'written' },
    ],
    international: [
      { name: 'Times Higher Education', url: 'https://www.timeshighereducation.com', region: 'international', format: 'written' },
      { name: 'Inside Higher Ed', url: 'https://www.insidehighered.com', region: 'international', format: 'written' },
      { name: 'University World News', url: 'https://www.universityworldnews.com', region: 'international', format: 'written' },
      { name: 'The Hechinger Report', url: 'https://hechingerreport.org', region: 'international', format: 'written' },
      { name: 'Education Week', url: 'https://www.edweek.org', region: 'international', format: 'written' },
    ],
  },
  fashion: {
    nigeria: [
      { name: 'BellaNaija Style', url: 'https://www.bellanaijastyle.com', region: 'nigeria', format: 'written' },
      { name: 'Genevieve Magazine', url: 'https://genevievemagazine.com', region: 'nigeria', format: 'written' },
      { name: 'Guardian Life', url: 'https://guardian.ng/life', region: 'nigeria', format: 'written' },
      { name: 'Zikoko', url: 'https://www.zikoko.com', region: 'nigeria', format: 'written' },
      { name: 'REDTV', url: 'https://itsred.tv', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'OkayAfrica Style', url: 'https://www.okayafrica.com/style', region: 'africa', format: 'written' },
      { name: 'Afrobella', url: 'https://afrobella.com', region: 'africa', format: 'written' },
      { name: 'Twyg', url: 'https://twyg.co.za', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Vogue', url: 'https://www.vogue.com', region: 'international', format: 'written' },
      { name: 'GQ', url: 'https://www.gq.com', region: 'international', format: 'written' },
    ],
  },
  travel: {
    nigeria: [
      { name: 'Guardian Life', url: 'https://guardian.ng/life', region: 'nigeria', format: 'written' },
      { name: 'Zikoko', url: 'https://www.zikoko.com', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'Travel News Africa', url: 'https://travelnews.africa', region: 'africa', format: 'written' },
      { name: 'Culture Trip Africa', url: 'https://theculturetrip.com/africa', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Condé Nast Traveler', url: 'https://www.cntraveler.com', region: 'international', format: 'written' },
      { name: 'Travel + Leisure', url: 'https://www.travelandleisure.com', region: 'international', format: 'written' },
      { name: 'National Geographic Travel', url: 'https://www.nationalgeographic.com/travel', region: 'international', format: 'written' },
    ],
  },
  faith: {
    nigeria: [
      { name: 'Church Times Nigeria', url: 'https://churchtimesnigeria.net', region: 'nigeria', format: 'written' },
      { name: 'Guardian (Ibru Ecumenical Centre)', url: 'https://guardian.ng/category/sunday-magazine/ibru-ecumenical-centre', region: 'nigeria', format: 'written' },
      { name: 'Christianity Nigeria', url: 'https://christianitynigeria.com', region: 'nigeria', format: 'written' },
      { name: 'Muslim News Nigeria', url: 'https://muslimnews.com.ng', region: 'nigeria', format: 'written' },
    ],
    africa: [
      { name: 'African Arguments (Faith)', url: 'https://africanarguments.org/faith', region: 'africa', format: 'written' },
      { name: 'The Elephant', url: 'https://www.theelephant.info', region: 'africa', format: 'written' },
      { name: 'Africa Is A Country (Religion)', url: 'https://africasacountry.com/religion', region: 'africa', format: 'written' },
      { name: 'Agenzia Fides', url: 'https://www.fides.org', region: 'africa', format: 'written' },
      { name: 'AllAfrica Religion', url: 'https://allafrica.com/religion', region: 'africa', format: 'written' },
    ],
    international: [
      { name: 'Aeon', url: 'https://aeon.co', region: 'international', format: 'written' },
      { name: 'Philosophy Now', url: 'https://philosophynow.org', region: 'international', format: 'written' },
      { name: 'The Conversation (Philosophy)', url: 'https://theconversation.com/global/topics/philosophy-114', region: 'international', format: 'written' },
      { name: 'Religion News Service', url: 'https://religionnews.com', region: 'international', format: 'written' },
      { name: 'New Humanist', url: 'https://newhumanist.org.uk', region: 'international', format: 'written' },
    ],
  },
};

// Podcast sources
export const PODCAST_SOURCES: ContentSourcesByCategory = {
  climate: {
    international: [
      { name: 'Outrage + Optimism', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'Acast'] },
      { name: 'The Energy Gang', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'The Climate Question', url: '', region: 'international', format: 'podcast', platforms: ['BBC Sounds', 'Spotify', 'Apple Podcasts'] },
    ],
  },
  health: {
    international: [
      { name: 'Health Check', url: '', region: 'international', format: 'podcast', platforms: ['BBC Sounds', 'Spotify', 'Apple Podcasts'] },
      { name: 'The Lancet Voice', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Public Health On Call', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  science: {
    international: [
      { name: 'Science Vs', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Nature Podcast', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'Science Friday', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  tech: {
    international: [
      { name: 'Hard Fork', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'The Vergecast', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'Acquired', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  business: {
    international: [
      { name: 'Planet Money', url: '', region: 'international', format: 'podcast', platforms: ['NPR App', 'Spotify', 'Apple Podcasts'] },
      { name: 'Odd Lots', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'How I Built This', url: '', region: 'international', format: 'podcast', platforms: ['NPR App', 'Spotify', 'Apple Podcasts'] },
    ],
  },
  politics: {
    international: [
      { name: 'The Daily', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'Global News Podcast', url: '', region: 'international', format: 'podcast', platforms: ['BBC Sounds', 'Spotify', 'Apple Podcasts'] },
      { name: 'The Intelligence', url: '', region: 'international', format: 'podcast', platforms: ['Economist App', 'Spotify', 'Apple Podcasts'] },
    ],
  },
  sports: {
    international: [
      { name: 'Football Daily', url: '', region: 'international', format: 'podcast', platforms: ['BBC Sounds', 'Spotify', 'Apple Podcasts'] },
      { name: 'The Athletic FC Podcast', url: '', region: 'international', format: 'podcast', platforms: ['The Athletic App', 'Spotify', 'Apple Podcasts'] },
      { name: 'Men in Blazers', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  music: {
    international: [
      { name: 'Afrobeats Intelligence', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'Song Exploder', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'Popcast', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  film: {
    international: [
      { name: 'The Big Picture', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'IndieWire Screen Talk', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Scriptnotes', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  education: {
    international: [
      { name: 'The EdSurge Podcast', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Future U', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Education Next', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
    ],
  },
  fashion: {
    international: [
      { name: 'The Business of Fashion Podcast', url: '', region: 'international', format: 'podcast', platforms: ['BoF App', 'Spotify', 'Apple Podcasts'] },
    ],
  },
  travel: {
    international: [
      { name: 'Women Who Travel', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts'] },
      { name: 'Zero To Travel', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
  faith: {
    international: [
      { name: 'Philosophize This!', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'On Being', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
      { name: 'The Partially Examined Life', url: '', region: 'international', format: 'podcast', platforms: ['Spotify', 'Apple Podcasts', 'YouTube'] },
    ],
  },
};

// Helper function to get sources by category and location
export function getSourcesByCategoryAndLocation(
  category: string,
  location: string
): ContentSource[] {
  const regionMap: Record<string, ContentRegion> = {
    Nigeria: 'nigeria',
    Africa: 'africa',
    World: 'international',
  };

  const region = regionMap[location] || 'international';
  const categorySources = CONTENT_SOURCES[category];
  
  if (!categorySources) return [];
  
  // Get sources for the specific region
  const regionSources = categorySources[region] || [];
  
  // For Africa, also include Nigeria sources
  if (location === 'Africa') {
    const nigeriaSources = categorySources.nigeria || [];
    return [...regionSources, ...nigeriaSources];
  }
  
  return regionSources;
}
