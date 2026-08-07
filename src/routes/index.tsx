import { createFileRoute, Link } from "@tanstack/react-router";
import { SpeakerCard } from "@/components/SpeakerCard";
import { ClosingCta } from "@/components/ClosingCta";
import { PortalHero } from "@/components/PortalHero";
import { featuredTopics, pinnedFirst } from "@/data/speakers";
import { fetchSpeakersBySlugs } from "@/lib/speakers.server";
import { absoluteUrl, ogImageMeta, jsonLd } from "@/lib/site";
import { serviceJsonLd } from "@/lib/schema";
import { Page, Eyebrow, FAQ, faqJsonLd } from "@/components/Page";

export const Route = createFileRoute("/")({
  loader: async () => ({ speakers: await fetchSpeakersBySlugs({ data: [...HOME_FEATURED] }) }),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Keynote Speakers, Fees Shown Upfront | SummonSpeakers" },
      {
        name: "description",
        content:
          "Browse, compare and book professional speakers directly. Fees shown upfront, no guessing what they cost. Get a matched shortlist in one business day.",
      },
      { property: "og:title", content: "Book the keynote speaker your event deserves" },
      {
        property: "og:description",
        content: "Compare speakers and their fees upfront, then book directly.",
      },
      { property: "og:url", content: absoluteUrl("/") },
      ...ogImageMeta("default"),
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/") },
      // The portrait is the LCP element; without this it queues behind the CSS.
      { rel: "preload", as: "image", href: "/hero-speaker.webp", fetchPriority: "high" },
    ],
    scripts: [
      // Blocking on purpose: it must run before first paint so the portal hero
      // renders closed from the very first frame. No-JS visitors never run it
      // and reduced-motion visitors are skipped, so both get the open page.
      {
        children:
          "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('portal-closed')}catch(e){}",
      },
      {
        type: "application/ld+json",
        children: jsonLd(serviceJsonLd(loaderData?.speakers.length ?? 0)),
      },
      { type: "application/ld+json", children: jsonLd(faqJsonLd(homeFaqs)) },
    ],
  }),
  component: Home,
});

/**
 * Answers written to be quotable on their own, because that is the form AI
 * assistants extract. Every figure here is stated elsewhere on the site too.
 */
const homeFaqs = [
  {
    q: "What is SummonSpeakers?",
    a: "SummonSpeakers is a speaker booking marketplace that publishes every speaker's fee band upfront. Planners browse the roster, compare fees before making contact, and book directly with the speaker. The fee shown on a profile is the fee you pay. Nothing is added afterward.",
  },
  {
    q: "How much does a keynote speaker cost?",
    a: "Professional keynote speakers cost between $3,000 and $120,000. Emerging speakers start around $3,000, established names with a book or research base sit between $9,000 and $30,000, and broadcast-level names start near $35,000. Every band is published on the speaker fees page.",
  },
  {
    q: "Is SummonSpeakers free to use?",
    a: "Yes. Enquiring is free, there is no account to create, and you are committed to nothing until you sign a booking. Whatever a profile shows is the number you'll pay. Nothing is added later.",
  },
  {
    q: "How is this different from a speaker bureau?",
    a: "A traditional bureau adds 20 to 30 per cent to the speaker's fee and usually will not disclose the fee until you have had a sales call. SummonSpeakers publishes the band before you enquire, so the number you see is the number you budget. No sales call, no waiting to find out.",
  },
  {
    q: "Who uses SummonSpeakers?",
    a: "Conference producers, event managers, HR and people teams, and association directors: anyone responsible for filling a stage on a fixed budget. Most briefs we receive name a theme rather than a speaker.",
  },
  {
    q: "What happens if a speaker cancels?",
    a: "We find a replacement of the same calibre at the same fee, or you receive a full refund. If you need to cancel, that is free up to 14 days before your event.",
  },
];

const benefits = [
  {
    n: "01",
    h: "Transparent fees",
    p: "Every speaker publishes a fee band. You can build a shortlist that fits the budget before you speak to anyone.",
  },
  {
    n: "02",
    h: "Direct booking",
    p: "Pay 50% once the speaker confirms your date. The relationship is yours from that moment, and you deal with them directly.",
  },
  {
    n: "03",
    h: "Matched to your brief",
    p: "Tell us the date, the audience and the theme. We send a shortlist within one business day.",
  },
];

const homeTestimonials = [
  {
    quote:
      "We saw the fees, picked three names and had a signed contract by Friday. It used to take a month.",
    result: "Booked in one afternoon",
    name: "Elena Marsh",
    role: "Head of People",
    company: "Northbridge Group",
    avatarSlug: "elena-marsh",
  },
  {
    quote:
      "The shortlist actually matched the brief. Two of the three were people we would never have found ourselves.",
    result: "Shortlist in 24 hours",
    name: "Tom Verity",
    role: "Events Director",
    company: "Ardent Health",
    avatarSlug: "tom-verity",
  },
  {
    quote: "No sales call, no guessing, no fee on application. Just the number.",
    result: "Saved 22% on bureau quote",
    name: "Priya Nandan",
    role: "Conference Producer",
    company: "Meridian Events",
    avatarSlug: "priya-nandan",
  },
];

