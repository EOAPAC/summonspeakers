import { createFileRoute, notFound } from "@tanstack/react-router";
import { Page, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ButtonLink } from "@/components/Button";
import { FeeBand } from "@/components/FeeBand";
import { ClosingCta } from "@/components/ClosingCta";
import { getCaseStudy, type CaseStudy } from "@/data/editorial";
import { getSpeaker, type Speaker } from "@/data/speakers";
import { fetchSpeakersBySlugs } from "@/lib/speakers.server";
import { absoluteUrl, ogImageMeta, pageTitle, jsonLd } from "@/lib/site";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: async ({ params }): Promise<{ study: CaseStudy; speaker: Speaker | undefined }> => {
    const study = getCaseStudy(params.slug);
    if (!study) throw notFound();
    const speakers = await fetchSpeakersBySlugs({ data: [study.speaker_slug] });
    return { study, speaker: getSpeaker(study.speaker_slug, speakers) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Case study unavailable | SummonSpeakers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const c = loaderData.study;
    return {
      meta: [
        { title: pageTitle(c.headline, `${c.client} case study`) },
        { name: "description", content: c.summary.slice(0, 158) },
        { property: "og:title", content: c.headline },
        { property: "og:description", content: c.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl(`/case-studies/${params.slug}`) },
        ...ogImageMeta("case-studies"),
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/case-studies/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Case studies", item: "/case-studies" },
              { name: c.client, item: `/case-studies/${c.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: CaseStudyDetail,
});

function CaseStudyDetail() {
  const { study, speaker } = Route.useLoaderData() as { study: CaseStudy; speaker?: Speaker };

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Case studies", to: "/case-studies" },
          { label: study.client },
        ]}
      />

      <section className="container-x pb-12 pt-10">
        <Eyebrow>{study.client}</Eyebrow>
        <h1 className="display mt-6 max-w-[18ch] text-[length:var(--display-md)]">
          {study.headline}
        </h1>
        <p className="mt-8 max-w-[56ch] text-lg text-[var(--ink-2)]">{study.summary}</p>

        <dl className="mt-14 grid gap-10 border-t border-[var(--ink)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dd className="text-[length:var(--display-sm)] font-semibold tracking-[-0.03em]">
              {study.result.value}
            </dd>
            <dt className="label-mono mt-3 text-[var(--ink-3)]">{study.result.label}</dt>
          </div>
          {study.metrics.map((m) => (
            <div key={m.label}>
              <dd className="text-[length:var(--display-sm)] font-semibold tracking-[-0.03em]">
                {m.value}
              </dd>
              <dt className="label-mono mt-3 text-[var(--ink-3)]">{m.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-x pb-16">
        <div className="hatch aspect-[21/9] rounded-[var(--radius-media)]" />
      </section>

      <section className="container-x pb-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-20">
          <div className="max-w-[62ch]">
            {study.narrative.map((n, i) => (
              <div key={n.h} className={i === 0 ? "" : "mt-12"}>
                <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{n.h}</h2>
                <p className="mt-4 text-lg leading-relaxed text-[var(--ink-2)]">{n.p}</p>
              </div>
            ))}
          </div>

          {speaker && (
            <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--ink)] p-7 lg:sticky lg:top-24">
              <Eyebrow>Speaker booked</Eyebrow>
              <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{speaker.name}</h2>
              <p className="mt-2 text-[var(--ink-2)]">{speaker.tagline}</p>
              <div className="mt-6">
                <FeeBand
                  feeMin={speaker.fee_min}
                  feeMax={speaker.fee_max}
                  onApplication={speaker.fee_on_application}
                  available={speaker.available}
                />
              </div>
              <div className="mt-8">
                <ButtonLink
                  to="/speakers/$slug"
                  params={{ slug: speaker.slug }}
                  variant="ghost"
                  className="w-full"
                >
                  View profile
                </ButtonLink>
              </div>
            </aside>
          )}
        </div>
      </section>

      <ClosingCta />
    </Page>
  );
}
