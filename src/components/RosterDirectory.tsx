import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { RosterRows } from "./RosterRows";
import { rosterCategories, rosterPlaces } from "@/data/roster-facets";
import type { RosterGender, RosterPage } from "@/data/roster";

export type RosterSearch = {
  category?: string;
  /** A path into the place tree, segments joined with "/", e.g. "Europe/UK". */
  place?: string;
  gender?: RosterGender;
  q?: string;
  page?: number;
  /**
   * A topic slug, which expands server-side to that topic's full category
   * mapping. Needed because a topic can span several roster categories —
   * "Motivational" covers both Motivational and Inspirational — and a single
   * `category` value cannot express that, which made "See all 808" land on a
   * page showing 625.
   */
  topic?: string;
};

const controlClass =
  "min-h-[44px] w-full rounded-full border border-[var(--line-2)] bg-surface px-4 text-sm";

const genders: { value: RosterGender; label: string }[] = [
  { value: "any", label: "Any gender" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
];

/**
 * The location dropdown, built from the place tree: each region is an
 * optgroup, its countries are options, and areas (US states, AU states,
 * London) indent under their country. One nested control rather than three
 * cascading ones — nothing moves around the page when a region is picked.
 */
type PlaceOption = { value: string; label: string; depth: number };
type PlaceGroup = { label: string; options: PlaceOption[] };

const placeGroups: PlaceGroup[] = (() => {
  const path: string[] = [];
  for (const node of rosterPlaces) {
    path.push(node.p === -1 ? node.n : `${path[node.p]}/${node.n}`);
  }
  // Depth-first, so each country's areas sit directly under it.
  function optionsUnder(parent: number, depth: number): PlaceOption[] {
    const out: PlaceOption[] = [];
    rosterPlaces.forEach((node, i) => {
      if (node.p !== parent) return;
      out.push({ value: path[i]!, label: node.n, depth });
      out.push(...optionsUnder(i, depth + 1));
    });
    return out;
  }
  const groups: PlaceGroup[] = [];
  rosterPlaces.forEach((node, i) => {
    if (node.p !== -1) return;
    groups.push({
      label: node.n,
      options: [
        { value: path[i]!, label: node.n === "Global" ? "Global" : `All ${node.n}`, depth: 0 },
        ...optionsUnder(i, 1),
      ],
    });
  });
  return groups;
})();

/** Last path segment, for the removable filter chip. */
function placeLabel(place: string): string {
  const segs = place.split("/");
  return segs[segs.length - 1] ?? place;
}

/** Drop defaults so a URL only ever carries the filters actually in use. */
function tidy(search: RosterSearch): RosterSearch {
  return Object.fromEntries(
    Object.entries(search).filter(
      ([k, v]) => v !== "" && v !== undefined && v !== "any" && !(k === "page" && v === 1),
    ),
  ) as RosterSearch;
}

/**
 * Filters live in the URL rather than component state, so a filtered view is
 * shareable and server-rendered. Each change navigates; the loader re-queries on
 * the server, which is how the multi-thousand-row dataset stays out of the browser.
 */
export function RosterDirectory({
  data,
  search,
  topicLabel,
}: {
  data: RosterPage;
  search: RosterSearch;
  /** Display name for an active `topic` param, shown as a removable chip. */
  topicLabel?: string | undefined;
}) {
  const navigate = useNavigate();
  const { rows, total, page, pageCount } = data;
  const [draftQuery, setDraftQuery] = useState(search.q ?? "");

  // Any filter change resets to page 1 — staying on page 9 of a result set that
  // now has two pages just shows an empty list. Picking a category also drops an
  // active topic, since the two would otherwise both constrain the query.
  const withFilters = (next: Partial<RosterSearch>): RosterSearch =>
    tidy({
      ...search,
      ...("category" in next ? { topic: "" } : {}),
      ...next,
      ...("page" in next ? {} : { page: 1 }),
    });

  const apply = (next: Partial<RosterSearch>) =>
    navigate({ to: "/speakers", search: withFilters(next) });

  const active = [
    topicLabel ? { label: topicLabel, clear: withFilters({ topic: "" }) } : null,
    search.category ? { label: search.category, clear: withFilters({ category: "" }) } : null,
    search.place ? { label: placeLabel(search.place), clear: withFilters({ place: "" }) } : null,
    search.gender && search.gender !== "any"
      ? {
          label: genders.find((g) => g.value === search.gender)?.label ?? search.gender,
          clear: withFilters({ gender: "any" }),
        }
      : null,
    search.q ? { label: `“${search.q}”`, clear: withFilters({ q: "" }) } : null,
  ].filter((a): a is { label: string; clear: RosterSearch } => a !== null);

  return (
    <div>
      <div className="hairline-top grid gap-4 py-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply({ q: draftQuery.trim() });
          }}
        >
          <label htmlFor="r-q" className="label-mono mb-2 block text-[var(--ink-3)]">
            Search by name
          </label>
          <input
            id="r-q"
            type="search"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder="Any speaker"
            className={controlClass}
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        <div>
          <label htmlFor="r-category" className="label-mono mb-2 block text-[var(--ink-3)]">
            Category
          </label>
          <select
            id="r-category"
            className={controlClass}
            value={search.category ?? ""}
            onChange={(e) => apply({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {rosterCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="r-place" className="label-mono mb-2 block text-[var(--ink-3)]">
            Location
          </label>
          <select
            id="r-place"
            className={controlClass}
            value={search.place ?? ""}
            onChange={(e) => apply({ place: e.target.value })}
          >
            <option value="">Anywhere</option>
            {placeGroups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {"  ".repeat(o.depth) + o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="r-gender" className="label-mono mb-2 block text-[var(--ink-3)]">
            Gender
          </label>
          <select
            id="r-gender"
            className={controlClass}
            value={search.gender ?? "any"}
            onChange={(e) => apply({ gender: e.target.value as RosterGender })}
          >
            {genders.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="label-mono text-[var(--ink-3)]" aria-live="polite">
            {total.toLocaleString("en-AU")} {total === 1 ? "SPEAKER" : "SPEAKERS"}
            {pageCount > 1 && ` · PAGE ${page} OF ${pageCount}`}
          </p>
          {/* Say so rather than let them vanish: a gender filter cannot include
              a speaker whose gender the source never recorded. */}
          {data.unrecordedGender > 0 && (
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              {data.unrecordedGender}{" "}
              {data.unrecordedGender === 1 ? "speaker has" : "speakers have"} no gender recorded and{" "}
              {data.unrecordedGender === 1 ? "is" : "are"} not shown.{" "}
              <Link
                to="/speakers"
                search={withFilters({ gender: "any" })}
                className="underline underline-offset-4"
              >
                Include them
              </Link>
            </p>
          )}
        </div>
        {active.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2">
            {active.map((a) => (
              <li key={a.label}>
                <Link
                  to="/speakers"
                  search={a.clear}
                  className="label-mono inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[var(--line-2)] px-3 transition-colors hover:bg-ink hover:text-surface"
                >
                  {a.label} <span aria-hidden="true">×</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/speakers"
                className="label-mono inline-flex min-h-[36px] items-center underline underline-offset-4"
              >
                Clear all
              </Link>
            </li>
          </ul>
        )}
      </div>

      {total === 0 ? (
        <p className="max-w-[60ch] py-16 text-[var(--ink-2)]">
          No speakers match those filters.{" "}
          <Link to="/speakers" className="underline underline-offset-4">
            Clear them
          </Link>{" "}
          and try a broader category, or{" "}
          <Link to="/get-matched" className="underline underline-offset-4">
            tell us about your event
          </Link>{" "}
          and we&rsquo;ll shortlist for you.
        </p>
      ) : (
        <RosterRows rows={rows} />
      )}

      {pageCount > 1 && (
        <nav aria-label="Roster pages" className="flex items-center justify-between gap-4 pt-10">
          {page > 1 ? (
            <Link
              to="/speakers"
              search={withFilters({ page: page - 1 })}
              className="label-mono inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line-2)] px-5 transition-colors hover:bg-ink hover:text-surface"
            >
              <span aria-hidden="true">←</span> Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="label-mono text-[var(--ink-3)]">
            {page} / {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              to="/speakers"
              search={withFilters({ page: page + 1 })}
              className="label-mono inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line-2)] px-5 transition-colors hover:bg-ink hover:text-surface"
            >
              Next <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
