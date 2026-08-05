import { createFileRoute } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SpeakerCard } from "@/components/SpeakerCard";
import { RosterDirectory, type RosterSearch } from "@/components/RosterDirectory";
import { ClosingCta } from "@/components/ClosingCta";
import { ButtonLink } from "@/components/Button";
import { getTopic, pinnedFirst } from "@/data/speakers";
import type { RosterGender } from "@/data/roster";
import { fetchRoster } from "@/lib/roster.server";
import { fetchSpeakers } from "@/lib/speakers.server";
import { absoluteUrl, ogImageMeta, pageTitle } from "@/lib/site";

const faqs = [
  {
    q: "How much does a keynote speaker cost?",
    a: "Most professional keynote speakers on SummonSpeakers sit between $7,000 and $30,000. Emerging speakers start lower; broadcast names and former heads of state go well above. Every profile shows a band.",
  },
  {
    q: "How do I book a speaker?",
    a: "Send an enquiry with your date, audience size and topic. We reply within one business day with a shortlist and confirmed fees, then you book directly with the speaker through us.",
  },
  {
    q: "Why do some speakers not show a fee?",
    a: "Speakers with a full profile publish a fee band. The wider roster is searchable by category, location and gender while we confirm each speaker's current rate, so send an enquiry and we come back with the exact figure within one business day.",
  },
];

/** A facet is active — as distinct from any query parameter being present. */
function isFaceted(s: RosterSearch): boolean {
  return Boolean(s.topic || s.category || s.state || s.gender || s.q);
}

/** A facet is active, or we are past the first page. */
function isNarrowed(s: RosterSearch): boolean {
  return isFaceted(s) || (s.page !== undefined && s.page > 1);
}

/** Display order for the full-profile grid. The rest follow in their own order. */
const FULL_PROFILE_ORDER = ["helena-brandt", "robert-ainsley", "andres-molina", "omar-haddad"];

export const Route = createFileRoute("/speakers/")({
  // Defaults are omitted rather than defaulted, so /speakers never redirects to
  // /speakers?category=&state=&gender=any.
  validateSearch: (search: Record<string, unknown>): RosterSearch => {
    const str = (key: string) => (typeof search[key] === "string" ? (search[key] as string) : "");
    const gender = search["gender"];
    const page = Number(search["page"]);
    const out: RosterSearch = {};
    if (str("topic")) out.topic = str("topic");
    if (str("category")) out.category = str("category");
    if (str("state")) out.state = str("state");
    if (gender === "female" || gender === "male") out.gender = gender as RosterGender;
    if (str("q")) out.q = str("q");
    if (Number.isFinite(page) && page > 1) out.page = Math.floor(page);
    return out;
  },

  // Without loaderDeps the loader would not re-run when a filter changes.
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    // `topic` expands to that topic's whole mapping, so a "see all 808" link
    // from a multi-category topic page lands on exactly 808 results.
    //
    // An unrecognised topic falls back to the unfiltered roster, unlike an
    // unrecognised category, which matches nothing. The asymmetry is deliberate:
    // a category can be hand-typed into the URL, so silently ignoring it would
    // mislead, whereas a topic slug only ever comes from our own links, and a
    // stale one should degrade to a usable page rather than an empty one.
    const topic = deps.topic ? getTopic(deps.topic) : undefined;
    const categories = topic?.roster?.categories ?? (deps.category ? [deps.category] : []);
    const gender = topic?.roster?.gender ?? deps.gender ?? "any";
    const speakers = await fetchSpeakers();
    return {
      roster: await fetchRoster({
        data: {
          categories,
          state: deps.state ?? "",
          gender,
          q: deps.q ?? "",
          page: deps.page ?? 1,
        },
      }),
      topicLabel: topic?.name ?? null,
      // An empty array means the backend was unreachable, not that a genuinely
      // pinned slug is missing — pinnedFirst can't tell those apart, and a
      // real outage should render the rest of the page rather than crash it.
      fullProfileOrder: speakers.length > 0 ? pinnedFirst(FULL_PROFILE_ORDER, speakers) : [],
    };
  },

  head: ({ loaderData, match }) => {
    const total = loaderData?.roster.rosterCount ?? 0;
    const s = match.search;

    // Checked field by field rather than with Object.keys, which counted any
    // parameter at all — so a newsletter link to /speakers?utm_source=… was
    // telling Google not to index the main speakers page.
    const faceted = isFaceted(s);

    // Pagination is not a near-duplicate the way a facet is: page 3 lists 60
    // speakers that appear on no other page, and noindexing it would put most
    // of the roster beyond reach. So it stays indexable with its own canonical
    // and its own title, rather than 35 pages all claiming to be page 1.
    const pageNo = s.page && s.page > 1 ? s.page : 0;
    const canonicalPath = faceted || !pageNo ? "/speakers" : `/speakers?page=${pageNo}`;
    const titleLead = pageNo ? `All Speakers, page ${pageNo}` : "All Speakers: fees shown upfront";

    const description = total
      ? `Search ${total.toLocaleString("en-AU")} speakers by category, location and gender. Every full profile publishes a fee band, so you can shortlist on budget.`
      : "Search the SummonSpeakers roster by category, location and gender.";
    return {
      meta: [
        { title: pageTitle(titleLead) },
        {
          name: "description",
          content: pageNo ? `Page ${pageNo} of the roster. ${description}` : description,
        },
        { property: "og:title", content: "All Speakers | SummonSpeakers" },
        {
          property: "og:description",
          content: "Every speaker, every fee band, filterable in seconds.",
        },
        { property: "og:url", content: absoluteUrl(canonicalPath) },
        ...ogImageMeta("speakers"),
        // Faceted views are near-duplicates of the base list; keep them
        // crawlable for discovery but out of the index.
        ...(faceted ? [{ name: "robots", content: "noindex,follow" }] : []),
      ],
      links: [{ rel: "canonical", href: absoluteUrl(canonicalPath) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Speakers", item: "/speakers" },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) },
      ],
    };
  },
  component: SpeakersIndex,
});