/**
 * Testimonial slugs with a generated portrait at public/testimonials/<slug>.webp.
 *
 * Every name above is fictional, same as the twelve speaker profiles, so a
 * photo here carries the same AI-generated disclosure in its alt text. A slug
 * missing from this set falls back to the hatch placeholder rather than a
 * broken image.
 */
const TESTIMONIAL_AVATARS = new Set<string>(["elena-marsh", "tom-verity", "priya-nandan"]);

/**
 * The four cards on the homepage, in this order.
 *
 * Chosen by slug rather than by reordering the `speakers` array, because that
 * array also drives /speakers, the sitemap, the similar-speakers rail and the
 * enquiry form's dropdown — reordering it to change the homepage would quietly
 * reorder all of those too.
 *
 * An unknown slug throws at load rather than rendering three cards and leaving
 * nobody to notice the fourth went missing.
 */
const HOME_FEATURED = [
  "helena-brandt",
  "robert-ainsley",
  "nina-castellan",
  "daniel-abbott",
] as const;

function Home() {
  const { speakers } = Route.useLoaderData();
  // An empty array means the backend was unreachable, not that a genuinely
  // pinned slug is missing — pinnedFirst can't tell those apart, and a real
  // outage should render the rest of the homepage rather than crash it.
  const homeFeatured = speakers.length > 0 ? pinnedFirst(HOME_FEATURED, speakers).slice(0, 4) : [];

  return (
    <Page headerRevealed={false}>
      <PortalHero />

      {/* Hidden rather than shown empty: a heading with no cards under it, on
          the rare occasion the backend is unreachable, reads as broken. */}
      {homeFeatured.length > 0 && (
        <section className="rule-open container-x section-y">
          <div className="flex items-end justify-between gap-6">
            <h2 className="display text-[length:var(--display-md)]">Featured speakers</h2>
            <Link
              to="/speakers"
              className="hidden min-h-[44px] items-center gap-2 text-sm underline underline-offset-4 md:inline-flex"
            >
              All speakers <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {homeFeatured.map((s) => (
              <SpeakerCard key={s.slug} speaker={s} />
            ))}
          </div>
        </section>
      )}

      <section className="rule-open container-x section-y">
        <Eyebrow>Browse by category</Eyebrow>
        <ul className="mt-10 border-t border-[var(--line)]">
          {featuredTopics.map((t, i) => (
            <li key={t.slug} className="border-b border-[var(--line)]">
              <Link
                to="/topics/$slug"
                params={{ slug: t.slug }}
                className="group grid min-h-[88px] grid-cols-[auto_1fr_auto] items-center gap-6 py-6 md:grid-cols-[auto_1fr_1fr_auto] md:items-start md:gap-8"
              >
                <span className="label-mono text-[var(--ink-3)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1 md:hidden">
                  <span className="display inline-block text-[length:var(--display-md)] transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:translate-x-3">
                    {t.name}
                  </span>
                  <span className="max-w-[46ch] text-sm text-[var(--ink-2)]">
                    {t.blurb.split(".")[0]}.
                  </span>
                </span>
                <span className="display hidden text-[length:var(--display-md)] transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:translate-x-3 md:block">
                  {t.name}
                </span>
                <span className="hidden max-w-[46ch] self-start pt-2 text-sm text-[var(--ink-2)] md:block">
                  {t.blurb.split(".")[0]}.
                </span>
                <span aria-hidden="true" className="self-center text-2xl">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>Why planners choose us</Eyebrow>
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
        <Eyebrow>What planners say</Eyebrow>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {homeTestimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--line)] p-8"
            >
              <blockquote className="text-lg tracking-[-0.02em]">“{t.quote}”</blockquote>
              <div className="mt-8">
                <span className="label-mono inline-block rounded-full border border-[var(--line-2)] px-3 py-2">
                  {t.result}
                </span>
                <figcaption className="mt-6 flex items-center gap-4">
                  {TESTIMONIAL_AVATARS.has(t.avatarSlug) ? (
                    <img
                      src={`/testimonials/${t.avatarSlug}.webp`}
                      alt={`${t.name} (AI-generated placeholder image)`}
                      width={112}
                      height={112}
                      loading="lazy"
                      decoding="async"
                      className="size-12 rounded-full bg-[var(--surface-alt)] object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="hatch size-12 rounded-full" />
                  )}
                  <span className="text-sm">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-[var(--ink-2)]">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </section>

      <section className="rule-open container-x section-y">
        <FAQ items={homeFaqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
