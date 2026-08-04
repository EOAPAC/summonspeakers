import { Link } from "@tanstack/react-router";
import { FeeBand } from "./FeeBand";
import type { Speaker } from "@/data/speakers";

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <article>
      {/* A real anchor, not a click handler: these profiles are the pages that
          need to be crawled, and an onClick card is invisible to a crawler. */}
      <Link to="/speakers/$slug" params={{ slug: speaker.slug }} className="group block text-left">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-media)]">
          <div className="hatch absolute inset-0 transition-transform duration-1000 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]" />
          <div className="absolute inset-0 flex items-end p-4">
            <span className="label-mono text-[var(--ink-3)]">Speaker portrait</span>
          </div>
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-ink text-surface opacity-0 transition-all duration-500 [transition-timing-function:var(--ease)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            ↗
          </span>
        </div>
        <div className="hairline-top mt-4 flex items-baseline justify-between gap-4 pt-3">
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em]">{speaker.name}</h3>
            <p className="mt-1 text-sm text-[var(--ink-2)]">{speaker.role}</p>
          </div>
          <FeeBand
            feeMin={speaker.fee_min}
            feeMax={speaker.fee_max}
            onApplication={speaker.fee_on_application}
            available={speaker.available}
            className="shrink-0"
          />
        </div>
      </Link>
    </article>
  );
}
