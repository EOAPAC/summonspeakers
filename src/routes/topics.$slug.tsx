import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SpeakerDirectory } from "@/components/SpeakerDirectory";
import { RosterRows } from "@/components/RosterRows";
import { ClosingCta } from "@/components/ClosingCta";
import { ButtonLink } from "@/components/Button";
import {
  getTopic,
  speakersByTopic,
  topicPhrase,
  topicPhraseSingular,
  type TopicDef,
} from "@/data/speakers";
import { feeAnswerForTopic } from "@/data/fees";
import type { RosterPage } from "@/data/roster";
import { fetchRoster } from "@/lib/roster.server";
import { fetchSpeakers } from "@/lib/speakers.server";
import { SITE_URL, absoluteUrl, ogImageMeta, pageTitle, jsonLd } from "@/lib/site";

/** Roster speakers shown inline. The rest are one click away on /speakers. */
const PREVIEW_SIZE = 24;

/**
 * Every answer is grounded in data on the page — the roster count, the real
 * state breakdown, the published bands — so nothing here is a claim we cannot
 * substantiate from src/data.
 */
function faqsFor(name: string, roster: RosterPage | null) {
  const feeAnswer = feeAnswerForTopic(name);
  const phrase = topicPhrase(name);
  const singular = topicPhraseSingular(name);
  const top = roster?.places.slice(0, 3) ?? [];

  return [
    ...(feeAnswer ? [{ q: `How much do ${phrase} cost?`, a: feeAnswer }] : []),
    {
      q: `How do I book a ${singular}?`,
      a: `Send an enquiry with your date, audience size and theme. We confirm availability and the exact fee within one business day, then you book directly through us. There are no hidden fees, and cancellation is free up to 14 days before your event.`,
    },
    ...(roster && roster.total > 0
      ? [
          {
            q: `How many ${phrase} are on SummonSpeakers?`,
            a: `${roster.total.toLocaleString("en-AU")} ${phrase} are listed. You can filter them by location and gender on the roster, and every speaker with a full profile publishes a fee band rather than quoting on application.`,
          },
        ]
      : []),
    ...(top.length
      ? [
          {
            q: `Where are your ${phrase} based?`,
            a: `Most are in ${top.map((t) => `${t.name} (${t.count})`).join(", ")}. Travel and accommodation outside a speaker's home city are quoted separately at cost, so booking locally is usually the cheaper option.`,
          },
        ]
      : []),
    {
      q: `Can ${phrase} present virtually?`,
      a: `Many can. A virtual keynote is usually priced at roughly half to two-thirds of the same speaker's in-person band, because there is no travel and less time away. Say in your enquiry that the session is virtual and we will confirm who is set up for it.`,
    },
    {
      q: `How quickly will I get a shortlist?`,
      a: `Within one business day. The shortlist names specific ${phrase}, states each fee, and says plainly when someone sits outside your budget rather than letting you find out later.`,
    },
  ];
}

/**
 * Where "see all" sends the visitor: the roster search, pre-filtered.
 *
 * A single category is passed directly so the URL stays readable. Topics
 * spanning several categories go via `topic`, which /speakers expands into the
 * same mapping used here — otherwise the destination would show fewer speakers
 * than the link promised.
 */
function rosterSearchFor(topic: TopicDef): {
  category?: string;
  gender?: "female" | "male";
  place?: string;
  topic?: string;
} {
  if (topic.roster?.gender) return { gender: topic.roster.gender };
  if (topic.roster?.place) return { place: topic.roster.place };
  const categories = topic.roster?.categories ?? [];
  if (categories.length === 1) return { category: categories[0]! };
  return categories.length > 1 ? { topic: topic.slug } : {};
}

