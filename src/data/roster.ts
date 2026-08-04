/**
 * Roster query layer.
 *
 * SERVER ONLY — this module pulls in roster.generated.ts (~180KB). Reach it
 * from a server function, never from a component. Client code that needs the
 * filter labels imports ./roster-facets, which is a few hundred bytes.
 */

import { rosterCategories, rosterStates } from "./roster-facets";
import { roster } from "./roster.generated";

export const ROSTER_PAGE_SIZE = 60;

export type RosterGender = "any" | "female" | "male";

export type RosterFilters = {
  /** Category label, or "" for all. */
  category: string;
  /** State label, or "" for anywhere. */
  state: string;
  gender: RosterGender;
  /** Free-text match on the speaker's name. */
  q: string;
  /** 1-based. */
  page: number;
};

export type RosterRow = {
  name: string;
  slug: string;
  categories: string[];
  /** Pre-joined for display, e.g. "NSW · Sydney". Empty when not stated. */
  location: string;
  gender: "female" | "male" | null;
};

export type RosterPage = {
  rows: RosterRow[];
  /** Matches across every page, not just this one. */
  total: number;
  page: number;
  pageCount: number;
};

export const emptyFilters: RosterFilters = {
  category: "",
  state: "",
  gender: "any",
  q: "",
  page: 1,
};

const categoryId = new Map(rosterCategories.map((c, i) => [c, i]));
const stateId = new Map(rosterStates.map((s, i) => [s, i]));

function locationLabel(stateIdx: number[], city: string | undefined): string {
  const names = stateIdx.map((i) => rosterStates[i]).filter((s): s is string => Boolean(s));
  if (!names.length) return city ?? "";
  const head = names.join(" / ");
  return city ? `${head} · ${city}` : head;
}

export function queryRoster(filters: RosterFilters): RosterPage {
  const wantCategory = filters.category ? categoryId.get(filters.category) : undefined;
  const wantState = filters.state ? stateId.get(filters.state) : undefined;
  const wantGender = filters.gender === "female" ? 1 : filters.gender === "male" ? 2 : 0;
  const needle = filters.q.trim().toLowerCase();

  // A filter naming something absent from the facet lists matches nothing,
  // rather than being silently ignored — otherwise a typo'd URL would look
  // like an unfiltered result set.
  const impossible =
    (filters.category !== "" && wantCategory === undefined) ||
    (filters.state !== "" && wantState === undefined);

  const matches = impossible
    ? []
    : roster.filter((e) => {
        if (wantCategory !== undefined && !e.c.includes(wantCategory)) return false;
        if (wantState !== undefined && !e.s.includes(wantState)) return false;
        if (wantGender !== 0 && e.g !== wantGender) return false;
        if (needle && !e.name.toLowerCase().includes(needle)) return false;
        return true;
      });

  const pageCount = Math.max(1, Math.ceil(matches.length / ROSTER_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const start = (page - 1) * ROSTER_PAGE_SIZE;

  return {
    total: matches.length,
    page,
    pageCount,
    rows: matches.slice(start, start + ROSTER_PAGE_SIZE).map((e) => ({
      name: e.name,
      slug: e.slug,
      categories: e.c.map((i) => rosterCategories[i]).filter((c): c is string => Boolean(c)),
      location: locationLabel(e.s, e.city),
      gender: e.g === 1 ? "female" : e.g === 2 ? "male" : null,
    })),
  };
}

/** Total roster size, for the counts quoted on /about and /speakers. */
export const rosterCount = roster.length;

/** Look a roster speaker up by slug, for prefilling an enquiry. */
export function rosterSpeakerName(slug: string): string | null {
  return roster.find((e) => e.slug === slug)?.name ?? null;
}
