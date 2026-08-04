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
  /**
   * Category labels, OR-matched. Empty means all.
   *
   * A list rather than one label because the site's topics do not map 1:1 onto
   * the CSV's categories — "Futurist & AI" covers both "Technology, Future &
   * Innovation" and "AI".
   */
  categories: string[];
  /** State label, or "" for anywhere. */
  state: string;
  gender: RosterGender;
  /** Free-text match on the speaker's name. */
  q: string;
  /** 1-based. */
  page: number;
  /** Rows per page. Topic pages show a shorter preview than /speakers. */
  pageSize?: number;
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
  /**
   * Where the matching speakers are, biggest first. Real figures for the topic
   * pages to quote — concrete numbers are what makes a category page worth
   * citing rather than a list of names.
   */
  states: { name: string; count: number }[];
};

export const emptyFilters: RosterFilters = {
  categories: [],
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
  const wantCategories = filters.categories
    .map((c) => categoryId.get(c))
    .filter((id): id is number => id !== undefined);
  const wantState = filters.state ? stateId.get(filters.state) : undefined;
  const wantGender = filters.gender === "female" ? 1 : filters.gender === "male" ? 2 : 0;
  const needle = filters.q.trim().toLowerCase();

  // A filter naming something absent from the facet lists matches nothing,
  // rather than being silently ignored — otherwise a typo'd URL would look
  // like an unfiltered result set.
  const impossible =
    (filters.categories.length > 0 && wantCategories.length === 0) ||
    (filters.state !== "" && wantState === undefined);

  const matches = impossible
    ? []
    : roster.filter((e) => {
        if (wantCategories.length && !wantCategories.some((id) => e.c.includes(id))) return false;
        if (wantState !== undefined && !e.s.includes(wantState)) return false;
        if (wantGender !== 0 && e.g !== wantGender) return false;
        if (needle && !e.name.toLowerCase().includes(needle)) return false;
        return true;
      });

  const size = filters.pageSize ?? ROSTER_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(matches.length / size));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const start = (page - 1) * size;

  const stateCounts = new Map<string, number>();
  for (const e of matches) {
    for (const i of e.s) {
      const name = rosterStates[i];
      if (name) stateCounts.set(name, (stateCounts.get(name) ?? 0) + 1);
    }
  }

  return {
    total: matches.length,
    page,
    pageCount,
    states: [...stateCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    rows: matches.slice(start, start + size).map((e) => ({
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
