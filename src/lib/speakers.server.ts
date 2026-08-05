import { createServerFn } from "@tanstack/react-start";

import { getPublicClient } from "./supabase.server";
import type { Speaker } from "@/data/speakers";

type SpeakerRow = {
  slug: string;
  name: string;
  role: string | null;
  tagline: string | null;
  bio_short: string | null;
  bio_long: string[] | null;
  fee_min: number | null;
  fee_max: number | null;
  fee_on_application: boolean;
  available: boolean;
  location: string | null;
  topics: string[] | null;
  showreel_url: string | null;
  testimonials: {
    quote: string;
    author_name: string | null;
    author_role: string | null;
    company: string | null;
    result: string | null;
  }[];
  past_clients: { name: string }[];
};

function rowToSpeaker(row: SpeakerRow): Speaker {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role ?? "",
    tagline: row.tagline ?? "",
    bio_short: row.bio_short ?? "",
    bio_long: row.bio_long ?? [],
    fee_min: row.fee_min ?? 0,
    fee_max: row.fee_max ?? 0,
    fee_on_application: row.fee_on_application,
    available: row.available,
    location: row.location ?? "",
    topics: row.topics ?? [],
    showreel_url: row.showreel_url,
    testimonials: row.testimonials.map((t) => ({
      quote: t.quote,
      author_name: t.author_name ?? "",
      author_role: t.author_role ?? "",
      company: t.company ?? "",
      ...(t.result ? { result: t.result } : {}),
    })),
    past_clients: row.past_clients.map((c) => c.name),
  };
}

const SELECT =
  "slug,name,role,tagline,bio_short,bio_long,fee_min,fee_max,fee_on_application,available,location,topics,showreel_url,testimonials(quote,author_name,author_role,company,result),past_clients(name)";

/**
 * The full-profile speakers, from Supabase rather than a static import.
 *
 * Returns an empty array when the backend is unconfigured or the query
 * fails, the same defensive posture getServiceClient() takes: the site must
 * still render rather than 500 for every visitor because one dependency is
 * down.
 *
 * CAPPED: PostgREST returns at most 1,000 rows, and the table now holds more,
 * so this list is a truncated, name-ordered slice. Fine for the surfaces that
 * use it (topic previews, the enquiry dropdown, the sitemap's profile URLs);
 * anything that needs specific speakers must use fetchSpeakersBySlugs or
 * fetchSpeakerBySlug instead of filtering this.
 */
export const fetchSpeakers = createServerFn({ method: "GET" }).handler(
  async (): Promise<Speaker[]> => {
    const client = getPublicClient();
    if (!client) return [];
    const { data, error } = await client
      .from("speakers")
      .select(SELECT)
      .eq("status", "published")
      .order("name");
    if (error) {
      console.error("fetchSpeakers: query failed", error);
      return [];
    }
    return (data as unknown as SpeakerRow[]).map(rowToSpeaker);
  },
);

/**
 * Exactly the named speakers, by slug. The speakers table outgrew the
 * PostgREST 1,000-row response cap, which silently truncated fetchSpeakers —
 * the homepage's pinned slugs sorted past the cap and vanished from a
 * non-empty result, which read as a typo rather than an outage. Pages that
 * pin specific speakers ask for exactly those rows instead of filtering a
 * capped list.
 */
export const fetchSpeakersBySlugs = createServerFn({ method: "GET" })
  .validator((input: unknown): string[] =>
    Array.isArray(input)
      ? input.filter((s): s is string => typeof s === "string").slice(0, 24)
      : [],
  )
  .handler(async ({ data }): Promise<Speaker[]> => {
    const client = getPublicClient();
    if (!client || data.length === 0) return [];
    const { data: rows, error } = await client
      .from("speakers")
      .select(SELECT)
      .eq("status", "published")
      .in("slug", data)
      .order("name");
    if (error) {
      console.error("fetchSpeakersBySlugs: query failed", error);
      return [];
    }
    return (rows as unknown as SpeakerRow[]).map(rowToSpeaker);
  });

/**
 * One speaker plus up to six others who share a topic, for the profile page.
 * By slug rather than find()-ing a full fetch, for the same row-cap reason as
 * fetchSpeakersBySlugs.
 */
export const fetchSpeakerBySlug = createServerFn({ method: "GET" })
  .validator((input: unknown) => (typeof input === "string" ? input.slice(0, 100) : ""))
  .handler(async ({ data }): Promise<{ speaker: Speaker | null; similar: Speaker[] }> => {
    const client = getPublicClient();
    if (!client || !data) return { speaker: null, similar: [] };
    const { data: rows, error } = await client
      .from("speakers")
      .select(SELECT)
      .eq("status", "published")
      .eq("slug", data)
      .limit(1);
    if (error || !rows?.[0]) {
      if (error) console.error("fetchSpeakerBySlug: query failed", error);
      return { speaker: null, similar: [] };
    }
    const speaker = rowToSpeaker(rows[0] as unknown as SpeakerRow);
    const { data: similarRows, error: similarError } = await client
      .from("speakers")
      .select(SELECT)
      .eq("status", "published")
      .neq("slug", speaker.slug)
      .overlaps("topics", speaker.topics.length ? speaker.topics : ["__none__"])
      .order("name")
      .limit(6);
    if (similarError) console.error("fetchSpeakerBySlug: similar query failed", similarError);
    return {
      speaker,
      similar: ((similarRows ?? []) as unknown as SpeakerRow[]).map(rowToSpeaker),
    };
  });
