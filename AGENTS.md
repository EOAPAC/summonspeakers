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
