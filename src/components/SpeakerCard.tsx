import { useNavigate } from "@tanstack/react-router";
import { FeeBand } from "./FeeBand";
import type { Speaker } from "@/data/speakers";

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/speakers/$slug", params: { slug: speaker.slug } });

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${speaker.name}, ${speaker.role}`}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      }}
      className="group block cursor-pointer text-left"
    >
      <div className="relative overflow-hidden rounded-[var(--radius-media)] aspect-[4/3]">
        <div className="hatch absolute inset-0 transition-transform duration-1000 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 flex items-end p-4">
          <span className="label-mono text-[var(--ink-3)]">Speaker portrait</span>
        </div>
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-ink text-surface opacity-0 transition-all duration-500 [transition-timing-function:var(--ease)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100"
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
    </article>
  );
}
