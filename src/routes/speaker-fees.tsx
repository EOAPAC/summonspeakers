import { createFileRoute } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ClosingCta } from "@/components/ClosingCta";
import { feeTiers, feeColumns } from "@/data/fees";

const faqs = [
  {
    q: "What drives a speaker's fee?",
    a: "Four things: how well known they are outside their industry, how much preparation the session needs, the length of the engagement, and the date. A half-day workshop costs more than a 45-minute keynote. A speaker with a book and a television profile costs more than an equally good practitioner without one.",
  },
  {
    q: "Are travel costs included in the fee?",
    a: "No. Travel and accommodation are quoted separately at cost, and we show them before you commit. For international travel, budget economy or business airfares plus two nights depending on time zone.",
  },
  {
    q: "How do your prices compare to a speaker bureau?",
    a: "A traditional bureau adds 20 to 30 per cent on top of the speaker's fee, and usually will not tell you the fee until you have had a sales call. We publish the band and take no markup, so the number you see is the number you budget.",
  },
  {
    q: "Do virtual sessions cost less?",
    a: "Usually. Most speakers price a virtual keynote at roughly half to two-thirds of their in-person band, because there is no travel and less time away.",
  },
];

const tiers = feeTiers;
const cols = feeColumns;


export const Route = createFileRoute("/speaker-fees")({
  head: () => ({
    meta: [
      { title: "How much does a keynote speaker cost? | SummonSpeakers" },
      {
        name: "description",
        content:
          "Keynote speaker fees by tier and topic, published in plain numbers. Emerging speakers from $3k, established from $9k, celebrity names from $35k. No fee on application.",
      },
      { property: "og:title", content: "How much does a keynote speaker cost?" },
      {
        property: "og:description",
        content: "A published fee guide by speaker tier and topic. No sales call required.",
      },
      { property: "og:url", content: "/speaker-fees" },
    ],
    links: [{ rel: "canonical", href: "/speaker-fees" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "Speaker fees", item: "/speaker-fees" },
          ]),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) },
    ],
  }),
  component: SpeakerFees,
});

function SpeakerFees() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Speaker fees" }]} />
      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[18ch] text-[length:var(--display-lg)]">
          How much does a keynote speaker cost?
        </h1>
        <div className="mt-10 max-w-[64ch] space-y-6 text-lg text-[var(--ink-2)]">
          <p>
            Most professional keynote speakers charge between $3,000 and $120,000. The range is
            wide because it covers a local practitioner speaking for 45 minutes and a broadcast
            name headlining a 3,000-seat conference.
          </p>
          <p>
            Most agencies will not publish these numbers. They ask you to call, quote a fee with
            20 to 30 per cent added, and keep the speaker's real rate to themselves. We publish
            the bands instead, so you can plan a budget before you speak to anyone.
          </p>
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>Fee guide by tier and topic</Eyebrow>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              Typical keynote speaker fee ranges by speaker tier and topic
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="label-mono py-4 pr-6 text-[var(--ink-3)]">
                  Tier
                </th>
                {cols.map((c) => (
                  <th key={c} scope="col" className="label-mono py-4 pr-6 text-[var(--ink-3)]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map((row) => (
                <tr key={row.tier} className="border-b border-[var(--line)]">
                  <th scope="row" className="py-6 pr-6 text-lg font-semibold">
                    {row.tier}
                  </th>
                  {row.cells.map((c, i) => (
                    <td key={i} className="py-6 pr-6 font-mono text-base">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 max-w-[60ch] text-sm text-[var(--ink-2)]">
          Ranges are for a single in-person keynote of up to 60 minutes, excluding travel and
          accommodation. Emerging speakers are strong practitioners early in their speaking
          career. Established speakers have a book, a track record or a research base. Celebrity
          speakers are known outside their industry.
        </p>
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
