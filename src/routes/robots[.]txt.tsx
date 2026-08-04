import { createFileRoute } from "@tanstack/react-router";

import { absoluteUrl } from "@/lib/site";

/**
 * Served from a route rather than public/robots.txt so the Sitemap line follows
 * VITE_SITE_URL. A static file had the production domain baked in, which would
 * point preview deployments at the live sitemap.
 */
function renderRobots(): string {
  const agents = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "*"];
  return `${agents.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n")}

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(renderRobots(), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
