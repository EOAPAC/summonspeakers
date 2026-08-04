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
  testimonials: { quote: string; author_name: string; author_role: string; company: string; result?: string }[];
  past_clients: string[];
};

export type TopicDef = {
  slug: string;
  name: string;
  heading: string;
  blurb: string;
  kind: "topic" | "audience" | "event" | "location";
};

export const topics: TopicDef[] = [
  {
    slug: "leadership",
    name: "Leadership",
    heading: "Leadership Speakers",
    blurb:
      "Leadership speakers help executive teams and emerging managers lead through change with clarity. Every fee below is published upfront, so you can shortlist within your budget before you make contact.",
    kind: "topic",
  },
  {
    slug: "motivational",
    name: "Motivational",
    heading: "Motivational Speakers",
    blurb:
      "Motivational speakers open and close conferences with a story that people repeat afterwards. Browse fees, availability and topics, then enquire directly — there is no bureau in the middle.",
    kind: "topic",
  },
  {
    slug: "business",
    name: "Business",
    heading: "Business Speakers",
    blurb:
      "Business speakers cover strategy, growth, customer experience and operating models. Fees are shown as bands so you know the cost before the conversation starts.",
    kind: "topic",
  },
  {
    slug: "futurist-ai",
    name: "Futurist & AI",
    heading: "Futurist & AI Speakers",
    blurb:
      "Futurist and AI speakers explain what is actually changing, and what your teams should do about it next quarter. Compare fees and formats side by side.",
    kind: "topic",
  },
  {
    slug: "resilience",
    name: "Resilience",
    heading: "Resilience Speakers",
    blurb:
      "Resilience speakers work with teams carrying a heavy quarter, a restructure or a long delivery. Fees are published on every profile, so you can shortlist before you make contact.",
    kind: "topic",
  },
  {
    slug: "keynote",
    name: "Keynote",
    heading: "Keynote Speakers",
    blurb:
      "Keynote speakers to open your conference, with fees published upfront. Shortlist by topic, fee band and location, then book directly.",
    kind: "topic",
  },
  {
    slug: "female-speakers",
    name: "Female speakers",
    heading: "Female Speakers",
    blurb:
      "Female keynote speakers across leadership, resilience, business and technology. Every profile lists a fee band and current availability.",
    kind: "topic",
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
    bio_short:
      "An economist who explains long-term shifts in language a sales team can act on.",
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
    bio_short:
      "A household-name broadcaster who hosts and headlines large corporate events.",
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
    bio_short:
      "A revenue leader who talks about pipeline discipline rather than motivation.",
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

export function getTopic(slug: string) {
  return topics.find((t) => t.slug === slug);
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
