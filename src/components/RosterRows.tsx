import { Link } from "@tanstack/react-router";

import type { RosterRow } from "@/data/roster";

/** "A. Wess Mitchell" -> "AM", "Cher" -> "C". */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * The roster row, shared by /speakers and the topic pages so a speaker looks
 * the same wherever they are listed.
 *
 * Layout: portrait or monogram anchors the eye, name and location form the
 * identity column, categories sit as quiet chips, and the fee — the thing the
 * whole site promises upfront — holds the right edge with the enquiry action
 * under it. A speaker with an uploaded portrait has a profile page, so their
 * name and picture link to it; everyone else's action is the enquiry.
 */
export function RosterRows({ rows }: { rows: RosterRow[] }) {
  return (
    <ul className="border-t border-[var(--ink)]">
      {rows.map((r) => {
        const portrait = r.hasProfile ? (
          <img
            src={`/speakers/roster/${r.slug}.webp`}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="size-12 shrink-0 rounded-full bg-[var(--surface-alt)] object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="hatch flex size-12 shrink-0 items-center justify-center rounded-full"
          >
            <span className="label-mono text-[var(--ink-3)]">{initials(r.name)}</span>
          </span>
        );

        return (
          <li
            key={r.slug}
            className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b border-[var(--line)] py-5 md:grid-cols-[auto_1.2fr_1.4fr_auto] md:gap-x-6"
          >
            {portrait}
            <div className="min-w-0">
              {r.hasProfile ? (
                <Link
                  to="/speakers/$slug"
                  params={{ slug: r.slug }}
                  className="text-lg font-semibold tracking-[-0.02em] underline-offset-4 hover:underline"
                >
                  {r.name}
                </Link>
              ) : (
                <p className="text-lg font-semibold tracking-[-0.02em]">{r.name}</p>
              )}
              {r.location && (
                <p className="label-mono mt-1.5 truncate text-[var(--ink-3)]">{r.location}</p>
              )}
            </div>
            <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1">
              {r.categories.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border border-[var(--line-2)] px-3 py-1.5 text-xs text-[var(--ink-2)]"
                >
                  {c}
                </span>
              ))}
              {r.categories.length > 3 && (
                <span className="inline-flex items-center px-1 py-1.5 text-xs text-[var(--ink-3)]">
                  +{r.categories.length - 3} more
                </span>
              )}
              {r.categories.length === 0 && (
                <span className="inline-flex items-center py-1.5 text-xs text-[var(--ink-3)]">
                  Category to be confirmed
                </span>
              )}
            </div>
            <div className="col-span-2 flex items-center justify-between gap-5 md:col-span-1 md:flex-col md:items-end md:justify-center md:gap-2">
              {r.fee !== null ? (
                <p className="whitespace-nowrap font-semibold tracking-[-0.02em]">
                  ${r.fee.toLocaleString("en-US")}
                </p>
              ) : (
                <p className="label-mono whitespace-nowrap text-[var(--ink-3)]">Fee on enquiry</p>
              )}
              <Link
                to="/get-matched"
                search={{ speaker: r.slug }}
                className="label-mono inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line-2)] px-4 transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
              >
                Enquire <span aria-hidden="true">→</span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
