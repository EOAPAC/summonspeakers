import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ClosingCta } from "@/components/ClosingCta";
import { posts } from "@/data/editorial";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The journal — speaker fees, briefing and event planning | SummonSpeakers" },
      {
        name: "description",
        content:
          "Cost guides, briefing notes and planning advice from the team that sees what speakers actually charge.",
      },
      { property: "og:title", content: "The journal | SummonSpeakers" },
      {
        property: "og:description",
        content: "Notes on booking speakers well, from the people who publish the fees.",
      },
      { property: "og:url", content: absoluteUrl("/blog") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "Journal", item: "/blog" },
          ]),
        ),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const lead = posts.find((p) => p.featured) ?? posts[0]!;
  const rest = posts.filter((p) => p.slug !== lead.slug);

  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Journal" }]} />

      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[14ch] text-[length:var(--display-lg)]">The journal</h1>
        <p className="mt-8 max-w-[58ch] text-lg text-[var(--ink-2)]">
          Cost guides, briefing notes and planning advice for the people who book the room, written
          by the team that sees what speakers actually charge.
        </p>
      </section>

      <section className="rule-open container-x pt-10">
        <Link to="/blog/$slug" params={{ slug: lead.slug }} className="group block py-10">
          <Eyebrow>Featured · {lead.category}</Eyebrow>
          <h2 className="mt-6 max-w-[20ch] text-[length:var(--display-sm)] font-semibold tracking-[-0.03em] transition-opacity duration-500 [transition-timing-function:var(--ease)] group-hover:opacity-60">
            {lead.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg text-[var(--ink-2)]">{lead.dek}</p>
          <p className="label-mono mt-6 text-[var(--ink-3)]">
            {lead.date} · {lead.read_minutes} min read
          </p>
        </Link>
      </section>

      <section className="container-x pb-24">
        <ul className="border-t border-[var(--ink)]">
          {rest.map((p) => (
            <li key={p.slug} className="border-b border-[var(--line)]">
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group grid gap-3 py-8 transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface md:grid-cols-[1fr_1.2fr_auto] md:items-baseline md:gap-12 md:px-4"
              >
                <h2 className="text-xl font-semibold tracking-[-0.03em]">{p.title}</h2>
                <p className="text-[var(--ink-2)] group-hover:text-[rgba(255,255,255,0.72)]">
                  {p.dek}
                </p>
                <span className="label-mono whitespace-nowrap text-[var(--ink-3)] group-hover:text-[rgba(255,255,255,0.72)]">
                  {p.read_minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ClosingCta />
    </Page>
  );
}
