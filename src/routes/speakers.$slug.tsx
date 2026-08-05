import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { FeeBand } from "@/components/FeeBand";
import { Pill } from "@/components/Pill";
import { ButtonLink } from "@/components/Button";
import { SpeakerCard } from "@/components/SpeakerCard";
import { RosterRows } from "@/components/RosterRows";
import { Portrait } from "@/components/Portrait";
import type { Speaker } from "@/data/speakers";
import type { RosterProfile } from "@/data/roster";
import { fetchRosterProfile } from "@/lib/roster.server";
import { fetchSpeakerBySlug } from "@/lib/speakers.server";
import { formatFee } from "@/lib/fee";
import { absoluteUrl, pageTitle, ogImageMeta } from "@/lib/site";

function faqsFor(name: string, fee: string) {
  return [
    {
      q: `What is ${name}'s speaking fee?`,
      a: `${name}'s published fee band is ${fee}. The final figure depends on the format, the date and travel. There are no hidden fees on top of what's shown.`,
    },
    {
      q: `How do I book ${name}?`,
      a: `Send an enquiry with your date and audience size. We confirm availability and the exact fee within one business day, then you book directly. Free cancellation up to 14 days before your event.`,
    },
  ];
}

/**
 * Two tiers share this route. A hand-written full profile (Supabase) renders
 * the complete page; a roster speaker with an uploaded portrait renders the
 * lighter directory profile. A roster speaker without a portrait 404s — the
 * portrait is what makes the page worth publishing.
 */
type ProfileData =
  | { kind: "full"; speaker: Speaker; similar: Speaker[] }
  | { kind: "roster"; profile: RosterProfile };

export const Route = createFileRoute("/speakers/$slug")({
  loader: async ({ params }): Promise<ProfileData> => {
    const { speaker, similar } = await fetchSpeakerBySlug({ data: params.slug });
    if (speaker) return { kind: "full", speaker, similar };
    const { profile } = await fetchRosterProfile({ data: params.slug });
    if (profile) return { kind: "roster", profile };
    throw notFound();
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
    if (loaderData.kind === "roster") {
      const p = loaderData.profile;
      const fee = p.fee ? `$${p.fee.toLocaleString("en-US")}` : "on enquiry";
      const description =
        `${p.name}, keynote speaker${p.categories[0] ? ` on ${p.categories.slice(0, 2).join(" and ").toLowerCase()}` : ""}. Speaking fee ${fee}.${p.location ? ` Based in ${p.location}.` : ""}`.slice(
          0,
          158,
        );
      return {
        meta: [
          {
            title: pageTitle(
              `${p.name}: Keynote Speaker${p.fee ? ` (${fee})` : ""}`,
              `${p.name}: Keynote Speaker`,
              p.name,
            ),
          },
          { name: "description", content: description },
          { property: "og:title", content: `${p.name}: Keynote Speaker` },
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
              name: p.name,
              jobTitle: "Keynote speaker",
              knowsAbout: p.categories,
              url: absoluteUrl(`/speakers/${p.slug}`),
              ...(p.fee
                ? {
                    makesOffer: {
                      "@type": "Offer",
                      name: `Keynote speaking engagement with ${p.name}`,
                      priceSpecification: {
                        "@type": "PriceSpecification",
                        price: p.fee,
                        priceCurrency: "USD",
                      },
                    },
                  }
                : {}),
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify(
              breadcrumbJsonLd([
                { name: "Home", item: "/" },
                { name: "Speakers", item: "/speakers" },
                { name: p.name, item: `/speakers/${p.slug}` },
              ]),
            ),
          },
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
            `${s.name}: ${s.role} (${fee})`,
            s.fee_on_application ? `${s.name}: Keynote Speaker` : `${s.name}: Fee ${fee}`,
            s.name,
          ),
        },
        { name: "description", content: description },
        { property: "og:title", content: `${s.name}: ${s.role}` },
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
  const data = Route.useLoaderData();
  if (data.kind === "roster") return <RosterSpeakerProfile profile={data.profile} />;
  return <FullSpeakerProfile speaker={data.speaker} similar={data.similar} />;
}

/**
 * The directory-tier profile: portrait, categories, location and the fee.
 * Deliberately lighter than the full profile — there is no hand-written bio
 * or testimonial set for these speakers, and padding the page out with
 * boilerplate would read as exactly that.
 */
function RosterSpeakerProfile({ profile: p }: { profile: RosterProfile }) {
  const fee = p.fee ? `$${p.fee.toLocaleString("en-US")}` : "Fee on enquiry";
  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Speakers", to: "/speakers" },
          { label: p.name },
        ]}
      />

      <section className="container-x grid gap-12 pb-16 pt-10 md:grid-cols-[1fr_1fr] md:items-start">
        <img
          src={`/speakers/roster/${p.slug}.webp`}
          alt={`${p.name} portrait`}
          className="aspect-[4/5] w-full rounded-[var(--radius-media)] bg-[var(--surface-alt)] object-cover"
        />
        <div>
          <h1 className="display text-[length:var(--display-md)]">{p.name}</h1>
          <p className="label-mono mt-6 text-[var(--ink-3)]">Keynote speaker</p>
          <div className="mt-8">
            <p className="label-mono mb-3 text-[var(--ink-3)]">Speaking fee</p>
            <p className="text-[length:var(--display-sm)] font-semibold tracking-[-0.03em]">
              {fee}
            </p>
            {p.location && <p className="mt-3 text-sm text-[var(--ink-2)]">{p.location}</p>}
          </div>
          <div className="mt-10 hidden md:block">
            <ButtonLink to="/get-matched" search={{ speaker: p.slug }}>
              Check availability
            </ButtonLink>
          </div>
          {p.categories.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-3">
              {p.categories.map((c) => (
                <li key={c}>
                  <Pill topic={c} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <h2 className="label-mono text-[var(--ink-3)]">Booking {p.name}</h2>
        <p className="mt-8 max-w-[68ch] text-lg text-[var(--ink-2)]">
          Send an enquiry with your date, audience size and theme. We confirm {p.name}&rsquo;s
          availability and the exact fee within one business day, then you book directly. The fee
          shown is the fee you pay; travel and accommodation are quoted separately at cost.
          Cancellation is free up to 14 days before your event.
        </p>
        <div className="mt-8">
          <ButtonLink to="/get-matched" search={{ speaker: p.slug }}>
            Check availability
          </ButtonLink>
        </div>
      </section>

      {p.similar.length > 0 && (
        <section className="container-x pb-24">
          <h2 className="label-mono text-[var(--ink-3)]">More {p.categories[0] ?? ""} speakers</h2>
          <div className="mt-8">
            <RosterRows rows={p.similar} />
          </div>
          <p className="mt-8">
            <Link to="/speakers" className="underline underline-offset-4">
              Browse all speakers
            </Link>
          </p>
        </section>
      )}

      <div className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-surface p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="label-mono">{fee}</span>
          <ButtonLink to="/get-matched" search={{ speaker: p.slug }} className="px-6">
            Check availability
          </ButtonLink>
        </div>
      </div>
    </Page>
  );
}

function FullSpeakerProfile({ speaker: s, similar }: { speaker: Speaker; similar: Speaker[] }) {
  const fee = formatFee(s.fee_min, s.fee_max, s.fee_on_application);

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
        <Portrait
          slug={s.slug}
          name={s.name}
          className="aspect-[4/5] w-full rounded-[var(--radius-media)]"
          fallbackLabel={s.name}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
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
