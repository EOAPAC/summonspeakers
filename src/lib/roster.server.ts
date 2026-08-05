import { createServerFn } from "@tanstack/react-start";

import { getPublicClient } from "./supabase.server";

import {
  emptyFilters,
  queryRoster,
  rosterCount,
  rosterProfile,
  rosterSpeakerName,
  rosterStats,
  type RosterFilters,
  type RosterGender,
  type RosterPage,
  type RosterProfile,
  type RosterStats,
} from "@/data/roster";

/**
 * Ceilings on every caller-supplied value.
 *
 * A server function is a public RPC endpoint — the key staying off the client
 * does not make the code path private — so input arrives untrusted even though
 * the only caller in the app is our own loader. `pageSize` was previously
 * unbounded, which let one request ask for the whole roster in a single
 * response, and `categories` is matched against every row, so an over-long
 * array turns into a cheap way to burn server time.
 */
const MAX_PAGE_SIZE = 100;
const MAX_CATEGORIES = 40;
const MAX_QUERY_LENGTH = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.floor(value), min), max);
}

function coerceFilters(input: unknown): RosterFilters {
  const raw = (input ?? {}) as Partial<Record<keyof RosterFilters, unknown>>;
  const gender = raw.gender;
  const page = Number(raw.page);
  const pageSize = Number(raw.pageSize);
  return {
    categories: Array.isArray(raw.categories)
      ? raw.categories.filter((c): c is string => typeof c === "string").slice(0, MAX_CATEGORIES)
      : emptyFilters.categories,
    place: typeof raw.place === "string" ? raw.place : emptyFilters.place,
    gender:
      gender === "female" || gender === "male" || gender === "nonbinary"
        ? (gender as RosterGender)
        : emptyFilters.gender,
    q: typeof raw.q === "string" ? raw.q.slice(0, MAX_QUERY_LENGTH) : emptyFilters.q,
    page: Number.isFinite(page) && page >= 1 ? clamp(page, 1, Number.MAX_SAFE_INTEGER) : 1,
    ...(Number.isFinite(pageSize) && pageSize >= 1
      ? { pageSize: clamp(pageSize, 1, MAX_PAGE_SIZE) }
      : {}),
  };
}

/**
 * Marks rows whose slug has a published Supabase profile as routable, on top
 * of the portrait-manifest profiles queryRoster already knows about. One
 * IN-query per page of rows, against just the visible slugs — the speakers
 * table is past PostgREST's 1,000-row response cap, so a "fetch all slugs"
 * set would silently go stale at the letter M.
 */
async function markSupabaseProfiles(rows: RosterPage["rows"]): Promise<void> {
  const missing = rows.filter((r) => !r.hasProfile).map((r) => r.slug);
  const client = getPublicClient();
  if (!client || missing.length === 0) return;
  const { data, error } = await client
    .from("speakers")
    .select("slug")
    .eq("status", "published")
    .in("slug", missing);
  if (error) {
    // Rows render unlinked rather than the page failing: a backend hiccup
    // should cost the links, not the directory.
    console.error("markSupabaseProfiles: query failed", error);
    return;
  }
  const published = new Set((data as { slug: string }[]).map((r) => r.slug));
  for (const r of rows) if (published.has(r.slug)) r.hasProfile = true;
}

/**
 * Filters the imported roster on the server and returns one page.
 *
 * Deliberately a server function: the roster module is several hundred KB, and
 * running the filter here keeps every byte of it out of the browser bundle.
 */
export const fetchRoster = createServerFn({ method: "GET" })
  .validator(coerceFilters)
  .handler(async ({ data }): Promise<RosterPage & { rosterCount: number }> => {
    const page = queryRoster(data);
    await markSupabaseProfiles(page.rows);
    return { ...page, rosterCount };
  });

/** Resolves a roster slug to a display name for the enquiry form. */
export const fetchRosterSpeakerName = createServerFn({ method: "GET" })
  .validator((input: unknown) => (typeof input === "string" ? input : ""))
  .handler(({ data }): { name: string | null } => ({
    name: data ? rosterSpeakerName(data) : null,
  }));

/**
 * A roster speaker's profile page data, or null when they have no uploaded
 * portrait. Serves /speakers/$slug for the roster tier the same way
 * fetchSpeakers serves the hand-written full profiles.
 */
export const fetchRosterProfile = createServerFn({ method: "GET" })
  .validator((input: unknown) => (typeof input === "string" ? input.slice(0, 100) : ""))
  .handler(async ({ data }): Promise<{ profile: RosterProfile | null }> => {
    const profile = data ? rosterProfile(data) : null;
    if (profile) await markSupabaseProfiles(profile.similar);
    return { profile };
  });

/** Directory-wide statistics for /speaker-statistics. */
export const fetchRosterStats = createServerFn({ method: "GET" }).handler((): RosterStats =>
  rosterStats(),
);
