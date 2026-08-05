import { createFileRoute, Link } from "@tanstack/react-router";
import { ButtonLink } from "@/components/Button";
import { SpeakerCard } from "@/components/SpeakerCard";
import { ClosingCta } from "@/components/ClosingCta";
import { featuredTopics, getSpeaker } from "@/data/speakers";
import { absoluteUrl, ogImageMeta } from "@/lib/site";
import { serviceJsonLd } from "@/lib/schema";
import { Page, Eyebrow, FAQ, faqJsonLd } from "@/components/Page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keynote Speakers, Fees Shown Upfront | SummonSpeakers" },
      {
        name: "description",
        content:
          "Browse, compare and book professional speakers directly. No bureau markup, no guessing what they cost. Get a matched shortlist in one business day.",
      },
      { property: "og:title", content: "Book the keynote speaker your event deserves" },
      {
        property: "og:description",
        content: "Compare speakers and their fees upfront, then book directly.",
      },
      { property: "og:url", content: absoluteUrl("/") },
      ...ogImageMeta("default"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(serviceJsonLd()) },
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd(homeFaqs)) },
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
    a: "SummonSpeakers is a speaker booking marketplace that publishes every speaker's fee band upfront. Planners browse the roster, compare fees before making contact, and book directly with the speaker. We add no markup to the fee you are quoted.",
  },
  {
    q: "How much does a keynote speaker cost?",
    a: "Professional keynote speakers cost between $3,000 and $120,000. Emerging speakers start around $3,000, established names with a book or research base sit between $9,000 and $30,000, and broadcast-level names start near $35,000. Every band is published on the speaker fees page.",
  },
  {
    q: "Is SummonSpeakers free to use?",
    a: "Yes. Enquiring is free, there is no account to create, and you are committed to nothing until you sign a booking. Speakers pay a flat listing fee, so we earn nothing from your booking and nothing extra when a fee is higher.",
  },
  {
    q: "How is this different from a speaker bureau?",
    a: "A traditional bureau adds 20 to 30 per cent to the speaker's fee and usually will not disclose the fee until you have had a sales call. SummonSpeakers publishes the band before you enquire and takes no percentage, so the number you see is the number you budget.",
  },
  {
    q: "Who uses SummonSpeakers?",
    a: "Conference producers, event managers, HR and people teams, and association directors — anyone responsible for filling a stage on a fixed budget. Most briefs we receive name a theme rather than a speaker.",
  },
  {
    q: "What happens if a speaker cancels?",
    a: "We find a replacement of the same calibre at the same fee, or you receive a full refund. If you need to cancel, that is free up to 14 days before your event.",
  },
];

const clients = ["NORTHBRIDGE", "ARDENT HEALTH", "MERIDIAN", "HAVENLINE", "PALEWOOD"];

const benefits = [
  {
    n: "01",
    h: "Transparent fees",
    p: "Every speaker publishes a fee band. You can build a shortlist that fits the budget before you speak to anyone.",
  },
  {
    n: "02",
    h: "Direct booking",
    p: "You deal with the speaker, not a middleman adding twenty per cent. The relationship is yours from the first email.",
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
  },
  {
    quote:
      "The shortlist actually matched the brief. Two of the three were people we would never have found ourselves.",
    result: "Shortlist in 24 hours",
    name: "Tom Verity",
    role: "Events Director",
    company: "Ardent Health",
  },
  {
    quote: "No sales call, no markup, no fee on application. Just the number.",
    result: "Saved 22% on bureau quote",
    name: "Priya Nandan",
    role: "Conference Producer",
    company: "Meridian Events",
  },
];

/**
 * The four cards on the homepage, in this order.
 *
 * Chosen by slug rather than by reordering the `speakers` array, because that
 * array also drives /speakers, the sitemap, the similar-speakers rail and the
 * enquiry form's dropdown — reordering it to change the homepage would quietly
 * reorder all of those too.
 *
 * An unknown slug throws at module load rather than rendering three cards and
 * leaving nobody to notice the fourth went missing.
 */
const HOME_FEATURED = [
  "helena-brandt",
  "nina-castellan",
  "robert-ainsley",
  "michael-toure",
] as const;

const homeFeatured = HOME_FEATURED.map((slug) => {
  const speaker = getSpeaker(slug);
  if (!speaker) throw new Error(`HOME_FEATURED names an unknown speaker slug: "${slug}"`);
  return speaker;
});

function Home() {
  return (
    <Page>
      <section className="container-x pb-20 pt-16 md:pt-24">
        <h1 className="display text-[length:clamp(26px,3.6vw,76px)]">
          Keynote Speakers Your Event Deserves
        </h1>
        <p className="mt-10 max-w-[48ch] text-lg text-[var(--ink-2)] md:max-w-none">
          Browse, compare and book professional speakers with fees shown upfront. No bureau markup,
          no guessing what they cost.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <ButtonLink to="/get-matched">Get matched</ButtonLink>
          <Link
            to="/speakers"
            className="inline-flex min-h-[44px] items-center gap-2 text-base underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-ink"
          >
            Browse speakers <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="label-mono mt-6 text-[var(--ink-3)]">Free to enquire, no obligation</p>

        <div className="hairline-top mt-20 pt-8">
          <Eyebrow>Trusted by event teams at</Eyebrow>
          <ul className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
            {clients.map((c) => (
              <li key={c} className="label-mono text-[var(--ink-3)]">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

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
                  <span aria-hidden="true" className="hatch size-12 rounded-full" />
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

      <section className="rule-open container-x section-y">
        <FAQ items={homeFaqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
