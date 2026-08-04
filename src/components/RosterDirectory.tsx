import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { rosterCategories, rosterStates } from "@/data/roster-facets";
import type { RosterGender, RosterPage } from "@/data/roster";

export type RosterSearch = {
  category?: string;
  state?: string;
  gender?: RosterGender;
  q?: string;
  page?: number;
};

const controlClass =
  "min-h-[44px] w-full rounded-full border border-[var(--line-2)] bg-surface px-4 text-sm";

const genders: { value: RosterGender; label: string }[] = [
  { value: "any", label: "Any gender" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

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
 * the server, which is how the 2,131-row dataset stays out of the browser.
 */
export function RosterDirectory({ data, search }: { data: RosterPage; search: RosterSearch }) {
  const navigate = useNavigate();
  const { rows, total, page, pageCount } = data;
  const [draftQuery, setDraftQuery] = useState(search.q ?? "");

  // Any filter change resets to page 1 — staying on page 9 of a result set that
  // now has two pages just shows an empty list.
  const withFilters = (next: Partial<RosterSearch>): RosterSearch =>
    tidy({ ...search, ...next, ...("page" in next ? {} : { page: 1 }) });

  const apply = (next: Partial<RosterSearch>) =>
    navigate({ to: "/speakers", search: withFilters(next) });

  const active = [
    search.category ? { label: search.category, clear: withFilters({ category: "" }) } : null,
    search.state ? { label: search.state, clear: withFilters({ state: "" }) } : null,
    search.gender && search.gender !== "any"
      ? {
          label: search.gender === "female" ? "Female" : "Male",
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
          <label htmlFor="r-state" className="label-mono mb-2 block text-[var(--ink-3)]">
            Location
          </label>
          <select
            id="r-state"
            className={controlClass}
            value={search.state ?? ""}
            onChange={(e) => apply({ state: e.target.value })}
          >
            <option value="">Anywhere</option>
            {rosterStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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
        <p className="label-mono text-[var(--ink-3)]" aria-live="polite">
          {total.toLocaleString("en-AU")} {total === 1 ? "SPEAKER" : "SPEAKERS"}
          {pageCount > 1 && ` · PAGE ${page} OF ${pageCount}`}
        </p>
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
        <ul className="border-t border-[var(--ink)]">
          {rows.map((r) => (
            <li
              key={r.slug}
              className="grid gap-3 border-b border-[var(--line)] py-6 md:grid-cols-[1.1fr_1.4fr_auto] md:items-baseline md:gap-8"
            >
              <p className="text-lg font-semibold tracking-[-0.02em]">{r.name}</p>
              <div>
                <p className="text-sm text-[var(--ink-2)]">
                  {r.categories.slice(0, 4).join(" · ") || "Category to be confirmed"}
                  {r.categories.length > 4 && ` +${r.categories.length - 4} more`}
                </p>
                {r.location && <p className="label-mono mt-2 text-[var(--ink-3)]">{r.location}</p>}
              </div>
              <Link
                to="/get-matched"
                search={{ speaker: r.slug }}
                className="label-mono inline-flex min-h-[44px] items-center gap-2 justify-self-start rounded-full border border-[var(--line-2)] px-4 transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
              >
                Enquire <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
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
