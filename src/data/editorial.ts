export type PostBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  category: "Speaker fees" | "Choosing speakers" | "Event planning" | "The speaking business";
  date: string;
  iso: string;
  read_minutes: number;
  featured?: boolean;
  body: PostBlock[];
};

export type CaseStudy = {
  slug: string;
  client: string;
  event: string;
  headline: string;
  summary: string;
  speaker_slug: string;
  result: { value: string; label: string };
  metrics: { value: string; label: string }[];
  narrative: { h: string; p: string }[];
};

export const posts: Post[] = [
  {
    slug: "what-a-keynote-speaker-costs",
    title: "What a keynote speaker actually costs",
    dek: "Real ranges by tier, what moves the number, and why most of the industry will not tell you until you are on a call.",
    category: "Speaker fees",
    date: "May 2026",
    iso: "2026-05-18",
    read_minutes: 9,
    featured: true,
    body: [
      {
        kind: "p",
        text: "The honest answer is a range, not a number, and the range is wider than most planners expect. Somewhere between $3,000 and $150,000, depending almost entirely on who the speaker is rather than what they talk about.",
      },
      {
        kind: "p",
        text: "That vagueness is not an accident. Most of the industry treats fees as something you discuss on a call, which conveniently makes it hard to compare two speakers without an intermediary who has an interest in the number staying opaque. So let us do the unusual thing and write it down.",
      },
      { kind: "h2", text: "Where the money goes" },
      {
        kind: "p",
        text: "A traditional bureau adds 20 to 30 per cent to a speaker's fee. That margin buys real things: a curated shortlist, contracting, and someone to call when a flight is cancelled. It is not a scam, and for a complex multi-speaker conference it can be worth every cent.",
      },
      {
        kind: "p",
        text: "What it should not buy is the inability to find out what anything costs until you have spent twenty minutes on the phone. The markup and the opacity are related. A fee you cannot see is a fee you cannot benchmark.",
      },
      {
        kind: "quote",
        text: "A fee you cannot see is a fee you cannot benchmark. That is the business model, stated plainly.",
      },
      { kind: "h2", text: "The three tiers" },
      {
        kind: "p",
        text: "Emerging speakers, roughly $3,000 to $8,000, are building a name. They are often the best value in the market: hungry, over-prepared, and willing to tailor closely to your brief. The risk is a thinner track record, which a showreel and two reference calls will usually settle.",
      },
      {
        kind: "p",
        text: "Established speakers, $8,000 to $25,000, are the reliable core of most corporate events. A book, a decade of stage time, and material tested in front of rooms like yours. This is where most conference budgets should sit.",
      },
      {
        kind: "p",
        text: "Household names start near $30,000 and run past $150,000. You are buying recognition and the ticket sales that come with it, not necessarily better content. That is a legitimate reason to book someone, as long as you are clear with yourself that it is the reason.",
      },
      { kind: "h2", text: "What actually moves the number" },
      {
        kind: "list",
        items: [
          "Profile and track record, by a wide margin. A bestselling book or genuine name recognition moves the fee more than anything else.",
          "Travel and time zones. Domestic is usually modest; international can add meaningfully once travel days are counted.",
          "Format and length. A 45-minute keynote, a half-day workshop and an MC role are priced differently.",
          "How close to the date you are booking. Peak season and short notice both push fees up.",
        ],
      },
      {
        kind: "p",
        text: "What does not move it much: your organisation's size, your sector, or how nicely you ask. Speakers price on their own market position, not on yours.",
      },
      { kind: "h2", text: "A practical way to budget" },
      {
        kind: "p",
        text: "Start from the outcome you want, not the name you have heard of. Write down what the room should be different about on Monday morning, then work out which tier reliably delivers that. For most internal leadership events an established speaker at $12,000 to $18,000 will beat a celebrity at $60,000, because the content is tailored and the speaker will actually take your briefing call.",
      },
      {
        kind: "p",
        text: "Then compare openly. Every profile here publishes a real range, so you can shortlist three speakers across two tiers and see the trade-off in front of you before you talk to anybody.",
      },
    ],
  },
  {
    slug: "how-to-brief-a-speaker",
    title: "How to brief a speaker so they actually land",
    dek: "The difference between a good talk and a great one is usually the brief, not the fee. What to send, and what to leave out.",
    category: "Event planning",
    date: "May 2026",
    iso: "2026-05-04",
    read_minutes: 7,
    body: [
      {
        kind: "p",
        text: "Most briefs describe the event. The useful ones describe the room. A speaker can find out the date and the venue from the confirmation email; what they cannot guess is what your audience is quietly worried about.",
      },
      { kind: "h2", text: "Lead with the outcome" },
      {
        kind: "p",
        text: 'Say what you want to be different afterwards. Not the theme, the outcome. "We want managers to stop escalating decisions they are allowed to make" is a brief. "Leadership and resilience" is a category.',
      },
      { kind: "h2", text: "Describe the room honestly" },
      {
        kind: "list",
        items: [
          "Who is in it, and what they do all day.",
          "What they have already been told this year, so the speaker does not repeat it.",
          "What time of day the session runs, and what comes immediately before it.",
          "Anything that would land badly — a restructure, a bad quarter, a departure.",
        ],
      },
      {
        kind: "p",
        text: "That last point matters more than any of the others. A speaker who walks into an unannounced redundancy round and opens with a joke about job security will be remembered for years, and not for the reason you hoped.",
      },
      {
        kind: "quote",
        text: "A speaker can find out the date from the confirmation email. What they cannot guess is what your audience is quietly worried about.",
      },
      { kind: "h2", text: "What to leave out" },
      {
        kind: "p",
        text: "Do not send the deck you want them to give. Do not prescribe the stories. You are hiring judgement built over a decade on stage, and the fastest way to get a mediocre talk is to constrain it into something safe.",
      },
      {
        kind: "p",
        text: "Give the outcome, the room and the constraints, then get out of the way.",
      },
    ],
  },
  {
    slug: "bureau-or-direct",
    title: "Bureau or direct: an honest comparison",
    dek: "Bureaus add real value and a real margin. Here is where the money goes, and when paying it is the right call.",
    category: "The speaking business",
    date: "Apr 2026",
    iso: "2026-04-22",
    read_minutes: 6,
    body: [
      {
        kind: "p",
        text: "We have an obvious interest in this question, so let us be careful with it. There are events where a bureau is the right answer, and pretending otherwise would be the kind of sales talk this platform exists to avoid.",
      },
      { kind: "h2", text: "When a bureau earns its margin" },
      {
        kind: "p",
        text: "Multi-day conferences with eight speakers, competing travel schedules and a single point of contractual accountability. Anything where you need someone to absorb logistical risk on your behalf and you would rather pay than manage it. First-time events where you have no internal reference for what good looks like.",
      },
      { kind: "h2", text: "When it does not" },
      {
        kind: "p",
        text: "A single keynote, a known budget and a clear brief. That is the majority of bookings, and it is the case where a 20 to 30 per cent margin buys you an introduction you could have made yourself in an afternoon.",
      },
      {
        kind: "p",
        text: "The tell is whether you are being helped or gated. A bureau that shortlists thoughtfully and tells you when someone is out of budget is doing work worth paying for. One that will not quote a fee until you are on a call is protecting the margin, not you.",
      },
      { kind: "h2", text: "What we do instead" },
      {
        kind: "p",
        text: "We publish every band before you ever make contact, so there is nothing to find out on a call. You can compare three speakers across two tiers before anyone on our side or theirs has spoken to you. That is the whole reason the numbers live on the page instead of behind one.",
      },
    ],
  },
  {
    slug: "when-a-speaker-cancels",
    title: "What to do when a speaker cancels",
    dek: "It happens. The calm three-step recovery, and the contract terms that decide how bad it gets.",
    category: "Event planning",
    date: "Apr 2026",
    iso: "2026-04-08",
    read_minutes: 5,
    body: [
      {
        kind: "p",
        text: "Illness, bereavement, a cancelled connecting flight. Speakers cancel rarely, but across enough events it will happen to you once, and the outcome depends almost entirely on decisions you made weeks earlier.",
      },
      { kind: "h2", text: "The three steps, in order" },
      {
        kind: "list",
        items: [
          "Confirm it is real and get it in writing, with the reason. Ten minutes of certainty beats an hour of hoping.",
          "Call your replacement before you tell the room. A gap with a name in it is an inconvenience; a gap without one is a crisis.",
          "Tell attendees plainly, early, and without spin. People forgive a substitution. They do not forgive finding out on the day.",
        ],
      },
      { kind: "h2", text: "The terms that matter" },
      {
        kind: "p",
        text: "Before you sign, know three things: what happens to your money, who pays for a replacement at short notice, and how quickly the other side is obliged to tell you. Most disputes come from the third, not the first.",
      },
      {
        kind: "p",
        text: "For bookings made here, we find a replacement of the same calibre at the same fee, or you get a full refund. Free cancellation applies up to 14 days before if you are the one who needs to pull out.",
      },
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "meridian-leadership-summit",
    client: "Meridian",
    event: "1,200-delegate leadership summit",
    headline: "Meridian filled a closing keynote in 48 hours",
    summary:
      "Two days out from their summit, Meridian lost their closing speaker. They needed someone who could hold a tired room at 4pm on day two, and who was genuinely free — not theoretically interested.",
    speaker_slug: "dr-maya-ellison",
    result: { value: "48 hrs", label: "brief to confirmed" },
    metrics: [
      { value: "#1", label: "rated session of the summit" },
      { value: "1,200", label: "delegates" },
      { value: "$0", label: "hidden fees" },
    ],
    narrative: [
      {
        h: "The brief",
        p: "A closing keynote on performing under sustained pressure, for a room that had already sat through two days of programming. The previous speaker had withdrawn with 48 hours' notice and the organisers had been told by two agencies that nothing was possible at that timeline.",
      },
      {
        h: "What we did",
        p: "We checked live availability across the roster rather than asking around, and came back the same afternoon with three speakers who were genuinely free on the date, each with a published fee and a showreel. No discovery call, no gatekeeping.",
      },
      {
        h: "The booking",
        p: "Confirmed directly at the fee shown on the profile, with travel and cancellation terms agreed in writing before anything was signed. Nothing was added in the middle.",
      },
      {
        h: "The outcome",
        p: "The session rated top of the summit. Meridian has since used the same route for two further bookings, and the relationship with the speaker now sits with them rather than with an intermediary.",
      },
    ],
  },
  {
    slug: "northwind-sales-kickoff",
    client: "Northwind",
    event: "Annual sales kickoff, 320 reps",
    headline: "Northwind compared five speakers in an afternoon",
    summary:
      "Their head of events had a fixed budget and a board that wanted evidence the money was well spent. The problem was not finding speakers. It was comparing them without three weeks of phone calls.",
    speaker_slug: "james-okoro",
    result: { value: "1", label: "afternoon to shortlist" },
    metrics: [
      { value: "4.9", label: "average session rating" },
      { value: "320", label: "reps in the room" },
      { value: "5", label: "speakers compared openly" },
    ],
    narrative: [
      {
        h: "The brief",
        p: "A kickoff opener that would set the tone for the year without tipping into motivational cliché. The audience was sceptical, commercially literate and had heard it all before.",
      },
      {
        h: "What we did",
        p: "Because every fee was already published, the shortlist happened before anyone made contact. Five candidates across two tiers, compared on fee, topic fit and reviews in a single sitting, then narrowed to two for briefing calls.",
      },
      {
        h: "The booking",
        p: "Confirmed the same week at the published band. The board got a one-page rationale showing what each option would have cost, which is the part most bookings cannot produce.",
      },
      {
        h: "The outcome",
        p: "Highest-rated kickoff session they have run. The comparison document has since become their standard internal template for event spend.",
      },
    ],
  },
  {
    slug: "galleon-people-offsite",
    client: "Galleon",
    event: "Senior leadership offsite, 45 attendees",
    headline: "Galleon booked a small-room specialist, not a big name",
    summary:
      "A 45-person offsite does not need a stadium speaker, but that is usually what the shortlists come back with. Galleon wanted someone who would be better in a small room than a large one.",
    speaker_slug: "sarah-lindqvist",
    result: { value: "45", label: "in the room, by design" },
    metrics: [
      { value: "1 day", label: "to matched shortlist" },
      { value: "3 hrs", label: "workshop, not a keynote" },
      { value: "100%", label: "would book again" },
    ],
    narrative: [
      {
        h: "The brief",
        p: "A working session rather than a talk, for a leadership team mid-restructure. They needed candour and the ability to handle a difficult question in the room, not a polished set piece.",
      },
      {
        h: "What we did",
        p: "We deliberately filtered away from the recognisable names and toward speakers whose reviews mentioned discussion and workshop formats. Fee was a secondary filter, which is only possible when you can see it from the start.",
      },
      {
        h: "The booking",
        p: "A three-hour facilitated session priced separately from the keynote rate, quoted before commitment rather than added afterwards.",
      },
      {
        h: "The outcome",
        p: "The team asked for a follow-up within a month. Galleon now briefs by format first and name second.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}

export function relatedPosts(slug: string, limit = 3) {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
