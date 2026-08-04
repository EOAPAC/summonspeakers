# Summon Speakers — project context

Reference material for the codebase. Read this before making changes. Behavioural
rules live in `instructions.md`.

Last verified against `main` at commit `2926959`, 4 August 2026, plus the
Supabase backend work of 5 August 2026 (see Backend below).

## What the site is

An Australian speaker bureau directory. The commercial angle it is built around is
publishing fees upfront: every full speaker profile shows a fee band, so an event
planner can shortlist inside a budget before contacting anyone. The site's own
copy positions this against bureaus that hide fees behind an enquiry form. That
competitive claim comes from the copy and has not been independently checked, so
treat it as positioning rather than verified fact.

The structure assumes visitors arrive knowing a topic and a budget rather than a
speaker name, which is why topic pages and the fee table carry as much weight as
the profiles. That is the design rationale readable from the codebase; there is no
analytics data in the repo to confirm it.

## Repository and hosting

|                |                                                                    |
| -------------- | ------------------------------------------------------------------ |
| Repo           | `EOAPAC/summonspeakers`, **public**                                |
| Default branch | `main`                                                             |
| Host           | Vercel (not Lovable, despite the build-config dependency)          |
| CI             | `.github/workflows/ci.yml`, job name `check`                       |
| Domain         | `summonspeakers.com`, on Vercel nameservers, third-party registrar |

The repo being public matters: the roster carries real people's names and
locations. That was a deliberate call, not an oversight, but it constrains what
else can go in the repo.

### Domain state, and the decision pending on it

Verified live on 4 August: `summonspeakers.com` returns a 308 to
`www.summonspeakers.com`, and both `www` and `summonspeakers.vercel.app` serve
Production. The code canonicalises to the **apex**, so the canonical currently
points at a URL that redirects.

The agreed fix is to flip the Vercel domain config so the apex serves and `www`
redirects to it, and to leave `VITE_SITE_URL` unset so the apex fallback in
`src/lib/site.ts` stays the single source of truth. If that flip has happened,
this section is stale and everything is consistent. If it has not, canonicals,
`og:url`, the sitemap and every JSON-LD `@id` all name a host that 308s.

Nothing in the code depends on which way it points. `src/lib/robots.ts` is
scoped to `*.vercel.app` precisely so a build-time/DNS disagreement can never
deindex a real domain.

## Stack

TanStack Start (SSR) on Vite 8, React 19, Tailwind v4, bun. Nitro builds for
Vercel; `bun run build` writes `.vercel/output` in Build Output API v3 format.
The preset is pinned to `vercel` in `vite.config.ts` because the Lovable config
preset defaults Nitro to `cloudflare-module`.

TypeScript is strict, plus `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` and
`noImplicitReturns`. Array indexing returns `T | undefined`, and optional
properties cannot be assigned `undefined` explicitly. Expect to write more
guards than usual.

**This is not a Vite SPA.** It is server-rendered: the build emits one Nitro
function and `.vercel/output/config.json` routes unmatched paths to it. A
third-party API key gets called from a server function. There is no need for an
`api/` directory and no need for a Supabase Edge Function acting as a proxy.

### Scripts

| Command                       | Does                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `bun run dev`                 | Vite dev server                                      |
| `bun run build`               | Production build to `.vercel/output`                 |
| `bun run lint`                | eslint with prettier                                 |
| `bun test`                    | 35 tests, bun's built-in runner                     |
| `bun run import:roster <csv>` | Regenerates the roster from a CSV                    |
| `bun run build:og`            | Rasterises the 44 OG cards via Chromium              |
| `bun run build:favicons`      | Rasterises the favicon set from `public/favicon.svg` |

## Data model

Speaker data exists at three tiers, and confusing them is the most common
mistake.

**Full profiles — 12 speakers, `src/data/speakers.ts`.** Hand-written. These have
a biography, a published fee band, organiser references and their own indexable
page at `/speakers/<slug>`. They are the commercial shop window.

**The roster — 2,131 speakers, `src/data/roster.generated.ts`.** Imported from a
CSV. Name, categories, state, city, gender. No fee, no biography, no individual
page. Searchable and filterable at `/speakers`. The module is about 180KB and is
**server-only**.

**Topics — 35, `src/data/speakers.ts`.** 7 marked `featured: true` plus 28
derived from the imported categories. Each has a page at `/topics/<slug>` and a
`roster` mapping that expands to the categories and gender filter behind it.
Topics do not map 1:1 onto CSV categories: "Futurist & AI" covers both
"Technology, Future & Innovation" and "AI", which is why `RosterFilters.categories`
is a list.