export const Route = createFileRoute("/topics/$slug")({
  loader: async ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();

    // Topics with no honest roster mapping (see TopicDef) show profiles only.
    const roster = topic.roster
      ? await fetchRoster({
          data: {
            categories: topic.roster.categories ?? [],
            gender: topic.roster.gender ?? "any",
            place: topic.roster.place ?? "",
            q: "",
            page: 1,
            pageSize: PREVIEW_SIZE,
          },
        })
      : null;

    const allSpeakers = await fetchSpeakers();
    return { topic, speakers: speakersByTopic(topic.name, allSpeakers), roster };
  },

  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Topic unavailable | SummonSpeakers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const t = loaderData.topic;
    const total = loaderData.roster?.total ?? 0;
    const description = total
      ? `${total.toLocaleString("en-AU")} ${topicPhrase(t.name)}, with fee bands published on every full profile. Compare, shortlist and enquire directly, with fees shown upfront.`
      : `${t.heading} with fees shown upfront. Compare fee bands, topics and availability, then book directly with the fee shown before you enquire.`;
    return {
      meta: [
        {
          title: pageTitle(
            `${t.heading}: Fees Shown Upfront`,
            `${t.heading}: Published Fees`,
            t.heading,
          ),
        },
        { name: "description", content: description },
        { property: "og:title", content: `${t.heading} | SummonSpeakers` },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(`/topics/${params.slug}`) },
        // Each category has its own pre-rendered card naming the category.
        ...ogImageMeta(`topic-${params.slug}`),
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/topics/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Topics", item: "/speakers" },
              { name: t.heading, item: `/topics/${t.slug}` },
            ]),
          ),
        },
        {
          type: "application/ld+json",
          children: jsonLd(faqJsonLd(faqsFor(t.name, loaderData.roster))),
        },
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t.heading,
            description,
            url: absoluteUrl(`/topics/${params.slug}`),
            isPartOf: { "@type": "WebSite", name: "SummonSpeakers", url: SITE_URL },
            ...(total
              ? {
                  mainEntity: {
                    "@type": "ItemList",
                    name: t.heading,
                    numberOfItems: total,
                    itemListElement: (loaderData.roster?.rows ?? []).slice(0, 24).map((r, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      item: { "@type": "Person", name: r.name, knowsAbout: r.categories },
                    })),
                  },
                }
              : {}),
          }),
        },
      ],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic, speakers, roster } = Route.useLoaderData();
  const phrase = topicPhrase(topic.name);
  const remaining = roster ? roster.total - roster.rows.length : 0;

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Speakers", to: "/speakers" },
          { label: topic.heading },
        ]}
      />
      <section className="container-x pb-12 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">{topic.heading}</h1>
        <p className="mt-8 max-w-[64ch] text-lg text-[var(--ink-2)]">{topic.blurb}</p>
        {roster && roster.total > 0 && (
          <dl className="mt-10 grid gap-8 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
            <div>
              <dt className="label-mono text-[var(--ink-3)]">On the roster</dt>
              <dd className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {roster.total.toLocaleString("en-AU")}
              </dd>
            </div>
            {/* Omitted rather than shown as a zero on the imported categories,
                none of which has a full profile yet. */}
            {speakers.length > 0 && (
              <div>
                <dt className="label-mono text-[var(--ink-3)]">Fees published</dt>
                <dd className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  {speakers.length}
                </dd>
              </div>
            )}
            {roster.places[0] && (
              <div>
                <dt className="label-mono text-[var(--ink-3)]">Most based in</dt>
                <dd className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  {roster.places[0].name} ({roster.places[0].count})
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="container-x pb-8">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--line)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[48ch] text-[var(--ink-2)]">
            Tell us about your event and we'll send a shortlist of {phrase} within one business day.
            Free to enquire, no obligation.
          </p>
          <ButtonLink to="/get-matched">Get matched</ButtonLink>
        </div>
      </section>

      {/* The 28 imported-category pages have no full profiles yet, and an empty
          "0 speakers, widen your filters" block on each of them reads as broken. */}
      {speakers.length > 0 && (
        <section className="container-x pb-24">
          <Eyebrow>Fees published</Eyebrow>
          <div className="mt-10">
            <SpeakerDirectory speakers={speakers} lockedTopic={topic.name} />
          </div>
        </section>
      )}

      {roster && roster.rows.length > 0 && (
        <section className="rule-open container-x section-y">
          <Eyebrow>{speakers.length > 0 ? "Also on the roster" : "On the roster"}</Eyebrow>
          <h2 className="display mt-6 text-[length:var(--display-md)]">
            {speakers.length > 0 ? `More ${phrase}` : `Browse all ${phrase}`}
          </h2>
          <p className="mt-8 max-w-[58ch] text-[var(--ink-2)]">
            {speakers.length > 0
              ? "These speakers are on our roster without a published fee band yet. Send an enquiry and we confirm the exact fee within one business day."
              : "Every speaker below is on our roster. None publishes a fee band yet, so send an enquiry and we confirm the exact fee within one business day."}
          </p>
          <div className="mt-10">
            <RosterRows rows={roster.rows} />
          </div>
          {remaining > 0 && (
            <div className="mt-10">
              <Link
                to="/speakers"
                search={rosterSearchFor(topic)}
                className="inline-flex min-h-[56px] items-center gap-3 rounded-full border border-[var(--line-2)] px-6 text-base transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
              >
                See all {roster.total.toLocaleString("en-AU")} {phrase}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </section>
      )}

      {!roster && (
        <section className="rule-open container-x section-y">
          <Eyebrow>The full roster</Eyebrow>
          <h2 className="display mt-6 text-[length:var(--display-md)]">Search every speaker</h2>
          <p className="mt-8 max-w-[58ch] text-[var(--ink-2)]">
            Nearly everyone on our roster gives keynotes, so rather than list all of them here,
            search by category, location and gender.
          </p>
          <div className="mt-10">
            <Link
              to="/speakers"
              className="inline-flex min-h-[56px] items-center gap-3 rounded-full border border-[var(--line-2)] px-6 text-base transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
            >
              Search the full roster <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      <section className="container-x pb-24">
        <FAQ items={faqsFor(topic.name, roster)} />
      </section>

      <ClosingCta />
    </Page>
  );
}
