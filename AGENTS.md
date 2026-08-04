# Working in this repo

TanStack Start (SSR) on Vite 8, React 19, Tailwind v4, bun. Nitro builds for
Vercel — `bun run build` writes `.vercel/output` in Build Output API v3 format.

## Before you finish

`bunx tsc --noEmit`, `bun run lint` and `bun run build` all need to pass. Lint
carries two known `react-refresh` warnings on `Page.tsx` and `Breadcrumbs.tsx`,
which export a JSON-LD helper alongside their components by design.

## Generated files — never hand-edit

| File                                                        | Regenerate with                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `src/data/roster.generated.ts`, `src/data/roster-facets.ts` | `bun run import:roster <csv>`                              |
| `public/og/*.png`                                           | `bun run build:og`                                         |
| `public/favicon.ico`, `public/*icon*.png`                   | `bun run build:favicons` (edit `public/favicon.svg` first) |
| `src/routeTree.gen.ts`                                      | the router plugin, on dev/build                            |

`roster.generated.ts` is ~180KB and **server-only**. Import it from a server
function, never from a component; client code reads its labels from
`roster-facets.ts` instead. Pulling it into a component would ship the whole
roster to every visitor.

## Conventions worth knowing

- URLs come from `src/lib/site.ts`. Canonicals, `og:url`, JSON-LD and the
  sitemap all need absolute URLs, so build them with `absoluteUrl()` and set
  `VITE_SITE_URL` per environment — it is inlined at build time, not read at
  runtime.
- Page titles go through `pageTitle()`, which keeps them under 60 characters.
- Tailwind arbitrary values need the type hint for CSS variables:
  `text-[length:var(--display-md)]`. Without `length:` Tailwind emits a
  `color` declaration and the font size is silently dropped.
- `src/routes/sitemap[.]xml.tsx` and `robots[.]txt.tsx` are server routes. A
  static file in `public/` with the same name would shadow them.

## Secrets and third-party APIs

**This is not a Vite SPA.** It is server-rendered: the build emits one Nitro
function and `.vercel/output/config.json` routes every unmatched path to it. So a
third-party API key is called from a server function — there is no need for a
`api/` directory, and no need for a Supabase Edge Function to act as a proxy.

Two patterns already in the repo, either of which can read `process.env`:

- **Server function** — `src/lib/roster.server.ts` (`createServerFn`), for
  something a route loader or component action calls.
- **Server route handler** — `src/routes/robots[.]txt.tsx`, for something that
  responds to a URL.

**Never prefix a secret with `VITE_`.** That prefix means Vite inlines the value
into the client bundle at build time, so the secret ships to every visitor.
Verified on this repo: a build with `VITE_FAKE=x` puts `x` verbatim into
`.vercel/output/static/assets/index-*.js`, while an unprefixed var does not
appear there at all. `VITE_SITE_URL` is prefixed deliberately, because a public
canonical URL is not a secret.

To check a secret has not leaked:

```sh
bun run build && grep -rl "$YOUR_SECRET" .vercel/output/static/   # want no output
```

## Not wired up yet

| Feature                | State                                                                                                                                                        | Where the work goes                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enquiry submission     | `src/lib/enquiries.ts` validates and then **discards** every enquiry. Both `/get-matched` and `/for-speakers/join` show success without persisting anything. | Replace the stub body with a server function that persists the enquiry and sends the planner and admin emails.                                                                                                                                |
| Speaker portraits      | Every card and profile renders a `hatch` placeholder. No real imagery exists.                                                                                | A `RUNWARE_API_KEY` is set in Vercel but nothing reads it. Call Runware from a server function, and prefer generating images once into `public/` over calling the API per request — this is SSR, so a per-request call is a per-visitor cost. |
| Client error telemetry | The root error boundary logs to the console only.                                                                                                            | Needs an integration; the previous reporting only worked inside the Lovable editor and was removed.                                                                                                                                           |
