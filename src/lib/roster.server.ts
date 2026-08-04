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

function coerceFilters(input: unknown): RosterFilters {
  const raw = (input ?? {}) as Partial<Record<keyof RosterFilters, unknown>>;
  const gender = raw.gender;
  const page = Number(raw.page);
  return {
    category: typeof raw.category === "string" ? raw.category : emptyFilters.category,
    state: typeof raw.state === "string" ? raw.state : emptyFilters.state,
    gender:
      gender === "female" || gender === "male" ? (gender as RosterGender) : emptyFilters.gender,
    q: typeof raw.q === "string" ? raw.q : emptyFilters.q,
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  };
}

/**
 * Filters the 2,131-speaker roster on the server and returns one page.
 *
 * Deliberately a server function: the roster module is ~180KB, and running the
 * filter here keeps every byte of it out of the browser bundle.
 */
export const fetchRoster = createServerFn({ method: "GET" })
  .inputValidator(coerceFilters)
  .handler(({ data }): RosterPage & { rosterCount: number } => ({
    ...queryRoster(data),
    rosterCount,
  }));

/** Resolves a roster slug to a display name for the enquiry form. */
export const fetchRosterSpeakerName = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => (typeof input === "string" ? input : ""))
  .handler(({ data }): { name: string | null } => ({
    name: data ? rosterSpeakerName(data) : null,
  }));
