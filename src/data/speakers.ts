export type Speaker = {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  bio_short: string;
  bio_long: string[];
  fee_min: number;
  fee_max: number;
  fee_on_application: boolean;
  available: boolean;
  location: string;
  topics: string[];
  showreel_url: string | null;
  testimonials: {
    quote: string;
    author_name: string;
    author_role: string;
    company: string;
    result?: string;
  }[];
  past_clients: string[];
};

export type TopicDef = {
  slug: string;
  name: string;
  heading: string;
  blurb: string;
  kind: "topic" | "audience" | "event" | "location";
  /**
   * Shown in the homepage category list, the footer and the profile filters.
   * The long tail of imported categories has a page each but stays out of those
   * lists, which would otherwise run to 35 entries.
   */
  featured?: boolean;
  /**
   * How this topic reaches the imported roster. The site's topics and the CSV's
   * categories were authored separately and do not line up, so the mapping is
   * explicit rather than inferred from the name.
   *
   * Omit it when no honest mapping exists — /topics/keynote is the case: the
   * roster has no "Keynote" category because very nearly every speaker on it is
   * a keynote speaker, so mapping it would just duplicate /speakers.
   */
  roster?: {
    /** Roster category labels, OR-matched. */
    categories?: string[];
    /** Locks the roster query to one gender, for /topics/female-speakers. */
    gender?: "female" | "male";
  };
};

