/**
 * Canonical origin for absolute URLs.
 *
 * Open Graph, canonical links and schema.org all expect absolute URLs — a
 * relative `og:url` is ignored by every crawler that reads it. Override per
 * environment with VITE_SITE_URL (no trailing slash).
 */
const FALLBACK_ORIGIN = "https://summonspeakers.com";

export const SITE_URL = String(import.meta.env["VITE_SITE_URL"] ?? FALLBACK_ORIGIN).replace(
  /\/+$/,
  "",
);

/** Turn an app path such as `/speakers/maya` into a full https:// URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Fallback share card, inherited from the root route by anything without its own. */
export const OG_IMAGE = absoluteUrl("/og/default.png");

/**
 * Per-page share card, pre-rendered by scripts/build-og-images.ts.
 * Pass the card slug; unknown slugs would 404, so only pass ones the script emits.
 */
export function ogImage(slug: string): string {
  return absoluteUrl(`/og/${slug}.png`);
}

/** The three og:image tags a page needs, so callers cannot set width without height. */
export function ogImageMeta(slug: string) {
  const url = ogImage(slug);
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:image", content: url },
  ];
}

const BRAND = "SummonSpeakers";
/** Google truncates around 60 characters; past that the tail is wasted. */
const TITLE_LIMIT = 60;

/**
 * Compose "<lead> | SummonSpeakers", falling back through shorter leads until
 * one fits. Data-driven titles blow the limit unpredictably — a speaker's name
 * plus their role plus a fee band ran to 92 characters — so the caller supplies
 * candidates from most to least informative and this picks the best that fits.
 */
export function pageTitle(...leads: string[]): string {
  const suffix = ` | ${BRAND}`;
  for (const lead of leads) {
    if (lead && lead.length + suffix.length <= TITLE_LIMIT) return lead + suffix;
  }
  // Nothing fit: trim the last (shortest) candidate rather than drop the brand.
  const last = leads[leads.length - 1] ?? BRAND;
  return last.slice(0, TITLE_LIMIT - suffix.length - 1).trimEnd() + "…" + suffix;
}

/**
 * JSON for an inline <script> body. JSON.stringify alone is not safe there:
 * the framework injects script children without HTML-escaping (escaping would
 * corrupt the JSON), so a "</script>" inside any string — speaker bios come
 * from a database that other tools write to — would close the tag and turn
 * the rest of the value into markup. Escaping "<" keeps the JSON identical
 * to a parser and inert to the HTML tokenizer.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
