import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ClosingCta } from "@/components/ClosingCta";
import { caseStudies } from "@/data/editorial";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/case-studies/")({
  head: () => ({
    meta: [
      { title: "Case studies — real bookings, real fees | SummonSpeakers" },
      {
        name: "description",
        content:
          "How event teams shortlisted, compared and booked speakers directly, including how long each took from brief to confirmed.",
      },
      { property: "og:title", content: "Case studies | SummonSpeakers" },
      {
        property: "og:description",
        content: "Real briefs, real speakers, real fees, and the time each booking took.",
      },
      { property: "og:url", content: absoluteUrl("/case-studies") },
      ...ogImageMeta("case-studies"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/case-studies") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "Case studies", item: "/case-studies" },
          ]),
        ),
      },
    ],
  }),
  component: CaseStudiesIndex,
});

function CaseStudiesIndex() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Case studies" }]} />

      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[14ch] text-[length:var(--display-lg)]">
          Rooms we helped fill
        </h1>
        <p className="mt-8 max-w-[58ch] text-lg text-[var(--ink-2)]">
          Real briefs, real speakers and real fees, including how long each one took from first
          enquiry to a confirmed contract.
        </p>
      </section>

      <section className="container-x pb-24">
        <ul className="grid gap-12 border-t border-[var(--ink)] pt-12 md:grid-cols-2">
          {caseStudies.map((c) => (
            <li key={c.slug}>
              <Link to="/case-studies/$slug" params={{ slug: c.slug }} className="group block">
                <div className="hatch aspect-[16/10] rounded-[var(--radius-media)]" />
                <div className="mt-6 border-t border-[var(--line)] pt-6">
                  <p className="label-mono text-[var(--ink-3)]">
                    {c.client} · {c.event}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] transition-opacity duration-500 [transition-timing-function:var(--ease)] group-hover:opacity-60">
                    {c.headline}
                  </h2>
                  <p className="mt-4 max-w-[46ch] text-[var(--ink-2)]">{c.summary}</p>
                  <dl className="mt-8 flex flex-wrap gap-10 border-t border-[var(--line)] pt-6">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <dd className="text-xl font-semibold tracking-[-0.03em]">{m.value}</dd>
                        <dt className="label-mono mt-2 text-[var(--ink-3)]">{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ClosingCta />
    </Page>
  );
}