function SpeakersIndex() {
  const { roster, topicLabel, fullProfileOrder } = Route.useLoaderData();
  const search = Route.useSearch();
  // Named fields rather than Object.keys, which also counted tracking
  // parameters: arriving on /speakers?utm_source=… hid the featured cards for no
  // reason. Page 2 onwards counts as filtered, since featured cards sitting
  // above a mid-roster page read as part of that page's results.
  const unfiltered = !isNarrowed(search);

  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Speakers" }]} />
      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">All speakers</h1>
        <p className="mt-8 max-w-[60ch] text-lg text-[var(--ink-2)]">
          {roster.rosterCount.toLocaleString("en-AU")} speakers, searchable by category, location
          and gender. Every full profile publishes a fee band, so you can shortlist inside your
          budget before you contact anyone.
        </p>
      </section>

      {/* Hidden once a filter is on: the featured cards are not filtered, so
          leaving them above a filtered roster reads as a broken result set.
          Also hidden, same reasoning as the homepage, if the backend that
          serves them is unreachable rather than the roster genuinely empty. */}
      {unfiltered && fullProfileOrder.length > 0 && (
        <section className="rule-open container-x section-y">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Fees published</Eyebrow>
              <h2 className="display mt-6 text-[length:var(--display-md)]">Full profiles</h2>
            </div>
          </div>
          <p className="mt-8 max-w-[58ch] text-[var(--ink-2)]">
            These speakers publish a fee band, a biography and organiser references. Everyone else
            on the roster is available on enquiry.
          </p>
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {fullProfileOrder.map((s) => (
              <SpeakerCard key={s.slug} speaker={s} />
            ))}
          </div>
        </section>
      )}

      <section className="rule-open container-x section-y">
        <Eyebrow>The full roster</Eyebrow>
        <h2 className="display mt-6 text-[length:var(--display-md)]">Search every speaker</h2>
        <div className="mt-10">
          <RosterDirectory data={roster} search={search} topicLabel={topicLabel ?? undefined} />
        </div>
      </section>

      <section className="container-x pb-8">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--line)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[48ch] text-[var(--ink-2)]">
            Not sure who fits? Tell us about your event and we'll send a shortlist within one
            business day. Free to enquire, no obligation.
          </p>
          <ButtonLink to="/get-matched">Get matched</ButtonLink>
        </div>
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
