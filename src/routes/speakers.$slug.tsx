import { createFileRoute, notFound } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { FeeBand } from "@/components/FeeBand";
import { Pill } from "@/components/Pill";
import { ButtonLink } from "@/components/Button";
import { SpeakerCard } from "@/components/SpeakerCard";
import { getSpeaker, speakers, type Speaker } from "@/data/speakers";
import { formatFee } from "@/lib/fee";
import { absoluteUrl, pageTitle, ogImageMeta } from "@/lib/site";

function faqsFor(name: string, fee: string) {
  return [
    {
      q: `What is ${name}'s speaking fee?`,
      a: `${name}'s published fee band is ${fee}. The final figure depends on the format, the date and travel. There is no bureau markup added on top.`,
    },
    {
      q: `How do I book ${name}?`,
      a: `Send an enquiry with your date and audience size. We confirm availability and the exact fee within one business day, then you book directly. Free cancellation up to 14 days before your event.`,
    },
  ];
}

export const Route = createFileRoute("/speakers/$slug")({
  loader: ({ params }): { speaker: Speaker } => {
    const speaker = getSpeaker(params.slug);
    if (!speaker) throw notFound();
    return { speaker };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Speaker unavailable | SummonSpeakers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const s = loaderData.speaker;
    const fee = formatFee(s.fee_min, s.fee_max, s.fee_on_application);
    const description =
      `${s.name}, ${s.role.toLowerCase()}. Published speaking fee ${fee}. ${s.tagline}`.slice(
        0,
        158,
      );
    return {
      meta: [
        {
          title: pageTitle(
            `${s.name} — ${s.role} (${fee})`,
            s.fee_on_application ? `${s.name} — Keynote Speaker` : `${s.name} — Fee ${fee}`,
            s.name,
          ),
        },
        { name: "description", content: description },
        { property: "og:title", content: `${s.name} — ${s.role}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: absoluteUrl(`/speakers/${params.slug}`) },
        ...ogImageMeta("speakers"),
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/speakers/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: s.name,
            jobTitle: s.role,
            description: s.bio_short,
            knowsAbout: s.topics,
            url: absoluteUrl(`/speakers/${s.slug}`),
            makesOffer: {
              "@type": "Offer",
              name: `Keynote speaking engagement with ${s.name}`,
              availability: s.available
                ? "https://schema.org/InStock"
                : "https://schema.org/LimitedAvailability",
              ...(s.fee_on_application
                ? {}
                : {
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: s.fee_min,
                      maxPrice: s.fee_max,
                      priceCurrency: "USD",
                    },
                  }),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Speakers", item: "/speakers" },
              { name: s.name, item: `/speakers/${s.slug}` },
            ]),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqJsonLd(faqsFor(s.name, fee))),
        },
      ],
    };
  },
  component: SpeakerProfile,
});

function SpeakerProfile() {
  const { speaker: s } = Route.useLoaderData() as { speaker: Speaker };
  const fee = formatFee(s.fee_min, s.fee_max, s.fee_on_application);
  const similar = speakers
    .filter((o) => o.slug !== s.slug && o.topics.some((t) => s.topics.includes(t)))
    .slice(0, 6);

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Speakers", to: "/speakers" },
          { label: s.name },
        ]}
      />

      <section className="container-x grid gap-12 pb-16 pt-10 md:grid-cols-[1fr_1fr] md:items-start">
        <div className="hatch aspect-[4/5] rounded-[var(--radius-media)]">
          <span className="label-mono block p-6 text-[var(--ink-2)]">{s.name}</span>
        </div>
        <div>
          <h1 className="display text-[length:var(--display-md)]">{s.name}</h1>
          <p className="mt-6 text-xl tracking-[-0.02em] text-[var(--ink-2)]">{s.tagline}</p>
          <p className="label-mono mt-6 text-[var(--ink-3)]">{s.role}</p>
          <div className="mt-8">
            <p className="label-mono mb-3 text-[var(--ink-3)]">Speaking fee</p>
            <FeeBand
              feeMin={s.fee_min}
              feeMax={s.fee_max}
              onApplication={s.fee_on_application}
              available={s.available}
              large
            />
            <p className="mt-3 text-sm text-[var(--ink-2)]">
              {s.available ? "Currently taking bookings." : "Limited availability this season."}{" "}
              {s.location}
            </p>
          </div>
          <div className="mt-10 hidden md:block">
            <ButtonLink to="/get-matched" search={{ speaker: s.slug }}>
              Check availability
            </ButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {s.topics.map((t) => (
              <li key={t}>
                <Pill topic={t} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="label-mono text-[var(--ink-3)]">About {s.name}</h2>
        <div className="mt-8 max-w-[68ch] space-y-6 text-lg text-[var(--ink-2)]">
          {s.bio_long.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {s.showreel_url && (
        <section className="container-x pb-24">
          <h2 className="label-mono text-[var(--ink-3)]">Showreel</h2>
          <div className="mt-6 aspect-video overflow-hidden rounded-[var(--radius-media)] border border-[var(--line)]">
            <iframe
              src={s.showreel_url}
              title={`${s.name} showreel`}
              className="size-full"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="rule-open container-x section-y">
        <h2 className="label-mono text-[var(--ink-3)]">What organisers say</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {s.testimonials.map((t) => (
            <figure
              key={t.author_name}
              className="rounded-[var(--radius-card)] border border-[var(--line)] p-8"
            >
              <blockquote className="text-lg tracking-[-0.02em]">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm text-[var(--ink-2)]">
                <span className="block font-semibold text-ink">{t.author_name}</span>
                {t.author_role}, {t.company}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <h2 className="label-mono text-[var(--ink-3)]">Past clients</h2>
        <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {s.past_clients.map((c) => (
            <li key={c} className="label-mono text-[var(--ink-3)]">
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-md)]">Fee and travel</h2>
        <dl className="mt-10 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-3">
          <div>
            <dt className="label-mono text-[var(--ink-3)]">Fee band</dt>
            <dd className="mt-3 text-lg">{fee}</dd>
          </div>
          <div>
            <dt className="label-mono text-[var(--ink-3)]">Based in</dt>
            <dd className="mt-3 text-lg">{s.location}</dd>
          </div>
          <div>
            <dt className="label-mono text-[var(--ink-3)]">Cancellation</dt>
            <dd className="mt-3 text-lg">Free cancellation up to 14 days before your event.</dd>
          </div>
        </dl>
        <p className="mt-8 max-w-[60ch] text-[var(--ink-2)]">
          Travel and accommodation are quoted separately at cost for events outside{" "}
          {s.location.split(" · ")[0]}. Virtual sessions are usually priced below the band above.
        </p>
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqsFor(s.name, fee)} />
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="display text-[length:var(--display-md)]">Similar speakers</h2>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((o) => (
            <SpeakerCard key={o.slug} speaker={o} />
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-surface p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="label-mono">{fee}</span>
          <ButtonLink to="/get-matched" search={{ speaker: s.slug }} className="px-6">
            Check availability
          </ButtonLink>
        </div>
      </div>
    </Page>
  );
}
