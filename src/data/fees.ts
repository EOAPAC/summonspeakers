/**
 * Single source of truth for published fee bands.
 *
 * The /speaker-fees table and the per-topic FAQ both read from here, so the
 * two can never quote different numbers for the same question again.
 */

export type Bands = { emerging: string; established: string; celebrity: string };

/** Topics we publish bands for. A topic absent from this map gets no fee claim. */
export const feeBands = {
  Motivational: { emerging: "$3k – $7k", established: "$9k – $18k", celebrity: "$35k – $75k" },
  Leadership: { emerging: "$4k – $8k", established: "$12k – $22k", celebrity: "$40k – $90k" },
  Business: { emerging: "$4k – $9k", established: "$10k – $20k", celebrity: "$35k – $80k" },
  "Futurist & AI": {
    emerging: "$5k – $10k",
    established: "$15k – $30k",
    celebrity: "$45k – $120k",
  },
} satisfies Record<string, Bands>;

export type FeeColumn = keyof typeof feeBands;
export const feeColumns = Object.keys(feeBands) as FeeColumn[];

export const tierOrder = ["emerging", "established", "celebrity"] as const;
export const tierLabels: Record<(typeof tierOrder)[number], string> = {
  emerging: "Emerging",
  established: "Established",
  celebrity: "Celebrity",
};

/** Table rows for /speaker-fees, derived from the same map. */
export const feeTiers = tierOrder.map((key) => ({
  tier: tierLabels[key],
  cells: feeColumns.map((col) => feeBands[col][key]),
}));

export function bandsForTopic(topicName: string): Bands | null {
  return (feeBands as Record<string, Bands>)[topicName] ?? null;
}

const spell = (band: string) =>
  band.replace(/\$(\d+)k/g, (_, n: string) => `$${Number(n).toLocaleString()},000`);

const floor = (band: string) => spell(band.split("–")[0]!.trim());

/**
 * The "how much do X speakers cost?" answer, generated from the bands above.
 * Returns null when we publish no bands for the topic — omit rather than guess.
 */
export function feeAnswerForTopic(topicName: string): string | null {
  const b = bandsForTopic(topicName);
  if (!b) return null;
  return (
    `${topicName} speakers on SummonSpeakers run from ${floor(b.emerging)} for emerging voices ` +
    `to ${spell(b.established)} for established names with a book or a track record. ` +
    `Recognisable, broadcast-level names start around ${floor(b.celebrity)}. ` +
    `Every band on this page is published, so you can shortlist inside your budget before contacting anyone.`
  );
}
