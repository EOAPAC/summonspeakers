import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { EnquiryFlow } from "@/components/EnquiryFlow";
import { getSpeaker, type Speaker } from "@/data/speakers";
import { portraitSlugs } from "@/data/speaker-portraits";
import { fetchSpeakerBySlug, fetchSpeakersBySlugs } from "@/lib/speakers.server";
import { fetchRosterSpeakerName } from "@/lib/roster.server";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/get-matched")({
  // Omit the key when there is no speaker rather than defaulting to "" —
  // returning it always made every visit to /get-matched redirect to
  // /get-matched?speaker=, away from its own canonical URL.
  validateSearch: (search: Record<string, unknown>): { speaker?: string } => {
    const speaker = search["speaker"];
    return typeof speaker === "string" && speaker !== "" ? { speaker } : {};
  },

  // The full profiles come from Supabase now, so this always fetches them —
  // the enquiry form's dropdown needs the full list regardless of whether a
  // speaker was preset, not only when resolving a `?speaker=` slug.
  loaderDeps: ({ search }) => ({ speaker: search.speaker ?? "" }),
  loader: async ({ deps }): Promise<{ presetName: string; speakers: Speaker[] }> => {
    // Only the portrait-backed profiles populate the dropdown: the speakers
    // table now holds thousands of rows, and a thousand-option select helps
    // nobody. Everyone else arrives with their name prefilled via ?speaker=.
    const speakers = await fetchSpeakersBySlugs({ data: [...portraitSlugs] });
    if (!deps.speaker) return { presetName: "", speakers };
    const profile = getSpeaker(deps.speaker, speakers);
    if (profile) return { presetName: profile.name, speakers };
    const { speaker } = await fetchSpeakerBySlug({ data: deps.speaker });
    if (speaker) return { presetName: speaker.name, speakers };
    const { name } = await fetchRosterSpeakerName({ data: deps.speaker });
    return { presetName: name ?? "", speakers };
  },

  head: () => ({
    meta: [
      { title: "Get a Speaker Shortlist in 1 Day | SummonSpeakers" },
      {
        name: "description",
        content:
          "Tell us about your event in two minutes. We send a shortlist of matched speakers, with fees, within one business day. Free, and no account needed.",
      },
      { property: "og:title", content: "Get matched | SummonSpeakers" },
      {
        property: "og:description",
        content: "A shortlist of matched speakers, with fees, within one business day.",
      },
      { property: "og:url", content: absoluteUrl("/get-matched") },
      ...ogImageMeta("get-matched"),
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
  const { presetName, speakers } = Route.useLoaderData();
  return (
    <Page>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Get matched" }]} />
      <section className="container-x pb-24 pt-10">
        <EnquiryFlow speakers={speakers} presetName={presetName} presetSlug={speaker ?? ""} />
      </section>
    </Page>
  );
}