export const topics: TopicDef[] = [
  {
    slug: "leadership",
    name: "Leadership",
    heading: "Leadership Speakers",
    blurb:
      "Leadership speakers help executive teams and emerging managers lead through change with clarity. Every fee below is published upfront, so you can shortlist within your budget before you make contact.",
    kind: "topic",
    featured: true,
    roster: { categories: ["Leadership"] },
  },
  {
    slug: "motivational",
    name: "Motivational",
    heading: "Motivational Speakers",
    blurb:
      "Motivational speakers open and close conferences with a story that people repeat afterwards. Browse fees, availability and topics, then enquire directly with the speaker.",
    kind: "topic",
    featured: true,
    roster: { categories: ["Motivational", "Inspirational"] },
  },
  {
    slug: "business",
    name: "Business",
    heading: "Business Speakers",
    blurb:
      "Business speakers cover strategy, growth, customer experience and operating models. Fees are shown as bands so you know the cost before the conversation starts.",
    kind: "topic",
    featured: true,
    roster: { categories: ["Business"] },
  },
  {
    slug: "futurist-ai",
    name: "Futurist & AI",
    heading: "Futurist & AI Speakers",
    blurb:
      "Futurist and AI speakers explain what is actually changing, and what your teams should do about it next quarter. Compare fees and formats side by side.",
    kind: "topic",
    featured: true,
    roster: { categories: ["Technology, Future & Innovation", "AI"] },
  },
  {
    slug: "resilience",
    name: "Resilience",
    heading: "Resilience Speakers",
    blurb:
      "Resilience speakers work with teams carrying a heavy quarter, a restructure or a long delivery. Fees are published on every profile, so you can shortlist before you make contact.",
    kind: "topic",
    featured: true,
    roster: { categories: ["Resilience"] },
  },
  {
    slug: "keynote",
    name: "Keynote",
    heading: "Keynote Speakers",
    blurb:
      "Keynote speakers to open your conference, with fees published upfront. Shortlist by topic, fee band and location, then book directly.",
    kind: "topic",
    featured: true,
  },
  {
    slug: "female-speakers",
    name: "Female speakers",
    heading: "Female Speakers",
    blurb:
      "Female keynote speakers across leadership, resilience, business and technology. Every profile lists a fee band and current availability.",
    kind: "topic",
    featured: true,
    roster: { gender: "female" },
  },
  // ── Imported roster categories ───────────────────────────────────────────
  // One page per category so every speaker on the roster is reachable from an
  // indexable URL, not just from the noindex filter views on /speakers.
  {
    slug: "sport",
    name: "Sports",
    heading: "Sports Speakers",
    blurb:
      "Athletes and coaches who can explain what the preparation actually looked like, rather than replaying the highlight reel. Most suit conference openings and sales kick-offs, and every full profile publishes a fee band.",
    kind: "topic",
    roster: { categories: ["Sport"] },
  },
  {
    slug: "mc-and-hosts",
    name: "MCs & Hosts",
    heading: "Master of Ceremonies & Event Hosts",
    blurb:
      "An MC holds the room together between sessions, keeps the run sheet honest and covers the gap when a speaker overruns. Filter by state, because a host who already knows the local audience usually earns more than a bigger name flown in.",
    kind: "topic",
    roster: { categories: ["Master of Ceremonies (MCs) & Hosts"] },
  },
  {
    slug: "celebrity",
    name: "Celebrity",
    heading: "Celebrity Speakers",
    blurb:
      "Recognisable names from television, sport and music, booked for awards nights, gala dinners and conferences that need to sell tickets. Celebrity fees start well above the rest of the roster, which is exactly why we publish the bands.",
    kind: "topic",
    roster: { categories: ["Celebrity"] },
  },
  {
    slug: "health-and-wellbeing",
    name: "Health & Wellbeing",
    heading: "Health, Lifestyle & Wellbeing Speakers",
    blurb:
      "Practitioners on sleep, nutrition, movement and the habits that survive a busy quarter. Built for wellbeing weeks and all-staff days where the audience wants something they can act on the same evening.",
    kind: "topic",
    roster: { categories: ["Health, Lifestyle & Wellbeing"] },
  },
  {
    slug: "diversity-and-inclusion",
    name: "Diversity & Inclusion",
    heading: "Diversity & Inclusion Speakers",
    blurb:
      "Speakers who turn inclusion into observable manager behaviour rather than a values statement, including lived experience of disability and neurodiversity. Published fees make it possible to build a balanced panel inside one budget.",
    kind: "topic",
    roster: { categories: ["Diversity & Inclusion"] },
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    heading: "Mental Health & Wellness Speakers",
    blurb:
      "Clinicians, researchers and people speaking from their own recovery, for audiences where the subject needs handling carefully. Tell us about your room when you enquire and we will flag content warnings and pre-briefing.",
    kind: "topic",
    roster: { categories: ["Mental Health & Wellness"] },
  },
  {
    slug: "team-building",
    name: "Team Building",
    heading: "Team Building Speakers",
    blurb:
      "Facilitators for offsites where the point is the team working better afterwards, not the talk itself. Most offer a workshop format alongside the keynote, priced separately.",
    kind: "topic",
    roster: { categories: ["Team Building"] },
  },
  {
    slug: "people-and-culture",
    name: "People & Culture",
    heading: "People & Culture Speakers",
    blurb:
      "Speakers for HR conferences and manager forums: hiring, retention, performance conversations and the culture work that outlasts a restructure.",
    kind: "topic",
    roster: { categories: ["People & Culture"] },
  },
  {
    slug: "creativity-and-innovation",
    name: "Creativity & Innovation",
    heading: "Creativity & Innovation Speakers",
    blurb:
      "Designers, inventors and operators on where ideas actually come from and how they survive an approval process. Suits innovation days and strategy offsites more than large plenaries.",
    kind: "topic",
    roster: { categories: ["Creativity & Innovation"] },
  },
  {
    slug: "media",
    name: "Media",
    heading: "Media & Broadcast Speakers",
    blurb:
      "Journalists, broadcasters and editors on how coverage gets made and what earns it. Many are booked as both a speaker and a panel chair on the same day.",
    kind: "topic",
    roster: { categories: ["Media"] },
  },
  {
    slug: "virtual",
    name: "Virtual",
    heading: "Virtual Keynote Speakers",
    blurb:
      "Speakers who present well down a camera, with the pacing and interaction a remote audience needs. Virtual sessions are usually priced below the in-person band on the same profile.",
    kind: "topic",
    roster: { categories: ["Virtual"] },
  },
  {
    slug: "politics-and-law",
    name: "Politics & Law",
    heading: "Politics & Law Speakers",
    blurb:
      "Former ministers, advisers and senior counsel briefing boards on regulation, political risk and what is actually likely to pass. Sessions are often private and unrecorded.",
    kind: "topic",
    roster: { categories: ["Politics & Law"] },
  },
  {
    slug: "social-trends",
    name: "Social Trends",
    heading: "Social Trends & Current Affairs Speakers",
    blurb:
      "Researchers and commentators on what is shifting in how people live, work and spend, with the data behind the claim rather than the anecdote.",
    kind: "topic",
    roster: { categories: ["Social Trends & Current Affairs"] },
  },
  {
    slug: "storytelling",
    name: "Storytelling",
    heading: "Storytelling Speakers",
    blurb:
      "Speakers who teach narrative as a working skill, for teams that have to pitch, present or fundraise. Usually the most practical booking on this list.",
    kind: "topic",
    roster: { categories: ["Storytelling"] },
  },
  {
    slug: "after-dinner",
    name: "After Dinner",
    heading: "After Dinner Speakers",
    blurb:
      "Speakers for the end of a long day, when the room has eaten and wants to enjoy itself. Timing and read-the-room instinct matter more here than subject matter.",
    kind: "topic",
    roster: { categories: ["After Dinner Speakers"] },
  },
  {
    slug: "education",
    name: "Education",
    heading: "Education Speakers",
    blurb:
      "Teachers, principals and researchers for staff development days, education conferences and parent evenings.",
    kind: "topic",
    roster: { categories: ["Education"] },
  },
  {
    slug: "food-and-wine",
    name: "Food & Wine",
    heading: "Food & Wine Speakers",
    blurb:
      "Chefs, winemakers and food writers for tasting events, hospitality conferences and dinners built around what is on the plate.",
    kind: "topic",
    roster: { categories: ["Food & Wine"] },
  },
  {
    slug: "economy-and-finance",
    name: "Economy & Finance",
    heading: "Economy & Finance Speakers",
    blurb:
      "Economists and market analysts translating rates, inflation and capital flows into what it means for next quarter's plan.",
    kind: "topic",
    roster: { categories: ["Economy & Finance"] },
  },
  {
    slug: "adventurers",
    name: "Adventurers",
    heading: "Adventure & Expedition Speakers",
    blurb:
      "Explorers, mountaineers and solo endurance athletes, usually with photography that holds a room without a slide deck. Strong for conference dinners and annual gatherings.",
    kind: "topic",
    roster: { categories: ["Adventurers"] },
  },
  {
    slug: "climate-and-environment",
    name: "Climate & Environment",
    heading: "Environment & Climate Change Speakers",
    blurb:
      "Scientists and practitioners on emissions, adaptation and what a decarbonisation plan involves once the pledge is signed.",
    kind: "topic",
    roster: { categories: ["Environment & Climate Change"] },
  },
  {
    slug: "world-affairs",
    name: "World Affairs",
    heading: "World Affairs Speakers",
    blurb:
      "Correspondents, diplomats and analysts on the conflicts, alliances and trade shifts that reach your industry rather than the ones that lead the news.",
    kind: "topic",
    roster: { categories: ["World Affairs"] },
  },
  {
    slug: "marketing",
    name: "Advertising & Marketing",
    heading: "Advertising & Marketing Speakers",
    blurb:
      "Marketers and agency founders on brand, demand generation and measuring the work that is genuinely hard to measure.",
    kind: "topic",
    roster: { categories: ["Advertising & Marketing"] },
  },
  {
    slug: "generations",
    name: "Generations",
    heading: "Intergenerational Speakers",
    blurb:
      "Speakers on four generations sharing one workplace, for audiences still arguing about hybrid work and what each cohort expects.",
    kind: "topic",
    roster: { categories: ["Intergenerational Influencers"] },
  },
  {
    slug: "sustainability",
    name: "Sustainability",
    heading: "Sustainability Speakers",
    blurb:
      "Speakers on supply chains, circular design and reporting, for organisations past the commitment stage and into delivery.",
    kind: "topic",
    roster: { categories: ["Sustainability"] },
  },
  {
    slug: "social-media",
    name: "Social Media",
    heading: "Social Media & Creator Speakers",
    blurb:
      "Creators and platform strategists on building an audience and what actually converts, without the growth-hack theatre.",
    kind: "topic",
    roster: { categories: ["Social Media & Networking"] },
  },
  {
    slug: "authors",
    name: "Authors",
    heading: "Author Speakers",
    blurb:
      "Writers with a book behind the talk, which usually means material tested on a few hundred rooms and a signing queue afterwards.",
    kind: "topic",
    roster: { categories: ["Authors"] },
  },
  {
    slug: "indigenous",
    name: "Indigenous",
    heading: "Indigenous Speakers",
    blurb:
      "First Nations speakers on culture, history, reconciliation and connection to country, including Welcome to Country and Acknowledgement of Country for events.",
    kind: "topic",
    roster: { categories: ["Indigenous Speakers"] },
  },
  {
    slug: "military",
    name: "Military",
    heading: "Military & Veteran Speakers",
    blurb:
      "Veterans and former commanders on decision-making under pressure, briefing discipline and leading teams where mistakes are expensive.",
    kind: "topic",
    roster: { categories: ["Military"] },
  },
];

