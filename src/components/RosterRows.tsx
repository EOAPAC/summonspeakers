import { Link } from "@tanstack/react-router";

import type { RosterRow } from "@/data/roster";

/**
 * The roster row, shared by /speakers and the topic pages so a speaker looks
 * the same wherever they are listed.
 *
 * Rows are not links: these speakers have no profile page. The enquiry link is
 * the action, and it carries the slug so /get-matched can prefill the name.
 */
export function RosterRows({ rows }: { rows: RosterRow[] }) {
  return (
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
          <div className="flex items-baseline gap-5 md:flex-col md:items-end md:gap-3">
            {r.fee !== null && (
              <p className="label-mono whitespace-nowrap">${r.fee.toLocaleString("en-US")}</p>
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
      ))}
    </ul>
  );
}
