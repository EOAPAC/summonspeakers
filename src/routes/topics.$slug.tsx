import { createFileRoute, notFound } from "@tanstack/react-router";
import { Page, FAQ, faqJsonLd } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { SpeakerDirectory } from "@/components/SpeakerDirectory";
import { ClosingCta } from "@/components/ClosingCta";
import { ButtonLink } from "@/components/Button";
import { getTopic, speakersByTopic } from "@/data/speakers";
import { feeAnswerForTopic } from "@/data/fees";
import { absoluteUrl } from "@/lib/site";

function faqsFor(name: string) {
  const lower = name.toLowerCase();
  const feeAnswer = feeAnswerForTopic(name);
  return [
    ...(feeAnswer
      ? [{ q: `How much do ${lower} speakers cost?`, a: feeAnswer }]
      : []),
    {
      q: `How do I book a ${lower} speaker?`,
      a: `Send an enquiry with your date, audience size and theme. We confirm availability and the exact fee within one business day, then you book directly through us. There is no bureau markup, and cancellation is free up to 14 days before your event.`,
    },
  ];
}

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();
    return { topic, speakers: speakersByTopic(topic.name) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Topic unavailable | SummonSpeakers" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = loaderData.topic;
    const description = `${t.heading} with fees shown upfront. Compare fee bands, topics and availability, then book directly with no bureau markup.`;
    return {
      meta: [
        { title: `${t.heading} — fees shown upfront | SummonSpeakers` },
        { name: "description", content: description },
        { property: "og:title", content: `${t.heading} | SummonSpeakers` },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(`/topics/${params.slug}`) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/topics/${params.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Topics", item: "/speakers" },
              { name: t.heading, item: `/topics/${t.slug}` },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqsFor(t.name))) },
      ],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic, speakers } = Route.useLoaderData();

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Speakers", to: "/speakers" },
          { label: topic.heading },
        ]}
      />
      <section className="container-x pb-12 pt-10">
        <h1 className="display max-w-[16ch] text-[length:var(--display-lg)]">{topic.heading}</h1>
        <p className="mt-8 max-w-[64ch] text-lg text-[var(--ink-2)]">{topic.blurb}</p>
      </section>

      <section className="container-x pb-8">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--line)] p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[48ch] text-[var(--ink-2)]">
            Tell us about your event and we'll send a shortlist of {topic.name.toLowerCase()}{" "}
            speakers within one business day. Free to enquire, no obligation.
          </p>
          <ButtonLink to="/get-matched">Get matched</ButtonLink>
        </div>
      </section>

      <section className="container-x pb-24">
        <SpeakerDirectory speakers={speakers} lockedTopic={topic.name} />
      </section>

      <section className="container-x pb-24">
        <FAQ items={faqsFor(topic.name)} />
      </section>

      <ClosingCta />
    </Page>
  );
}
