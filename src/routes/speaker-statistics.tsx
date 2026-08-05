import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, Eyebrow, FAQ, faqJsonLd } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ClosingCta } from "@/components/ClosingCta";
import type { RosterStats } from "@/data/roster";
import { fetchRosterStats } from "@/lib/roster.server";
import { absoluteUrl, ogImageMeta, pageTitle, jsonLd } from "@/lib/site";

/**
 * Original data about the directory itself: how many speakers, where they
 * are, what they speak on, and the gender split. Every figure is computed
 * from the live roster at request time, so the page cannot drift out of date
 * — which is exactly what makes it worth citing.
 */

const nf = (n: number) => n.toLocaleString("en-AU");
const pct = (n: number, total: number) => `${((n / total) * 100).toFixed(1)}%`;

function faqsFor(s: RosterStats) {
  return [
    {
      q: "How many keynote speakers are listed on SummonSpeakers?",
      a: `${nf(s.total)} speakers are listed, across ${s.categoryCount} categories and ${s.countryCount} countries. ${nf(s.withFee)} of them (${pct(s.withFee, s.total)}) list a confirmed speaking fee on their row, and every full profile publishes a fee band.`,
    },
    {
      q: "What share of professional speakers are women?",
      a: `On the SummonSpeakers directory, ${pct(s.gender.female, s.total)} of listed speakers are women (${nf(s.gender.female)} of ${nf(s.total)}), ${pct(s.gender.male, s.total)} are men, and ${nf(s.gender.unrecorded)} have no gender recorded in the source data.`,
    },
    {
      q: "Where are most keynote speakers based?",
      a: `${s.countries[0] ? `The ${s.countries[0].name} has the deepest bench with ${nf(s.countries[0].count)} listed speakers` : "The UK and US lead"}${s.countries[1] ? `, followed by ${s.countries[1].name} (${nf(s.countries[1].count)})` : ""}${s.countries[2] ? ` and ${s.countries[2].name} (${nf(s.countries[2].count)})` : ""}. Booking a speaker based near your venue keeps travel costs off the invoice.`,
    },
    {
      q: "What are the most common speaking topics?",
      a: `${s.categories[0] ? `${s.categories[0].name} leads with ${nf(s.categories[0].count)} speakers` : "Business and leadership lead"}${s.categories[1] ? `, ahead of ${s.categories[1].name} (${nf(s.categories[1].count)})` : ""}${s.categories[2] ? ` and ${s.categories[2].name} (${nf(s.categories[2].count)})` : ""}. A speaker can appear in several categories, so the counts overlap.`,
    },
  ];
}

export const Route = createFileRoute("/speaker-statistics")({
  loader: async () => ({ stats: await fetchRosterStats() }),
  head: ({ loaderData }) => {
    const total = loaderData ? nf(loaderData.stats.total) : "6,000+";
    const description = `Statistics from the SummonSpeakers directory: ${total} keynote speakers by country, category and gender. Original data, updated with every import.`;
    return {
      meta: [
        { title: pageTitle("Keynote Speaker Statistics", "Speaker Directory Data") },
        { name: "description", content: description },
        { property: "og:title", content: "Keynote Speaker Statistics | SummonSpeakers" },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl("/speaker-statistics") },
        ...ogImageMeta("speakers"),
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/speaker-statistics") }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Speaker statistics", item: "/speaker-statistics" },
            ]),
          ),
        },
        ...(loaderData
          ? [
              {
                type: "application/ld+json",
                children: jsonLd({
                  "@context": "https://schema.org",
                  "@type": "Dataset",
                  name: "SummonSpeakers keynote speaker directory statistics",
                  description,
                  url: absoluteUrl("/speaker-statistics"),
                  creator: { "@id": `${absoluteUrl("/")}#organization` },
                  license: absoluteUrl("/speaker-statistics"),
                  variableMeasured: ["speakers by country", "speakers by category", "gender split"],
                }),
              },
              {
                type: "application/ld+json",
                children: jsonLd(faqJsonLd(faqsFor(loaderData.stats))),
              },
            ]
          : []),
      ],
    };
  },
  component: SpeakerStatistics,
});

