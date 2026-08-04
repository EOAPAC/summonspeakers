import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { EnquiryFlow } from "@/components/EnquiryFlow";
import { getSpeaker } from "@/data/speakers";
import { fetchRosterSpeakerName } from "@/lib/roster.server";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/get-matched")({
  // Omit the key when there is no speaker rather than defaulting to "" —
  // returning it always made every visit to /get-matched redirect to
  // /get-matched?speaker=, away from its own canonical URL.
  validateSearch: (search: Record<string, unknown>): { speaker?: string } => {
    const speaker = search["speaker"];
    return typeof speaker === "string" && speaker !== "" ? { speaker } : {};
  },

  // Resolve the slug to a name here: full profiles are in the client bundle
  // already, the wider roster needs a server hop.
  loaderDeps: ({ search }) => ({ speaker: search.speaker ?? "" }),
  loader: async ({ deps }): Promise<{ presetName: string }> => {
    if (!deps.speaker) return { presetName: "" };
    const profile = getSpeaker(deps.speaker);
    if (profile) return { presetName: profile.name };
    const { name } = await fetchRosterSpeakerName({ data: deps.speaker });
    return { presetName: name ?? "" };
  },

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
      { property: "og:url", content: absoluteUrl("/get-matched") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/get-matched") }],
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
  const { presetName } = Route.useLoaderData();
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Get matched" }]} />
      <section className="container-x pb-24 pt-10">
        <EnquiryFlow presetName={presetName} presetSlug={speaker ?? ""} />
      </section>
    </Page>
  );
}
