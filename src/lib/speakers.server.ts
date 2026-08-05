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
 * down. Callers that pin specific slugs (pinnedFirst) still throw on a
 * missing slug — that guard is for a genuine typo, not a backend outage, and
 * weakening it would hide the outage instead of surfacing it.
 *
 * Ordered by name for a stable, deterministic result. The previous static
 * array's order was whatever it happened to be authored in; nothing in the
 * app depends on that specific order surviving, but callers that do care
 * about order (pinnedFirst) reorder explicitly rather than relying on this.
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
