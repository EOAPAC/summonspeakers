import { createFileRoute } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SpeakerDirectory } from "@/components/SpeakerDirectory";
import { ClosingCta } from "@/components/ClosingCta";
import { ButtonLink } from "@/components/Button";
import { speakers } from "@/data/speakers";
import { absoluteUrl } from "@/lib/site";

const faqs = [
  {
    q: "How much does a keynote speaker cost?",
    a: "Most professional keynote speakers on SummonSpeakers sit between $7,000 and $30,000. Emerging speakers start lower; broadcast names and former heads of state go well above. Every profile shows a band.",
  },
  {
    q: "How do I book a speaker?",
    a: "Send an enquiry with your date, audience size and topic. We reply within one business day with a shortlist and confirmed fees, then you book directly with the speaker through us.",
  },
];

export const Route = createFileRoute("/speakers/")({
  head: () => ({
    meta: [
      { title: "All Speakers — fees shown upfront | SummonSpeakers" },
      {
        name: "description",
        content:
          "Browse every speaker on SummonSpeakers with published fee bands, topics, locations and availability. Filter and enquire directly.",
      },
      { property: "og:title", content: "All Speakers | SummonSpeakers" },
      {
        property: "og:description",
        content: "Every speaker, every fee band, filterable in seconds.",
      },
      { property: "og:url", content: absoluteUrl("/speakers") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/speakers") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "Speakers", item: "/speakers" },
          ]),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) },
    ],
  }),
  component: SpeakersIndex,
});

function SpeakersIndex() {
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Speakers" }]} />
      <section className="container-x pb-16 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">All speakers</h1>
        <p className="mt-8 max-w-[60ch] text-lg text-[var(--ink-2)]">
          Every speaker here publishes a fee band. Filter by topic, budget, location and
          availability, then enquire directly — there is no bureau taking a cut in the middle.
        </p>
      </section>

      <section className="container-x pb-8">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--line)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[48ch] text-[var(--ink-2)]">
            Not sure who fits? Tell us about your event and we'll send a shortlist within one
            business day. Free to enquire, no obligation.
          </p>
          <ButtonLink to="/get-matched">Get matched</ButtonLink>
        </div>
      </section>

      <section className="container-x pb-24">
        <SpeakerDirectory speakers={speakers} />
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqs} />
      </section>

      <ClosingCta />
    </Page>
  );
}