### The numbers

|                                    |                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Roster size                        | 2,131                                                                                |
| Female / male / no gender recorded | 866 / 1,249 / 16                                                                     |
| Categories                         | 35                                                                                   |
| Locations                          | 11 (8 states and territories, plus Australia nationwide, New Zealand, International) |
| Roster pages at 60 per page        | 36                                                                                   |
| Full profiles                      | 12                                                                                   |
| Topics                             | 35                                                                                   |
| Blog posts / case studies          | 4 / 3                                                                                |
| Sitemap URLs                       | 64                                                                                   |
| OG cards                           | 44                                                                                   |

The 16 speakers with no recorded gender are surfaced in the UI rather than
dropped silently. `RosterPage.unrecordedGender` carries the count and
`RosterDirectory` renders a line offering to include them. If a gender filter
ever silently excludes people again, that is a regression and `roster.test.ts`
should catch it.

### Generated files, never hand-edited

| File                                                        | Regenerate with                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `src/data/roster.generated.ts`, `src/data/roster-facets.ts` | `bun run import:roster <csv>`                              |
| `public/og/*.png`                                           | `bun run build:og`                                         |
| `public/favicon.ico`, `public/*icon*.png`                   | `bun run build:favicons` (edit `public/favicon.svg` first) |
| `src/routeTree.gen.ts`                                      | the router plugin, on dev or build                         |

`import-roster.ts` is deterministic: same CSV in, byte-identical output. It folds
88 raw CSV tags into the 35 categories via a `CATEGORY_PARENT` map and normalises
locations via `STATE_DROP` and `STATE_RELABEL`. It emits two files, the big
server-only one and the small client-safe `roster-facets.ts` holding just the
filter labels and `ROSTER_COUNT`.

## Routing and key files

File-based routing under `src/routes/`. `src/routes/README.md` documents the
filename conventions. There is no `src/pages/` and no `app/` directory.

| Path               | File                 | Notes                                 |
| ------------------ | -------------------- | ------------------------------------- |
| `/speakers`        | `speakers.index.tsx` | Server-side filtered roster           |
| `/speakers/<slug>` | `speakers.$slug.tsx` | Full profiles only, 12 of them        |
| `/topics/<slug>`   | `topics.$slug.tsx`   | 35 topic pages                        |
| `/speaker-fees`    | `speaker-fees.tsx`   | Fee band table                        |
| `/get-matched`     | `get-matched.tsx`    | Enquiry form                          |
| `/sitemap.xml`     | `sitemap[.]xml.tsx`  | Server route, generated from the data |
| `/robots.txt`      | `robots[.]txt.tsx`   | Server route, host-aware              |

The `[.]` in a filename escapes a literal dot. A static file in `public/` with
the same name would shadow either server route.

Other files worth knowing:

- `src/lib/site.ts` owns every absolute URL. `SITE_URL`, `absoluteUrl()`,
  `ogImage()`, `ogImageMeta()`, and `pageTitle(...leads)` which takes candidate
  titles most to least informative and picks the longest that fits under 60
  characters.
- `src/lib/roster.server.ts` is the only bridge to the roster. Two server
  functions with input caps (`MAX_PAGE_SIZE` 100, `MAX_CATEGORIES` 40,
  `MAX_QUERY_LENGTH` 100), because a server function is a public RPC endpoint.
- `src/lib/robots.ts` holds the host rule, separated from the route so it can be
  tested without a server.
- `src/data/fees.ts` is the single source of fee bands. `/speaker-fees` and the
  per-topic FAQs both read it, so they cannot disagree. Only 4 topics have
  published bands; a topic absent from `feeBands` gets no fee claim at all.
- `src/lib/schema.ts` builds the JSON-LD.

## Design system

Tokens and custom utilities live in `src/styles.css`, using Tailwind v4's
`@utility` and `@theme`.

Utilities: `container-x`, `section-y`, `section-y-lg`, `display`, `label-mono`,
`label-mono-lg`, `hairline-top`, `rule-open`, `measure`, `measure-lead`, `hatch`.

Type scale tokens: `--display-hero`, `--display-xl`, `--display-lg`,
`--display-md`, `--display-sm`, `--display-nav`, `--display-cta`.

Ink, surface and rule tokens: `--ink`, `--ink-2`, `--ink-3`, `--surface`,
`--surface-alt`, `--line-2`.

`hatch` is the placeholder used wherever a speaker portrait would go. No real
speaker imagery exists anywhere on the site.

## What is not real yet

Read this before writing copy or making a claim on a page.

