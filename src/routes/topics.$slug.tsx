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
import { fetchRoster } from "@/lib/roster.server";
import { absoluteUrl } from "@/lib/site";

/** Roster speakers shown inline. The rest are one click away on /speakers. */
const PREVIEW_SIZE = 24;

function faqsFor(name: string) {
  const feeAnswer = feeAnswerForTopic(name);
  return [
    ...(feeAnswer ? [{ q: `How much do ${topicPhrase(name)} cost?`, a: feeAnswer }] : []),
    {
      q: `How do I book a ${topicPhraseSingular(name)}?`,
      a: `Send an enquiry with your date, audience size and theme. We confirm availability and the exact fee within one business day, then you book directly through us. There is no bureau markup, and cancellation is free up to 14 days before your event.`,
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
  topic?: string;
} {
  if (topic.roster?.gender) return { gender: topic.roster.gender };
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
            state: "",
            q: "",
            page: 1,
            pageSize: PREVIEW_SIZE,
          },
        })
      : null;

    return { topic, speakers: speakersByTopic(topic.name), roster };
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
      ? `${total.toLocaleString("en-AU")} ${topicPhrase(t.name)}, with fee bands published on every full profile. Compare, shortlist and enquire directly with no bureau markup.`
      : `${t.heading} with fees shown upfront. Compare fee bands, topics and availability, then book directly with no bureau markup.`;
    return {
      meta: [
        { title: `${t.heading} — fees shown upfront | SummonSpeakers` },
        { name: "description", content: description },
        { property: "og:title", content: `${t.heading} | SummonSpeakers` },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(`/topics/${params.slug}`) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/topics/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Topics", item: "/speakers" },
              { name: t.heading, item: `/topics/${t.slug}` },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqsFor(t.name))) },
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
          <p className="label-mono mt-8 text-[var(--ink-3)]">
            {roster.total.toLocaleString("en-AU")} {phrase.toUpperCase()} · {speakers.length} WITH
            PUBLISHED FEES
          </p>
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

      <section className="container-x pb-24">
        <Eyebrow>Fees published</Eyebrow>
        <div className="mt-10">
          <SpeakerDirectory speakers={speakers} lockedTopic={topic.name} />
        </div>
      </section>

      {roster && roster.rows.length > 0 && (
        <section className="rule-open container-x section-y">
          <Eyebrow>Also on the roster</Eyebrow>
          <h2 className="display mt-6 text-[length:var(--display-md)]">More {phrase}</h2>
          <p className="mt-8 max-w-[58ch] text-[var(--ink-2)]">
            These speakers are on our roster without a published fee band yet. Send an enquiry and
            we confirm the exact fee within one business day.
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
        <FAQ items={faqsFor(topic.name)} />
      </section>

      <ClosingCta />
    </Page>
  );
}
