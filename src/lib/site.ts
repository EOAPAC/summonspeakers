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

/** Social share card. Referenced from the root route so every page inherits it. */
export const OG_IMAGE = absoluteUrl("/og-default.png");