function StatTable({ rows, total }: { rows: { name: string; count: number }[]; total: number }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--ink)]">
          <th className="label-mono py-3 font-normal text-[var(--ink-3)]">Where</th>
          <th className="label-mono py-3 text-right font-normal text-[var(--ink-3)]">Speakers</th>
          <th className="label-mono hidden py-3 text-right font-normal text-[var(--ink-3)] sm:table-cell">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-b border-[var(--line)]">
            <td className="py-3">{r.name}</td>
            <td className="py-3 text-right tabular-nums">{nf(r.count)}</td>
            <td className="hidden py-3 text-right tabular-nums text-[var(--ink-2)] sm:table-cell">
              {pct(r.count, total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SpeakerStatistics() {
  const { stats: s } = Route.useLoaderData();
  const faqs = faqsFor(s);

  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Speaker statistics" }]} />

      <section className="container-x pb-16 pt-10">
        <Eyebrow>Directory data</Eyebrow>
        <h1 className="display mt-6 max-w-[18ch] text-[length:var(--display-lg)]">
          Keynote speaker statistics
        </h1>
        <p className="mt-8 max-w-[62ch] text-lg text-[var(--ink-2)]">
          The SummonSpeakers directory lists {nf(s.total)} professional speakers. This page reports
          what that data says: where speakers are based, what they speak on, and the gender split.
          Every figure is computed from the live directory, so it updates whenever the roster does.
          Cite it freely.
        </p>

        <dl className="mt-14 grid gap-10 border-t border-[var(--ink)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: nf(s.total), label: "speakers listed" },
            { value: nf(s.countryCount), label: "countries" },
            { value: pct(s.gender.female, s.total), label: "women" },
            { value: pct(s.withFee, s.total), label: "list a fee upfront" },
          ].map((m) => (
            <div key={m.label}>
              <dd className="text-[length:var(--display-sm)] font-semibold tracking-[-0.03em]">
                {m.value}
              </dd>
              <dt className="label-mono mt-3 text-[var(--ink-3)]">{m.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-md)]">Where speakers are based</h2>
        <p className="mt-6 max-w-[62ch] text-[var(--ink-2)]">
          A speaker can list more than one base, so the shares can sum past 100 per cent. Regional
          totals count each speaker once per region.
        </p>
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="label-mono mb-4 text-[var(--ink-3)]">By region</h3>
            <StatTable rows={s.regions} total={s.total} />
          </div>
          <div>
            <h3 className="label-mono mb-4 text-[var(--ink-3)]">Top countries</h3>
            <StatTable rows={s.countries.slice(0, 10)} total={s.total} />
          </div>
        </div>
        <p className="mt-8 text-sm text-[var(--ink-2)]">
          Browse by location:{" "}
          {(
            [
              ["uk-speakers", "UK"],
              ["us-speakers", "US"],
              ["london-speakers", "London"],
              ["australia-speakers", "Australia"],
              ["europe-speakers", "Europe"],
              ["asia-speakers", "Asia"],
            ] as const
          ).map(([slug, label], i) => (
            <span key={slug}>
              {i > 0 && " · "}
              <Link
                to="/topics/$slug"
                params={{ slug }}
                className="underline underline-offset-4 hover:text-ink"
              >
                {label}
              </Link>
            </span>
          ))}
        </p>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-md)]">What they speak on</h2>
        <p className="mt-6 max-w-[62ch] text-[var(--ink-2)]">
          The ten largest of the directory&rsquo;s {s.categoryCount} categories. Speakers usually
          carry several categories, so these overlap.
        </p>
        <div className="mt-10 max-w-2xl">
          <StatTable rows={s.categories.slice(0, 10)} total={s.total} />
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-md)]">Gender split</h2>
        <p className="mt-6 max-w-[62ch] text-[var(--ink-2)]">
          {nf(s.gender.female)} listed speakers are women ({pct(s.gender.female, s.total)}),{" "}
          {nf(s.gender.male)} are men ({pct(s.gender.male, s.total)}), and {s.gender.nonbinary} are
          non-binary. {nf(s.gender.unrecorded)} speakers have no gender recorded in the source data;
          they are excluded from the shares rather than guessed at. Duos billed together count
          toward each member&rsquo;s gender, so the shares can sum past 100 per cent.
        </p>
        <p className="mt-6 text-sm text-[var(--ink-2)]">
          Looking for a balanced line-up? Browse{" "}
          <Link
            to="/topics/$slug"
            params={{ slug: "female-speakers" }}
            className="underline underline-offset-4"
          >
            female speakers
          </Link>{" "}
          with fees shown upfront.
        </p>
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
