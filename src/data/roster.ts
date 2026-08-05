/**
 * Roster query layer.
 *
 * SERVER ONLY — this module pulls in roster.generated.ts (large). Reach it
 * from a server function, never from a component. Client code that needs the
 * filter labels imports ./roster-facets, which is a few hundred bytes.
 */

import { rosterCategories, rosterPlaces } from "./roster-facets";
import { rosterImageSlugs } from "./roster-images.generated";
import { roster } from "./roster.generated";

export const ROSTER_PAGE_SIZE = 60;

export type RosterGender = "any" | "female" | "male" | "nonbinary";

export type RosterFilters = {
  /**
   * Category labels, OR-matched. Empty means all.
   *
   * A list rather than one label because the site's topics do not map 1:1 onto
   * the CSV's categories — "Futurist & AI" covers both "Technology, Future &
   * Innovation" and "AI".
   */
  categories: string[];
  /**
   * A path into the place tree, segments joined with "/", or "" for anywhere.
   * "Europe" matches every European speaker; "Europe/UK/London" just London.
   */
  place: string;
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
  /** Pre-joined for display, e.g. "Australia · NSW · Sydney". Empty when not stated. */
  location: string;
  /** Bitmask: 1 female, 2 male, 4 non-binary. 0 = not recorded. */
  gender: number;
  /** Speaking fee in USD, or null when the source does not state one. */
  fee: number | null;
  /**
   * True when /speakers/<slug> serves a page for this speaker, so the row's
   * name can link to it. Seeded here from the portrait manifest (roster-tier
   * profiles); fetchRoster then augments it against the Supabase speakers
   * table, which serves the other tier of profile.
   */
  hasProfile: boolean;
  /** True when a portrait exists at public/speakers/roster/<slug>.webp. */
  hasImage: boolean;
};

export type RosterPage = {
  rows: RosterRow[];
  /** Matches across every page, not just this one. */
  total: number;
  /**
   * Speakers that match every other filter but have no gender recorded, so a
   * gender filter excludes them. Surfaced rather than swallowed: silently
   * dropping people from a result set is how a directory quietly loses them.
   */
  unrecordedGender: number;
  page: number;
  pageCount: number;
  /**
   * Where the matching speakers are, biggest first, counted at country level.
   * Real figures for the topic pages to quote — concrete numbers are what
   * makes a category page worth citing rather than a list of names.
   */
  places: { name: string; count: number }[];
};

export const emptyFilters: RosterFilters = {
  categories: [],
  place: "",
  gender: "any",
  q: "",
  page: 1,
};

const categoryId = new Map(rosterCategories.map((c, i) => [c, i]));

/**
 * Full path key ("Europe/UK/London") for each place node, built once. Parents
 * precede children in the generated list, so each path extends an earlier one.
 */
const placePath: string[] = [];
for (let i = 0; i < rosterPlaces.length; i++) {
  const node = rosterPlaces[i]!;
  placePath.push(node.p === -1 ? node.n : `${placePath[node.p]}/${node.n}`);
}
const placeIdByPath = new Map(placePath.map((p, i) => [p, i]));

/** Walks a node's parent chain; true when `ancestor` is the node or above it. */
function underPlace(node: number, ancestor: number): boolean {
  for (let cur = node; cur !== -1; cur = rosterPlaces[cur]!.p) {
    if (cur === ancestor) return true;
  }
  return false;
}

/** The country-level label a leaf rolls up to, or the region for root-only rows. */
function countryLabelFor(node: number): string {
  const segs = placePath[node]!.split("/");
  return segs.length === 1 ? segs[0]! : segs[1]!;
}

function locationLabel(placeIdx: number[], city: string | undefined): string {
  const names = placeIdx.map((i) => {
    const path = placePath[i]!.split("/");
    // The region alone for root-level rows ("Global"); otherwise the path
    // below the region, which is what a planner would say out loud.
    return path.length === 1 ? path[0]! : path.slice(1).join(" · ");
  });
  if (!names.length) return city ?? "";
  const head = names.join(" / ");
  return city ? `${head} · ${city}` : head;
}

const genderBit = { female: 1, male: 2, nonbinary: 4 } as const;

const profileSlugs = new Set(rosterImageSlugs);

