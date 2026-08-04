import { createFileRoute } from "@tanstack/react-router";

import { robotsFor } from "@/lib/robots";

/**
 * Served from a route rather than public/robots.txt for two reasons: the Sitemap
 * line follows VITE_SITE_URL, and the body can depend on the host, so
 * non-canonical hosts get Disallow. A static file had the production domain
 * baked in and served the same permissive body to every alias.
 *
 * The host rule lives in src/lib/robots.ts so it can be tested without a
 * server.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) =>
        new Response(robotsFor(new URL(request.url).host), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
            // The body varies by host, so a shared cache must not serve one
            // host's robots.txt to another.
            vary: "host",
          },
        }),
    },
  },
});
