import { createFileRoute } from "@tanstack/react-router";
import { Page, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ButtonLink } from "@/components/Button";
import { ClosingCta } from "@/components/ClosingCta";
import { ROSTER_COUNT } from "@/data/roster-facets";
import { speakers } from "@/data/speakers";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

const values = [
  {
    n: "01",
    h: "Publish the number",
    p: "If we know what something costs, we say so. Every profile carries a real range, because a fee you cannot see is a fee you cannot judge.",
  },
  {
    n: "02",
    h: "Answer the objection on the page",
    p: "What it costs, whether they will suit the room, what happens if someone cancels. If you have to ring us to find out, we have failed at the page.",
  },
  {
    n: "03",
    h: "Earn from the booking, not the confusion",
    p: "Speakers pay a flat listing fee. We do not make more money when you understand less, which is the only reason this model works.",
  },
  {
    n: "04",
    h: "Both sides, or neither",
    p: "A marketplace that treats speakers as inventory ends up with bad inventory. Speakers set their own fees and keep their own relationships.",
  },
];

// The speaker count is derived from the roster rather than typed in, so this
// page cannot drift from what the directory actually holds.
const speakerCount = ROSTER_COUNT + speakers.length;

const numbers = [
  { value: speakerCount.toLocaleString("en-AU"), label: "speakers listed" },
  { value: "$0", label: "added to any fee" },
  { value: "1 day", label: "median time to shortlist" },
  { value: "4.9", label: "average event rating" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SummonSpeakers — why we publish every fee" },
      {
        name: "description",
        content:
          "Booking a speaker means committing thousands to a stranger. We publish every fee upfront and take no cut of your booking. Here is why.",
      },
      { property: "og:title", content: "About SummonSpeakers" },
      {
        property: "og:description",
        content: "Trust is the product. Why we publish every speaker fee upfront.",
      },
      { property: "og:url", content: absoluteUrl("/about") },
      ...ogImageMeta("about"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "About", item: "/about" },
          ]),
        ),
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />

      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[14ch] text-[length:var(--display-lg)]">
          Trust is the product
        </h1>
        <p className="mt-8 max-w-[58ch] text-lg text-[var(--ink-2)]">
          Booking a speaker means committing thousands of dollars to a stranger, usually on someone
          else's budget, usually without seeing them work first. Everything we build exists to make
          that decision less frightening.
        </p>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>Why we exist</Eyebrow>
        <p className="mt-8 max-w-[42ch] text-2xl tracking-[-0.02em]">
          The speaking industry runs on withheld information, and it has done for decades.
        </p>
        <div className="mt-8 grid max-w-[62ch] gap-5 text-[var(--ink-2)]">
          <p>
            Ask a bureau what a speaker charges and you will be asked for your budget first. That is
            not rudeness, it is the business model. When the buyer cannot see the fee, the margin in
            the middle is whatever the market will bear, and the 20 to 30 per cent sitting there is
            invisible by design.
          </p>
          <p>
            We started SummonSpeakers on a simple bet: that publishing the number would win more
            business than hiding it. Planners who can compare openly enquire more, not less. And
            speakers who set their own rate, and keep the relationship afterwards, turn out to be
            the ones worth booking.
          </p>
          <p>
            None of this is complicated. It is just unusual in this category, which tells you
            something about the category.
          </p>
        </div>
      </section>

      <section className="on-ink section-y">
        <div className="container-x">
          <p className="label-mono text-[rgba(255,255,255,0.55)]">Where we are so far</p>
          <dl className="mt-12 grid gap-10 border-t border-[var(--line-on-dark)] pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {numbers.map((n) => (
              <div key={n.label}>
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="block text-[length:var(--display-sm)] font-semibold tracking-[-0.03em]">
                    {n.value}
                  </span>
                  <span className="label-mono mt-3 block text-[rgba(255,255,255,0.55)]">
                    {n.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x section-y">
        <Eyebrow>How we decide things</Eyebrow>
        <ol className="mt-10 border-t border-[var(--line)]">
          {values.map((v) => (
            <li
              key={v.n}
              className="grid gap-4 border-b border-[var(--line)] py-10 md:grid-cols-[80px_1fr_1.2fr] md:gap-12"
            >
              <span className="label-mono text-[var(--ink-3)]">{v.n}</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{v.h}</h2>
              <p className="text-[var(--ink-2)]">{v.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-24">
        <div className="rule-open grid gap-0 pt-10 md:grid-cols-2">
          <div className="border-[var(--line)] py-10 md:border-r md:pr-12">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">I am booking a speaker</h2>
            <p className="mt-4 max-w-[40ch] text-[var(--ink-2)]">
              Browse the full roster with fees on every profile, or send one brief and let us
              shortlist for you. Free either way, and no account needed to look.
            </p>
            <div className="mt-8">
              <ButtonLink to="/speakers" variant="ghost">
                Browse speakers
              </ButtonLink>
            </div>
          </div>
          <div className="py-10 md:pl-12">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">I am a speaker</h2>
            <p className="mt-4 max-w-[40ch] text-[var(--ink-2)]">
              List free, set your own fee, keep every other relationship you have. Briefs arrive
              with the date, the audience and the budget attached.
            </p>
            <div className="mt-8">
              <ButtonLink to="/for-speakers" variant="ghost">
                Join the roster
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </Page>
  );
}
