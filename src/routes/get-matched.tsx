import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { EnquiryFlow } from "@/components/EnquiryFlow";

export const Route = createFileRoute("/get-matched")({
  validateSearch: (search: Record<string, unknown>) => ({
    speaker: typeof search['speaker'] === "string" ? (search['speaker'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Get matched with speakers in one business day | SummonSpeakers" },
      {
        name: "description",
        content:
          "Tell us about your event in about two minutes. We'll send a shortlist of matched speakers with fees within one business day. Free to enquire, no account needed.",
      },
      { property: "og:title", content: "Get matched | SummonSpeakers" },
      {
        property: "og:description",
        content: "A shortlist of matched speakers, with fees, within one business day.",
      },
      { property: "og:url", content: "/get-matched" },
    ],
    links: [{ rel: "canonical", href: "/get-matched" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "Get matched", item: "/get-matched" },
          ]),
        ),
      },
    ],
  }),
  component: GetMatched,
});

function GetMatched() {
  const { speaker } = Route.useSearch();
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Get matched" }]} />
      <section className="container-x pb-24 pt-10">
        <EnquiryFlow speakerSlug={speaker} />
      </section>
    </Page>
  );
}