export function queryRoster(filters: RosterFilters): RosterPage {
  const wantCategories = filters.categories
    .map((c) => categoryId.get(c))
    .filter((id): id is number => id !== undefined);
  const wantPlace = filters.place ? placeIdByPath.get(filters.place) : undefined;
  const wantGender = filters.gender === "any" ? 0 : genderBit[filters.gender];
  const needle = filters.q.trim().toLowerCase();

  // A filter naming something absent from the facet lists matches nothing,
  // rather than being silently ignored — otherwise a typo'd URL would look
  // like an unfiltered result set.
  const impossible =
    (filters.categories.length > 0 && wantCategories.length === 0) ||
    (filters.place !== "" && wantPlace === undefined);

  // Everything except gender, so the gender filter's exclusions can be counted
  // rather than disappearing.
  const beforeGender = impossible
    ? []
    : roster.filter((e) => {
        if (wantCategories.length && !wantCategories.some((id) => e.c.includes(id))) return false;
        if (wantPlace !== undefined && !e.l.some((id) => underPlace(id, wantPlace))) return false;
        if (needle && !e.name.toLowerCase().includes(needle)) return false;
        return true;
      });

  const matches =
    wantGender === 0 ? beforeGender : beforeGender.filter((e) => (e.g & wantGender) !== 0);
  const unrecordedGender =
    wantGender === 0 ? 0 : beforeGender.reduce((n, e) => n + (e.g === 0 ? 1 : 0), 0);

  const size = filters.pageSize ?? ROSTER_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(matches.length / size));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const start = (page - 1) * size;

  const placeCounts = new Map<string, number>();
  for (const e of matches) {
    const seen = new Set<string>();
    for (const i of e.l) {
      const name = countryLabelFor(i);
      if (!seen.has(name)) {
        seen.add(name);
        placeCounts.set(name, (placeCounts.get(name) ?? 0) + 1);
      }
    }
  }

  return {
    total: matches.length,
    unrecordedGender,
    page,
    pageCount,
    places: [...placeCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    rows: matches.slice(start, start + size).map((e) => ({
      name: e.name,
      slug: e.slug,
      categories: e.c.map((i) => rosterCategories[i]).filter((c): c is string => Boolean(c)),
      location: locationLabel(e.l, e.city),
      gender: e.g,
      fee: e.f ?? null,
      hasProfile: profileSlugs.has(e.slug),
      hasImage: profileSlugs.has(e.slug),
    })),
  };
}

/** Total roster size, for the counts quoted on /about and /speakers. */
export const rosterCount = roster.length;

/** Look a roster speaker up by slug, for prefilling an enquiry. */
export function rosterSpeakerName(slug: string): string | null {
  return roster.find((e) => e.slug === slug)?.name ?? null;
}

export type RosterStats = {
  total: number;
  /** Speakers per region, biggest first. */
  regions: { name: string; count: number }[];
  /** Top countries (depth-2 nodes), biggest first. */
  countries: { name: string; count: number }[];
  /** True number of countries and categories, before the lists are trimmed. */
  countryCount: number;
  categoryCount: number;
  /** Speakers per category, biggest first. */
  categories: { name: string; count: number }[];
  gender: { female: number; male: number; nonbinary: number; unrecorded: number };
  /** Share of speakers with a stated speaking fee. */
  withFee: number;
};

/**
 * Directory-wide statistics for /speaker-statistics. Computed from the live
 * roster so every figure on that page stays true after the next import.
 */
export function rosterStats(): RosterStats {
  const regionCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const gender = { female: 0, male: 0, nonbinary: 0, unrecorded: 0 };
  let withFee = 0;

  for (const e of roster) {
    const regions = new Set<string>();
    const countries = new Set<string>();
    for (const i of e.l) {
      const segs = placePath[i]!.split("/");
      regions.add(segs[0]!);
      if (segs.length > 1) countries.add(segs[1]!);
    }
    for (const r of regions) regionCounts.set(r, (regionCounts.get(r) ?? 0) + 1);
    for (const c of countries) countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
    for (const i of e.c) {
      const name = rosterCategories[i];
      if (name) categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
    }
    if (e.g === 0) gender.unrecorded++;
    if (e.g & 1) gender.female++;
    if (e.g & 2) gender.male++;
    if (e.g & 4) gender.nonbinary++;
    if (e.f !== undefined) withFee++;
  }

  const sorted = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    total: roster.length,
    regions: sorted(regionCounts),
    countries: sorted(countryCounts).slice(0, 15),
    countryCount: countryCounts.size,
    categoryCount: categoryCounts.size,
    categories: sorted(categoryCounts).slice(0, 15),
    gender,
    withFee,
  };
}

export type RosterProfile = {
  name: string;
  slug: string;
  categories: string[];
  location: string;
  fee: number | null;
  /** Roster speakers who share this speaker's first category, for the rail. */
  similar: RosterRow[];
};

/**
 * A roster speaker's profile, or null when they have no uploaded portrait —
 * the portrait is what turns a roster row into a page worth publishing.
 */
export function rosterProfile(slug: string): RosterProfile | null {
  if (!profileSlugs.has(slug)) return null;
  const e = roster.find((r) => r.slug === slug);
  if (!e) return null;
  const categories = e.c.map((i) => rosterCategories[i]).filter((c): c is string => Boolean(c));
  const similar = categories.length
    ? queryRoster({
        ...emptyFilters,
        categories: [categories[0]!],
        pageSize: 7,
      }).rows.filter((r) => r.slug !== slug)
    : [];
  return {
    name: e.name,
    slug: e.slug,
    categories,
    location: locationLabel(e.l, e.city),
    fee: e.f ?? null,
    similar: similar.slice(0, 6),
  };
}
