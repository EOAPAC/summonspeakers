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
      "Motivational speakers open and close conferences with a story that people repeat afterwards. Browse fees, availability and topics, then enquire directly — there is no bureau in the middle.",
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

export const speakers: Speaker[] = [
  {
    slug: "dr-maya-ellison",
    name: "Dr Maya Ellison",
    role: "Resilience & leadership keynote speaker",
    tagline: "Helps leadership teams stay steady when the plan stops working.",
    bio_short:
      "A clinical psychologist turned keynote speaker, Maya has spent fifteen years studying how teams hold their nerve under pressure.",
    bio_long: [
      "Dr Maya Ellison began her career as a clinical psychologist working with emergency services teams in New South Wales. Over a decade she watched the same pattern repeat: the crews who recovered fastest were not the toughest, they were the best supported. That observation became her research, and her research became the talk she now gives to leadership teams around the world.",
      "Her keynote, The Steady Middle, gives leaders a practical model for the months when a strategy is halfway delivered and enthusiasm has run out. Rather than motivation, she teaches sequencing: what to hold, what to drop, and how to say either one out loud. Audiences leave with three decisions they can make on Monday.",
      "Maya has spoken at more than 200 conferences and leadership offsites, from 40-person executive retreats to 4,000-seat auditoriums. She is based in Sydney, travels internationally, and works closely with organisers beforehand so the talk names the situation the room is actually in.",
    ],
    fee_min: 15000,
    fee_max: 20000,
    fee_on_application: false,
    available: true,
    location: "Sydney, AU · travels internationally",
    topics: ["Leadership", "Resilience", "Female speakers", "Keynote"],
    showreel_url: "https://www.youtube.com/embed/ysz5S6PUM-U",
    testimonials: [
      {
        quote:
          "Maya spoke to 900 managers and the room went completely quiet. Six months later people still quote the sequencing model back to me in meetings.",
        author_name: "Elena Marsh",
        author_role: "Head of People",
        company: "Northbridge Group",
        result: "Booked in one afternoon",
      },
      {
        quote:
          "She asked better questions in the prep call than most speakers ask all year. The talk landed because it was about us.",
        author_name: "Tom Verity",
        author_role: "Events Director",
        company: "Ardent Health",
        result: "Rebooked the following year",
      },
      {
        quote:
          "We knew the fee before we picked up the phone. That alone saved us two weeks of back and forth.",
        author_name: "Priya Nandan",
        author_role: "Conference Producer",
        company: "Meridian Events",
        result: "Shortlist in 24 hours",
      },
    ],
    past_clients: [
      "Northbridge Group",
      "Ardent Health",
      "Telstra",
      "Commonwealth Bank",
      "Deloitte",
      "University of Sydney",
      "Qantas",
      "NSW Health",
    ],
  },
  {
    slug: "james-okoro",
    name: "James Okoro",
    role: "Motivational keynote speaker & former Olympian",
    tagline: "Turns a sporting career into a plain-spoken lesson on preparation.",
    bio_short:
      "Two-time Olympic sprinter who now speaks about the unglamorous work behind visible performance.",
    bio_long: [
      "James Okoro represented Great Britain over two Olympic cycles, finishing fourth in a final decided by four hundredths of a second. He talks about that race often, but never as a triumph — as evidence that preparation is the only part you control.",
      "His keynote suits conference openings and sales kick-offs, where a room needs energy without slogans. He builds every talk around one decision the audience is facing that quarter.",
      "James lives in Melbourne and speaks across Australia and Asia-Pacific, with occasional dates in the UK.",
    ],
    fee_min: 9000,
    fee_max: 13000,
    fee_on_application: false,
    available: true,
    location: "Melbourne, AU · travels Asia-Pacific",
    topics: ["Motivational", "Keynote", "Leadership"],
    showreel_url: null,
    testimonials: [
      {
        quote: "He opened our kick-off and the energy carried through the whole day.",
        author_name: "Dana Whitfield",
        author_role: "Sales Director",
        company: "Aster Logistics",
        result: "Opened a 1,200-person kick-off",
      },
    ],
    past_clients: ["Aster Logistics", "NAB", "Optus", "AFL"],
  },
  {
    slug: "sarah-lindqvist",
    name: "Sarah Lindqvist",
    role: "Futurist & AI keynote speaker",
    tagline: "Explains what AI actually changes for your business next quarter.",
    bio_short:
      "Former research lead turned futurist, known for talks that avoid hype and name specific operational changes.",
    bio_long: [
      "Sarah Lindqvist spent nine years in applied machine learning research before moving to advisory work with boards and executive teams. She now speaks about automation the way an operator does: which tasks move, which roles change, and what to measure.",
      "Her sessions work well for industry conferences and board offsites, and she offers a workshop format for smaller groups.",
      "She is based in Stockholm and travels globally, with a regular Australian speaking season each March.",
    ],
    fee_min: 22000,
    fee_max: 30000,
    fee_on_application: false,
    available: true,
    location: "Stockholm, SE · travels internationally",
    topics: ["Futurist & AI", "Business", "Female speakers", "Keynote"],
    showreel_url: null,
    testimonials: [
      {
        quote: "No hype, no robots on slides. Our board asked for the deck afterwards.",
        author_name: "Marcus Bell",
        author_role: "Chief Strategy Officer",
        company: "Havenline",
        result: "Booked for a board offsite",
      },
    ],
    past_clients: ["Havenline", "Ericsson", "SAP", "Westpac"],
  },
  {
    slug: "priya-raman",
    name: "Priya Raman",
    role: "Business growth keynote speaker",
    tagline: "Founder-operator on building revenue without breaking the team.",
    bio_short:
      "Scaled a services business from four people to three hundred, and speaks candidly about what it cost.",
    bio_long: [
      "Priya Raman founded a consultancy in a spare room and sold it fourteen years later with offices in three countries. Her talk is about the middle of that story, where growth and culture pulled in opposite directions.",
      "She speaks to founder communities, professional services firms and leadership conferences.",
      "Priya is based in Singapore and takes dates across Asia-Pacific and the Middle East.",
    ],
    fee_min: 12000,
    fee_max: 16000,
    fee_on_application: false,
    available: true,
    location: "Singapore · travels Asia-Pacific",
    topics: ["Business", "Leadership", "Female speakers"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Honest about the parts most founders leave out. Our partners loved her.",
        author_name: "Alan Reyes",
        author_role: "Managing Partner",
        company: "Corvin & Wray",
      },
    ],
    past_clients: ["Corvin & Wray", "DBS", "Grab", "EY"],
  },
  {
    slug: "michael-toure",
    name: "Michael Touré",
    role: "Leadership & culture keynote speaker",
    tagline: "Twenty years turning around teams nobody wanted to inherit.",
    bio_short:
      "A former operations executive who specialises in the leadership work that happens after the restructure.",
    bio_long: [
      "Michael Touré led operations across three manufacturing groups, twice arriving after a failed integration. His talk describes the first ninety days of taking over a demoralised team.",
      "He is direct, uses no slides, and works best with audiences of managers rather than executives.",
      "Michael is based in Auckland and speaks across New Zealand and Australia.",
    ],
    fee_min: 7000,
    fee_max: 11000,
    fee_on_application: false,
    available: true,
    location: "Auckland, NZ · travels Australia & NZ",
    topics: ["Leadership", "Business"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Straight talking, no theatre. Exactly what our site managers needed.",
        author_name: "Kate Ellery",
        author_role: "Operations Lead",
        company: "Fernward",
      },
    ],
    past_clients: ["Fernward", "Fonterra", "Air New Zealand"],
  },
  {
    slug: "helena-brandt",
    name: "Helena Brandt",
    role: "Motivational speaker & polar explorer",
    tagline: "Crossed Antarctica alone, and talks about the days she wanted to stop.",
    bio_short:
      "The first woman to complete a solo unsupported crossing of her route, now speaking on endurance and decision-making.",
    bio_long: [
      "Helena Brandt spent fifty-eight days alone on the ice. Her keynote is not about heroism; it is about the small, boring routines that kept her moving when the weather made progress pointless.",
      "Audiences at conference dinners and annual gatherings respond to the honesty and the photography.",
      "She is based in Cape Town and travels internationally.",
    ],
    fee_min: 18000,
    fee_max: 24000,
    fee_on_application: false,
    available: false,
    location: "Cape Town, ZA · travels internationally",
    topics: ["Motivational", "Female speakers", "Keynote"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Our 700 guests stopped eating to listen. That never happens at a dinner.",
        author_name: "Ruth Ackland",
        author_role: "Head of Events",
        company: "Lantern Foundation",
      },
    ],
    past_clients: ["Lantern Foundation", "Absa", "Shell"],
  },
  {
    slug: "daniel-hsu",
    name: "Daniel Hsu",
    role: "Technology & innovation keynote speaker",
    tagline: "Product leader on shipping things inside slow organisations.",
    bio_short:
      "Built products at three large companies and speaks about innovation without a lab or a budget.",
    bio_long: [
      "Daniel Hsu has spent his career as an internal product leader, which he describes as innovation with the handbrake on. His talk is a practical account of getting new work approved and released inside organisations designed to prevent surprises.",
      "He works well at industry conferences, technology summits and internal leadership days.",
      "Daniel is based in Taipei and speaks across Asia and North America.",
    ],
    fee_min: 10000,
    fee_max: 14000,
    fee_on_application: false,
    available: true,
    location: "Taipei, TW · travels Asia & North America",
    topics: ["Futurist & AI", "Business", "Keynote"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Practical to the point of being uncomfortable. Our teams needed that.",
        author_name: "Ingrid Sollis",
        author_role: "CTO",
        company: "Palewood",
      },
    ],
    past_clients: ["Palewood", "Foxconn", "Atlassian"],
  },
  {
    slug: "grace-oyelaran",
    name: "Grace Oyelaran",
    role: "Inclusive leadership keynote speaker",
    tagline: "Makes inclusion a management practice, not a values statement.",
    bio_short:
      "An organisational researcher who translates inclusion into the everyday decisions managers already make.",
    bio_long: [
      "Grace Oyelaran researches how teams distribute attention: who gets asked, who gets interrupted, who gets the stretch project. Her keynote turns that research into observable manager behaviour.",
      "She speaks at leadership conferences, professional bodies and internal manager forums.",
      "Grace is based in London and travels internationally.",
    ],
    fee_min: 13000,
    fee_max: 18000,
    fee_on_application: false,
    available: true,
    location: "London, UK · travels internationally",
    topics: ["Leadership", "Female speakers", "Business"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Concrete, measurable and completely free of jargon.",
        author_name: "Peter Nsimbi",
        author_role: "Chief People Officer",
        company: "Rowe & Halden",
      },
    ],
    past_clients: ["Rowe & Halden", "NHS", "Unilever", "Lloyds"],
  },
  {
    slug: "andres-molina",
    name: "Andrés Molina",
    role: "Futurist & economics keynote speaker",
    tagline: "Reads the next decade through supply chains and demographics.",
    bio_short: "An economist who explains long-term shifts in language a sales team can act on.",
    bio_long: [
      "Andrés Molina spent twelve years forecasting for multinationals before moving to the stage. He builds each talk around the two or three forces that will actually reach the audience's industry.",
      "He is a frequent opener for industry association conferences.",
      "Andrés is based in Madrid and travels internationally.",
    ],
    fee_min: 16000,
    fee_max: 21000,
    fee_on_application: false,
    available: true,
    location: "Madrid, ES · travels internationally",
    topics: ["Futurist & AI", "Business", "Keynote"],
    showreel_url: null,
    testimonials: [
      {
        quote: "He made macroeconomics feel like next week's problem, in a good way.",
        author_name: "Sofia Kern",
        author_role: "Association Director",
        company: "EuroFreight",
      },
    ],
    past_clients: ["EuroFreight", "Iberdrola", "Maersk"],
  },
  {
    slug: "nina-castellan",
    name: "Nina Castellan",
    role: "Celebrity keynote speaker & broadcaster",
    tagline: "Twenty years on national television, now on conference stages.",
    bio_short: "A household-name broadcaster who hosts and headlines large corporate events.",
    bio_long: [
      "Nina Castellan spent two decades presenting national current affairs and now headlines large conferences, awards nights and gala dinners.",
      "She offers both a keynote and a hosting package, and is often booked for both on the same day.",
      "Nina is based in Sydney and travels internationally.",
    ],
    fee_min: 40000,
    fee_max: 55000,
    fee_on_application: false,
    available: true,
    location: "Sydney, AU · travels internationally",
    topics: ["Motivational", "Keynote", "Female speakers"],
    showreel_url: null,
    testimonials: [
      {
        quote: "She held a room of 2,000 people for a full evening without a script.",
        author_name: "Greg Halloran",
        author_role: "Awards Producer",
        company: "Southbank Media",
      },
    ],
    past_clients: ["Southbank Media", "Telstra", "Woolworths"],
  },
  {
    slug: "omar-haddad",
    name: "Omar Haddad",
    role: "Sales performance keynote speaker",
    tagline: "Rebuilt three sales organisations, and shows the maths behind it.",
    bio_short: "A revenue leader who talks about pipeline discipline rather than motivation.",
    bio_long: [
      "Omar Haddad has led sales organisations through two turnarounds and one hypergrowth period. His keynote is built around a single diagnostic: where deals actually stall.",
      "He suits sales kick-offs, revenue summits and partner conferences.",
      "Omar is based in Dubai and travels across the Middle East, Europe and Asia.",
    ],
    fee_min: 8000,
    fee_max: 12000,
    fee_on_application: false,
    available: true,
    location: "Dubai, AE · travels internationally",
    topics: ["Business", "Motivational"],
    showreel_url: null,
    testimonials: [
      {
        quote: "Our reps rewrote their pipeline reviews the same week.",
        author_name: "Lena Fischer",
        author_role: "VP Revenue",
        company: "Brightmark",
      },
    ],
    past_clients: ["Brightmark", "Emirates NBD", "Careem"],
  },
  {
    slug: "robert-ainsley",
    name: "Robert Ainsley",
    role: "Former head of state advisor & geopolitics speaker",
    tagline: "Closed-door briefings on the politics behind the headlines.",
    bio_short:
      "A senior advisor across three administrations, speaking to boards on political risk.",
    bio_long: [
      "Robert Ainsley advised at cabinet level for over a decade and now briefs boards and executive committees on political risk.",
      "Sessions are usually private and unrecorded, which is why his fee is quoted per engagement.",
      "Robert is based in Washington DC and travels internationally.",
    ],
    fee_min: 0,
    fee_max: 0,
    fee_on_application: true,
    available: true,
    location: "Washington DC, US · travels internationally",
    topics: ["Business", "Futurist & AI", "Keynote"],
    showreel_url: null,
    testimonials: [
      {
        quote: "The most candid hour our board has had this year.",
        author_name: "Marion Deel",
        author_role: "Board Chair",
        company: "Arden Capital",
      },
    ],
    past_clients: ["Arden Capital", "BlackRock", "Chatham House"],
  },
];

