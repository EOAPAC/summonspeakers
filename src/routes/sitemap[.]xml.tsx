import { createFileRoute } from "@tanstack/react-router";

import { caseStudies, posts } from "@/data/editorial";
import { topics } from "@/data/speakers";
import { fetchSpeakers } from "@/lib/speakers.server";
import { absoluteUrl } from "@/lib/site";

type Entry = { path: string; priority: string; lastmod?: string };

/**
 * Generated from the same data the pages render from, so a new topic or post
 * is in the sitemap the moment it exists. The full-profile speakers come from
 * Supabase, so this is now async — nothing else here needed to be.
 */
async function entries(): Promise<Entry[]> {
  const speakers = await fetchSpeakers();
  return [
    { path: "/", priority: "1.0" },
    { path: "/speakers", priority: "0.9" },
    { path: "/speaker-fees", priority: "0.9" },
    { path: "/get-matched", priority: "0.8" },
    { path: "/how-it-works", priority: "0.7" },
    { path: "/for-speakers", priority: "0.7" },
    { path: "/for-speakers/join", priority: "0.6" },
    { path: "/about", priority: "0.6" },
    { path: "/blog", priority: "0.6" },
    { path: "/case-studies", priority: "0.6" },
    ...topics.map((t) => ({ path: `/topics/${t.slug}`, priority: "0.8" })),
    ...speakers.map((s) => ({ path: `/speakers/${s.slug}`, priority: "0.9" })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: "0.5", lastmod: p.iso })),
    ...caseStudies.map((c) => ({ path: `/case-studies/${c.slug}`, priority: "0.5" })),
  ];
}

async function renderSitemap(): Promise<string> {
  const urls = (await entries())
    .map(({ path, priority, lastmod }) =>
      [
        "  <url>",
        `    <loc>${absoluteUrl(path)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        `    <priority>${priority}</priority>`,
        "  </url>",
      ].join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(await renderSitemap(), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
