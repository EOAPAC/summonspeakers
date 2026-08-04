import { createFileRoute } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ClosingCta } from "@/components/ClosingCta";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

const steps = [
  {
    n: "01",
    h: "Tell us about your event",
    p: "The date, the audience size and the theme. It takes about two minutes and you don't need an account. Enquiring is free and puts you under no obligation.",
  },
  {
    n: "02",
    h: "Get a matched shortlist with fees shown",
    p: "Within one business day we send speakers who fit the brief, each with a confirmed fee. If someone is outside your budget, we say so rather than letting you find out later.",
  },
  {
    n: "03",
    h: "Book directly through us",
    p: "You contract with the speaker. We handle the paperwork and the logistics, and we add no markup to the fee you were quoted.",
  },
  {
    n: "04",
    h: "We support you through to the day",
    p: "Briefing calls, travel, technical requirements and run sheets. If something changes, you have one person to call.",
  },
];

const faqs = [
  {
    q: "Does it cost anything to enquire?",
    a: "No. Enquiring is free, there is no account to create, and you are not committed to anything until you sign a booking.",
  },
  {
    q: "What happens if a speaker cancels?",
    a: "We find a replacement of the same calibre at the same fee, or you receive a full refund. Free cancellation applies up to 14 days before your event if you need to cancel.",
  },
  {
    q: "What if we're not sure what we want yet?",
    a: "Send the enquiry anyway. Roughly half the briefs we get name a theme rather than a speaker, and the shortlist is usually more useful when you haven't already narrowed it. Tell us the audience and what you want them to leave thinking.",
  },
];

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How booking a speaker works | SummonSpeakers" },
      {
        name: "description",
        content:
          "Four steps: tell us about your event, get a matched shortlist with fees, book directly, and we support you through to the day. Free to enquire.",
      },
      { property: "og:title", content: "How it works | SummonSpeakers" },
      {
        property: "og:description",
        content: "From brief to booking in four steps, with fees shown at every stage.",
      },
      { property: "og:url", content: absoluteUrl("/how-it-works") },
      ...ogImageMeta("how-it-works"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/how-it-works") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "How it works", item: "/how-it-works" },
          ]),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "How it works" }]} />
      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">How it works</h1>
        <p className="mt-8 max-w-[58ch] text-lg text-[var(--ink-2)]">
          Four steps from brief to booking. Fees are visible at every stage, and nothing is
          committed until you sign.
        </p>
      </section>

      <section className="rule-open container-x section-y">
        <Eyebrow>The process</Eyebrow>
        <ol className="mt-10 border-t border-[var(--line)]">
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid gap-4 border-b border-[var(--line)] py-10 md:grid-cols-[80px_1fr_1.2fr] md:gap-12"
            >
              <span className="label-mono text-[var(--ink-3)]">{s.n}</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{s.h}</h2>
              <p className="text-[var(--ink-2)]">{s.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
