import { createServerFn } from "@tanstack/react-start";

import {
  emptyFilters,
  queryRoster,
  rosterCount,
  rosterSpeakerName,
  type RosterFilters,
  type RosterGender,
  type RosterPage,
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
 * Filters the imported roster on the server and returns one page.
 *
 * Deliberately a server function: the roster module is several hundred KB, and
 * running the filter here keeps every byte of it out of the browser bundle.
 */
export const fetchRoster = createServerFn({ method: "GET" })
  .validator(coerceFilters)
  .handler(({ data }): RosterPage & { rosterCount: number } => ({
    ...queryRoster(data),
    rosterCount,
  }));

/** Resolves a roster slug to a display name for the enquiry form. */
export const fetchRosterSpeakerName = createServerFn({ method: "GET" })
  .validator((input: unknown) => (typeof input === "string" ? input : ""))
  .handler(({ data }): { name: string | null } => ({
    name: data ? rosterSpeakerName(data) : null,
  }));
