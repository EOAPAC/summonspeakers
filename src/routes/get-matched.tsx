import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { EnquiryFlow } from "@/components/EnquiryFlow";
import { getSpeaker, type Speaker } from "@/data/speakers";
import { portraitSlugs } from "@/data/speaker-portraits";
import { fetchSpeakerBySlug, fetchSpeakersBySlugs } from "@/lib/speakers.server";
import { fetchRosterSpeakerName } from "@/lib/roster.server";
import { absoluteUrl, ogImageMeta, jsonLd } from "@/lib/site";

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
        children: jsonLd(
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
        <div className="grid gap-16 lg:grid-cols-[minmax(0,64ch)_280px] lg:gap-24">
          <EnquiryFlow speakers={speakers} presetName={presetName} presetSlug={speaker ?? ""} />
          {/* Reassurance while the form is open: what the enquiry actually
              sets in motion, and what it does not commit anyone to. */}
          <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
            <p className="label-mono text-[var(--ink-3)]">What happens next</p>
            <ol className="mt-6 space-y-6 border-t border-[var(--line)] pt-6">
              {[
                "We read your brief and shortlist speakers who fit the date, the room and the budget.",
                "The shortlist lands in your inbox within one business day, fees included.",
                "You pick who to talk to. No account, no commitment until you sign a booking.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4 text-sm text-[var(--ink-2)]">
                  <span className="label-mono text-[var(--ink-3)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </Page>
  );
}
