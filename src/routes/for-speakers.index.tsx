import { createFileRoute } from "@tanstack/react-router";
import { Page, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ButtonLink } from "@/components/Button";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

const benefits = [
  {
    n: "01",
    h: "A profile that ranks in search",
    p: "Your page is built to be found when a planner searches for your topic, with your fee, your topics and your video on one indexed URL.",
  },
  {
    n: "02",
    h: "Direct enquiries from real planners",
    p: "Enquiries come to you with the date, audience and budget attached. The client relationship stays yours.",
  },
  {
    n: "03",
    h: "Transparent fees that respect your value",
    p: "We publish your band as you set it. Planners arrive already comfortable with the number, so the first conversation is about the brief, not the price.",
  },
];

const steps = [
  {
    n: "01",
    h: "Create your listing",
    p: "Photo, topics, fee band, showreel. About fifteen minutes.",
  },
  {
    n: "02",
    h: "We review it",
    p: "One editor checks the profile reads well and the fee band is clear. Usually two business days.",
  },
  {
    n: "03",
    h: "You start receiving enquiries",
    p: "Matched briefs arrive by email. You decide which to take.",
  },
];

export const Route = createFileRoute("/for-speakers/")({
  head: () => ({
    meta: [
      { title: "Get Booked for Paid Speaking | SummonSpeakers" },
      {
        name: "description",
        content:
          "List with SummonSpeakers: a profile built to rank in search, and direct enquiries from event planners with the budget already attached.",
      },
      { property: "og:title", content: "For speakers | SummonSpeakers" },
      {
        property: "og:description",
        content: "Direct enquiries, published fees, no sales call before you know the number.",
      },
      { property: "og:url", content: absoluteUrl("/for-speakers") },
      ...ogImageMeta("for-speakers"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/for-speakers") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "For speakers", item: "/for-speakers" },
          ]),
        ),
      },
    ],
  }),
  component: ForSpeakers,
});

function ForSpeakers() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "For speakers" }]} />
      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">
          Get booked for more paid speaking engagements.
        </h1>
        <p className="mt-8 max-w-[56ch] text-lg text-[var(--ink-2)]">
          Planners come to SummonSpeakers to compare speakers and fees openly. You keep the
          relationship, the fee and the final say.
        </p>
        <div className="mt-10">
          <ButtonLink to="/for-speakers/join">Join SummonSpeakers</ButtonLink>
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>Why list with us</Eyebrow>
        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.n} className="hairline-top pt-6">
              <p className="label-mono text-[var(--ink-3)]">{b.n}</p>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{b.h}</h2>
              <p className="mt-4 text-[var(--ink-2)]">{b.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>How listing works</Eyebrow>
        <ol className="mt-10 border-t border-[var(--line)]">
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid gap-4 border-b border-[var(--line)] py-8 md:grid-cols-[80px_1fr_1.2fr] md:gap-12"
            >
              <span className="label-mono text-[var(--ink-3)]">{s.n}</span>
              <h3 className="text-xl font-semibold tracking-[-0.03em]">{s.h}</h3>
              <p className="text-[var(--ink-2)]">{s.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-24">
        <figure className="max-w-[62ch]">
          <blockquote className="display text-[length:var(--display-md)] normal-case">
            “Three enquiries in the first month, all with the budget already stated. I have never
            had that from a bureau.”
          </blockquote>
          <figcaption className="mt-8 text-sm text-[var(--ink-2)]">
            <span className="block font-semibold text-ink">Michael Touré</span>
            Leadership & culture keynote speaker
          </figcaption>
        </figure>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-cta)] leading-[var(--leading-cta)]">
          Join SummonSpeakers
        </h2>
        <div className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[44ch] text-lg text-[var(--ink-2)]">
            Create your listing in about fifteen minutes. Review takes two business days.
          </p>
          <ButtonLink to="/for-speakers/join">Join SummonSpeakers</ButtonLink>
        </div>
      </section>
    </Page>
  );
}
