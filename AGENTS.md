# Working in this repo

TanStack Start (SSR) on Vite 8, React 19, Tailwind v4, bun. Nitro builds for
Vercel — `bun run build` writes `.vercel/output` in Build Output API v3 format.

This file is the short version, covering what you need to change code safely.
`context.md` has the full picture (data model, counts, design tokens, what is
still stubbed) and `instructions.md` has the working rules (definition of done,
git workflow, the SEO invariants, gotchas). Where they disagree with this file,
they are more current — the counts here are the ones most likely to go stale.

## Before you finish

`bunx tsc --noEmit`, `bun run lint` and `bun run build` all need to pass. Lint
carries two known `react-refresh` warnings on `Page.tsx` and `Breadcrumbs.tsx`,
which export a JSON-LD helper alongside their components by design.

## Generated files — never hand-edit

| File                                                        | Regenerate with                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `src/data/roster.generated.ts`, `src/data/roster-facets.ts` | `bun run import:roster data/roster-sources/*.csv`                              |
| `public/og/*.png`                                           | `bun run build:og`                                         |
| `public/speakers/*.plate.png`                               | `bun run build:plates`                                     |
| `src/data/speaker-portraits.ts`                             | `bun run build:portraits --manifest-only`                  |
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
- Image work uses the Chromium that `build-og-images.ts` already needs, not
  `cwebp`, ImageMagick or `sharp`. `bun run to:webp <file-or-dir> --width=1024`
  converts PNG/JPEG to WEBP that way, so it behaves the same on every machine
  rather than silently skipping compression when a binary is absent.

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

| Feature                | State                                                                                                                                                                                                                                                             | Where the work goes                                                                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enquiry submission     | Wired. `/get-matched` persists via `enquiries.server.ts`, `/for-speakers/join` via `listings.server.ts`. Both need `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set, or they throw and the form shows its error state rather than a false success.                | Remaining: set the env vars in Vercel, and connect single sign-on on the join page — it still shows a "not connected yet" notice and every listing arrives with `owner_id` null.                                                                                                      |
| Speaker portraits      | Done. All 12 full profiles carry a generated photo in `public/speakers/<slug>.webp`, with a `<slug>.plate.png` monogram beside each as a fallback; a photo always beats a plate in the manifest. Text prompts only — never condition on a photo of a real person. | Nothing outstanding. Regenerate plates with `bun run build:plates`, then `bun run to:webp public/speakers --width=1024` and `bun run build:portraits --manifest-only`. Images are committed, so the deployed site never calls an image API — on SSR that would be a per-visitor cost. |
| Client error telemetry | The root error boundary logs to the console only.                                                                                                                                                                                                                 | Needs an integration; the previous reporting only worked inside the Lovable editor and was removed.                                                                                                                                                                                   |