**No speaker portraits.** Every card and profile renders the `hatch`
placeholder. A `RUNWARE_API_KEY` is set in Vercel but nothing reads it. If it
gets wired up, generate images once into `public/` rather than calling the API
per request; this is SSR, so a per-request call is a per-visitor cost.

**`/about` claims a "4.9 average event rating" with no source.** Either find the
data or remove the number.

**No client error telemetry.** The root error boundary logs to console. The
previous reporting only worked inside the Lovable editor and was removed.

**30 pages are under 800 words.** Thin content on pages that are meant to rank.

## Backend (Supabase + Resend)

Wired up 5 August 2026. Enquiries and speaker listings persist to Supabase and
notify by email; see the Backend section in `AGENTS.md` for the module map.

- **Schema and RLS** live in `supabase/migrations/`. Apply once per project
  (SQL editor or `supabase db push`). The migration creates the README data
  model — `speakers`, `topics`, `speaker_topics`, `testimonials`,
  `past_clients`, `enquiries` — plus the `speaker-media` storage bucket.
  Published speakers are publicly readable; enquiries are insert-only for
  everyone but the service role; a signed-in speaker can write their own
  listing but cannot promote it past `pending_review`.
- **Auth** runs on `/for-speakers/join` via the browser client in
  `src/lib/supabase-auth.ts` (Google, and `azure` for Microsoft). The listing
  posts its access token and `submitListing` verifies it server-side, linking
  the row to the speaker as `owner_id`. The email-only path creates an
  unclaimed listing the admin chases. Planners never need an account.
- **Email** is `src/lib/email.server.ts`, one POST to Resend. Best-effort
  after the insert: a Resend outage must not lose a saved enquiry.
- The site still renders from committed data. With the backend env vars
  absent, pages render normally but submission endpoints throw — a loud
  failure the form surfaces, not a fake success.
- The two `VITE_SUPABASE_*` variables in Vercel were Lovable scaffold
  leftovers; they are now load-bearing and need real values (anon key, not the
  service key). The integration-managed duplicate key names stay as they are —
  renaming breaks Supabase's rotation.

## Environment variables

`VITE_SITE_URL` — optional, no trailing slash, falling back to
`https://summonspeakers.com`. `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` — public by design; the anon key ships in every
Supabase browser app and the RLS policies are the enforcement. These three are
the only `VITE_` variables CI permits in `src/` or `scripts/`.

Server-only, read from `process.env` inside server functions: `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` (secret, bypasses RLS), `RESEND_API_KEY` (secret),
`RESEND_FROM`, `ADMIN_EMAIL`. The full list with placeholders is in
`.env.example`.

The `VITE_` prefix means Vite inlines the value into the client bundle at build
time. Verified empirically on this repo: a build with `VITE_FAKE=x` puts `x`
verbatim into `.vercel/output/static/assets/index-*.js`, while an unprefixed
variable does not appear there at all. The service-role key and Resend key must
stay unprefixed; verified again when the backend landed — a build holding fake
values for both kept them out of `.vercel/output/static` while the anon key
appeared, as designed.

Set Node 22 in Vercel. Vite 8 needs 20.19+ or 22.12+, and `package.json` pins
the floor at 22.12.

## Third parties

|          |                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel   | Hosting, domain, DNS                                                                                                                                                            |
| Supabase | Database, auth and storage. Enquiries and listings persist here; schema in `supabase/migrations/`                                                                               |
| Resend   | Transactional email: enquiry confirmation to the planner, notifications to `ADMIN_EMAIL`                                                                                        |
| Runware  | Key set in Vercel, nothing reads it                                                                                                                                             |
| Lovable  | Origin of the scaffold. `@lovable.dev/vite-tanstack-config` is still the build config. Its `gpt-engineer-app[bot]` still has push access to the repo and 102 commits on `main`. |

Lovable references were stripped from the codebase apart from that build config
dependency, which is load-bearing.

## Outstanding items

Code, decided but not built: wire Runware, source or remove
the 4.9 rating, expand the 30 thin pages.

Browser-only, cannot be done from a Claude Code session: flip the apex/www
redirect, revoke Lovable's GitHub App, enable secret scanning and push
protection, run `supabase/migrations/20260805000000_init.sql` against the
project, set real values for the Supabase and Resend variables in Vercel
(`.env.example` lists them), enable the Google and Azure auth providers, set
Node 22, enable branch protection requiring a PR and the `check` job, enable
auto-delete of merged branches.

Decided and settled: keep both gender filter options (booking for a women's
event is a real use case); leave the integration-managed duplicate key names
alone, since renaming breaks Supabase's rotation.
