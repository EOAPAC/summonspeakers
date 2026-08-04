import { useMemo, useState } from "react";
import { SpeakerCard } from "./SpeakerCard";
import type { Speaker } from "@/data/speakers";
import { topics as allTopics } from "@/data/speakers";

/**
 * Match when the speaker's band overlaps the filter band at all.
 *
 * Testing fee_max on one band and fee_min on the others used to drop anyone
 * straddling a boundary — a $9k–$13k speaker matched neither "Under $10k" nor
 * "$10k – $20k" and was reachable only through "Any fee".
 */
const overlaps = (min: number, max: number) => (s: Speaker) =>
  !s.fee_on_application && s.fee_min <= max && s.fee_max >= min;

const feeBands = [
  { id: "any", label: "Any fee", test: () => true },
  { id: "under-10", label: "Under $10k", test: overlaps(0, 9999) },
  { id: "10-20", label: "$10k – $20k", test: overlaps(10000, 19999) },
  { id: "20-plus", label: "$20k+", test: overlaps(20000, Number.MAX_SAFE_INTEGER) },
];

const selectClass =
  "min-h-[44px] w-full rounded-full border border-[var(--line-2)] bg-surface px-4 text-sm";

export function SpeakerDirectory({
  speakers,
  lockedTopic,
}: {
  speakers: Speaker[];
  lockedTopic?: string;
}) {
  const [topic, setTopic] = useState("any");
  const [fee, setFee] = useState("any");
  const [location, setLocation] = useState("any");
  const [availableOnly, setAvailableOnly] = useState(false);

  const locations = useMemo(
    () => Array.from(new Set(speakers.map((s) => s.location.split(" · ")[0]))).sort(),
    [speakers],
  );

  const filtered = speakers.filter((s) => {
    if (topic !== "any" && !s.topics.includes(topic)) return false;
    const band = feeBands.find((b) => b.id === fee)!;
    if (!band.test(s)) return false;
    if (location !== "any" && !s.location.startsWith(location)) return false;
    if (availableOnly && !s.available) return false;
    return true;
  });

  return (
    <div>
      <div className="hairline-top flex flex-wrap items-end gap-4 py-6">
        {!lockedTopic && (
          <div className="min-w-[180px] flex-1">
            <label htmlFor="f-topic" className="label-mono mb-2 block text-[var(--ink-3)]">
              Topic
            </label>
            <select
              id="f-topic"
              className={selectClass}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="any">All topics</option>
              {allTopics.map((t) => (
                <option key={t.slug} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="min-w-[180px] flex-1">
          <label htmlFor="f-fee" className="label-mono mb-2 block text-[var(--ink-3)]">
            Fee range
          </label>
          <select
            id="f-fee"
            className={selectClass}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          >
            {feeBands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px] flex-1">
          <label htmlFor="f-loc" className="label-mono mb-2 block text-[var(--ink-3)]">
            Location
          </label>
          <select
            id="f-loc"
            className={selectClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="any">Anywhere</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-[44px] items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-black"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available only
        </label>
      </div>

      <p className="label-mono py-4 text-[var(--ink-3)]" aria-live="polite">
        {filtered.length} SPEAKERS
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-[var(--ink-2)]">
          No speakers match those filters. Widen the fee range or clear the location.
        </p>
      ) : (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SpeakerCard key={s.slug} speaker={s} />
          ))}
        </div>
      )}
    </div>
  );
}