export function getSpeaker(slug: string) {
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

export function speakersByTopic(topicName: string) {
  return speakers.filter((s) => s.topics.includes(topicName));
}

/**
 * All full profiles, with the named slugs first in the order given and everyone
 * else after, keeping their existing relative order.
 *
 * Display order is expressed at the call site rather than by reordering the
 * `speakers` array, because that array also drives the sitemap, the enquiry
 * form's dropdown, and the "similar speakers" rail — which is
 * `speakers.filter(...).slice(0, 6)`, so reordering it would quietly change who
 * shows as similar on every profile.
 *
 * Throws on an unknown or repeated slug: both would otherwise show up as a card
 * silently missing or appearing twice, which nobody notices until a speaker asks
 * why they are not on the page.
 */
export function pinnedFirst(slugs: readonly string[]): Speaker[] {
  const seen = new Set<string>();
  const pinned = slugs.map((slug) => {
    if (seen.has(slug)) throw new Error(`pinnedFirst lists "${slug}" twice`);
    seen.add(slug);
    const speaker = getSpeaker(slug);
    if (!speaker) throw new Error(`pinnedFirst names an unknown speaker slug: "${slug}"`);
    return speaker;
  });
  return [...pinned, ...speakers.filter((s) => !seen.has(s.slug))];
}
