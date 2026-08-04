import { describe, expect, test } from "bun:test";

import { isOffCanonicalHost, robotsFor } from "./robots";

/**
 * The stakes are lopsided: leaving an alias crawlable costs some duplicate
 * indexing, while blocking the real domain takes the whole site out of search.
 * So the cases that matter most here are the ones asserting a host is NOT
 * blocked.
 */
describe("robots host rule", () => {
  test("the canonical host serves the permissive file with a sitemap", () => {
    const body = robotsFor("summonspeakers.com");
    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow: /");
    expect(body).toContain("Sitemap: https://summonspeakers.com/sitemap.xml");
  });

  test("a real domain is never blocked, even when it is not the canonical one", () => {
    // SITE_URL is inlined at build time and the serving host comes from DNS, so
    // the two can disagree. That disagreement must not deindex a live domain.
    expect(isOffCanonicalHost("www.summonspeakers.com")).toBe(false);
    expect(isOffCanonicalHost("summonspeakers.com.au")).toBe(false);
    expect(isOffCanonicalHost("notvercel.app")).toBe(false);
  });

  test("non-canonical vercel.app hosts are disallowed", () => {
    for (const host of [
      "summonspeakers.vercel.app",
      "summonspeakers-git-branch-eoapac.vercel.app",
      "summonspeakers-abc123.vercel.app",
    ]) {
      expect(isOffCanonicalHost(host)).toBe(true);
      expect(robotsFor(host)).toContain("Disallow: /");
    }
  });

  test("case and port do not defeat the match", () => {
    expect(isOffCanonicalHost("SummonSpeakers.Vercel.App")).toBe(true);
    expect(isOffCanonicalHost("summonspeakers.vercel.app:443")).toBe(true);
  });

  test("local and missing hosts fall through to permissive", () => {
    for (const host of ["localhost:3000", "127.0.0.1:4322", ""]) {
      expect(isOffCanonicalHost(host)).toBe(false);
    }
  });

  test("the disallow body names the canonical site, so the cause is obvious", () => {
    const body = robotsFor("summonspeakers.vercel.app");
    expect(body).toContain("summonspeakers.vercel.app");
    expect(body).toContain("https://summonspeakers.com");
  });
});
