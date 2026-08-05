/**
 * robots.txt bodies, and the decision about which one a host gets.
 *
 * Separate from the route so the host rule can be tested directly — the route
 * handler needs a running server, and this is the part with the logic in it.
 */

import { absoluteUrl, SITE_URL } from "./site";

/**
 * The AI search crawlers are named explicitly rather than left to ride the
 * `*` rule: being citable in AI answers is a distribution channel for this
 * site, and an explicit Allow survives any future tightening of the wildcard.
 * GPTBot/ChatGPT-User are OpenAI, PerplexityBot is Perplexity, ClaudeBot and
 * anthropic-ai are Anthropic, and Google-Extended gates Gemini and AI
 * Overviews.
 */
const AGENTS = [
  "Googlebot",
  "Bingbot",
  "Twitterbot",
  "facebookexternalhit",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "*",
];

export function allowAllRobots(): string {
  return `${AGENTS.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n")}

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

export function disallowAllRobots(host: string): string {
  return `# ${host} is not the canonical host for this site.
# The site lives at ${SITE_URL}.

User-agent: *
Disallow: /
`;
}

/**
 * True when this host is a Vercel-assigned hostname that is not the canonical
 * one — summonspeakers.vercel.app, which stays a Production alias and stays
 * crawlable, plus every preview deployment URL. Each serves the whole site, so
 * each is a full duplicate competing with it. A canonical tag is a hint a
 * crawler may ignore; robots.txt is a directive.
 *
 * Deliberately limited to *.vercel.app rather than "any host that isn't
 * canonical". SITE_URL is inlined at build time and the serving host is decided
 * by DNS, so the two can disagree — and the broader rule would then answer
 * Disallow on the live domain and pull the whole site out of the index. A custom
 * domain is never the risk this guards against anyway: it either serves the site
 * (canonical) or redirects to the host that does, and a redirecting host never
 * reaches this code.
 */
export function isOffCanonicalHost(host: string): boolean {
  if (!host) return false;
  const bare = host.replace(/:\d+$/, "").toLowerCase();
  if (!bare.endsWith(".vercel.app")) return false;
  try {
    return bare !== new URL(SITE_URL).host.replace(/:\d+$/, "").toLowerCase();
  } catch {
    // No trustworthy canonical to compare against: leave the alias crawlable
    // rather than guess. Over-indexing is recoverable; a deindexed site is not.
    return false;
  }
}

export function robotsFor(host: string): string {
  return isOffCanonicalHost(host) ? disallowAllRobots(host) : allowAllRobots();
}