/**
 * The full-profile speakers live in Supabase now (see speakers.server.ts), so
 * every helper below that used to close over a module-level array takes it as
 * a parameter instead. Pure functions, no fetch of their own — a route loader
 * fetches once and passes the result to whichever of these it needs.
 */
export function getSpeaker(slug: string, speakers: readonly Speaker[]) {
  return speakers.find((s) => s.slug === slug);
}

/** The seven editorial topics, for the homepage list and the profile filters. */
export const featuredTopics: TopicDef[] = topics.filter((t) => t.featured);

export function getTopic(slug: string) {
  return topics.find((t) => t.slug === slug);
}

/**
 * Names where appending "speakers" to the name reads wrong — "authors speakers",
 * "adventurers speakers", "generations speakers". The phrase is stated rather
 * than derived for these.
 */
const PHRASE_BASE: Record<string, string> = {
  Authors: "author",
  Adventurers: "adventure",
  Generations: "intergenerational",
  "MCs & Hosts": "MC and event host",
};

/**
 * Lower-case a topic name for use mid-sentence, keeping acronyms intact so
 * "Futurist & AI" reads as "futurist & AI" and not "futurist & ai".
 */
function midSentence(rawName: string): string {
  const name = PHRASE_BASE[rawName] ?? rawName;
  return name
    .split(" ")
    .map((word) => (/^[A-Z0-9&]+$/.test(word) && word.length <= 4 ? word : word.toLowerCase()))
    .join(" ");
}

/**
 * "Leadership" -> "leadership speakers"; "Female speakers" -> "female speakers".
 *
 * Some topic names already carry the noun, so appending it unconditionally read
 * as "female speakers speakers".
 */
export function topicPhrase(name: string): string {
  const phrase = midSentence(name);
  return /\bspeakers?$/i.test(phrase) ? phrase : `${phrase} speakers`;
}

/** Singular form, for "how do I book a … speaker?". */
export function topicPhraseSingular(name: string): string {
  const phrase = midSentence(name);
  return /\bspeakers$/i.test(phrase) ? phrase.replace(/s$/, "") : `${phrase} speaker`;
}

/**
 * Slug for a topic label as written on a speaker profile.
 *
 * Looked up rather than derived, so a label we publish no page for can never
 * become a link to a 404.
 */
export function topicSlugFor(topicName: string): string | null {
  return topics.find((t) => t.name === topicName)?.slug ?? null;
}

export function speakersByTopic(topicName: string, speakers: readonly Speaker[]) {
  return speakers.filter((s) => s.topics.includes(topicName));
}

/**
 * All full profiles, with the named slugs first in the order given and everyone
 * else after, keeping their existing relative order.
 *
 * Display order is expressed at the call site rather than by reordering the
 * `speakers` array itself, because that same array also drives the sitemap,
 * the enquiry form's dropdown, and the "similar speakers" rail — which is
 * `speakers.filter(...).slice(0, 6)`, so reordering it would quietly change who
 * shows as similar on every profile.
 *
 * Throws on an unknown or repeated slug: both would otherwise show up as a card
 * silently missing or appearing twice, which nobody notices until a speaker asks
 * why they are not on the page.
 */
export function pinnedFirst(slugs: readonly string[], speakers: readonly Speaker[]): Speaker[] {
  const seen = new Set<string>();
  const pinned = slugs.map((slug) => {
    if (seen.has(slug)) throw new Error(`pinnedFirst lists "${slug}" twice`);
    seen.add(slug);
    const speaker = getSpeaker(slug, speakers);
    if (!speaker) throw new Error(`pinnedFirst names an unknown speaker slug: "${slug}"`);
    return speaker;
  });
  return [...pinned, ...speakers.filter((s) => !seen.has(s.slug))];
}
