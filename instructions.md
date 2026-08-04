# Summon Speakers — working instructions

How to work on this project. Factual background is in `context.md`; read it
first.

## The standard

Ship the finished thing, tested. Not a plan, not the easy 80%, not a workaround
where the real fix was reachable. If finishing properly needs one more file or
one more search, do it in the same pass.

Scope is measured against what was asked. A small task done completely clears the
bar; a large task done partially does not. Do not inflate a one-line fix into a
refactor.

## Verify before you claim

This is the rule that matters most here, because breaking it has already caused
real damage in this project.

Do not state something about the live site, the deployment, the DNS or the
environment unless you have checked it in this session. Relayed claims from
another agent, another tool, or an earlier turn are inputs to verify, not facts
to repeat. Two specific failures to avoid repeating:

- A relayed report that Vercel held certain environment variables got repeated as
  fact and was wrong.
- A page's rendered text was read immediately after navigation, before it had
  finished rendering, and an empty list was reported as an empty state.

When you cannot verify something from this environment, say which part is
unverified rather than filling the gap. The outbound proxy blocks direct fetches
of `summonspeakers.com`; use the Vercel MCP `web_fetch_vercel_url` tool instead,
which is authenticated and works.

Watch for exit codes hidden behind pipes. `if git push | tail -5` reports success
regardless of whether the push failed, which produced a false "PUSH OK" here
once.

## Definition of done

All four must pass before you call anything finished:

```sh
bunx tsc --noEmit
bun run lint      # 0 errors; 2 known react-refresh warnings on Page.tsx and Breadcrumbs.tsx
bun test
bun run build
```

For anything that changes rendered output, also check the real SSR HTML, not just
the source. Start the dev server and curl it:

```sh
bunx vite dev --host 127.0.0.1 --port 4322
curl -s "http://127.0.0.1:4322/speakers?gender=female" | grep -ao 'rel="canonical" href="[^"]*"'
```

Bind to `127.0.0.1` explicitly. The default binds `::` and this container has no
IPv6, which fails with `errno -97` (`EAFNOSUPPORT`), not the address-in-use error
the message resembles. Vite's dev and preview servers also reject foreign `Host`
headers, so host-dependent logic has to be unit-tested rather than curled.

React splits text nodes with `<!-- -->` comments in SSR output, so a grep for a
sentence spanning an interpolation will find nothing even when the text is
correct. Strip comments and tags before matching.

## Git workflow

Branch, PR, wait for CI, merge. Every time, including for one-line changes.

```sh
git fetch origin main
git checkout -B <branch> origin/main
# work, then verify
git push -u origin <branch>
```

Use `git reset --hard origin/main`, not `git checkout main`, when returning to
the trunk. The local `main` here has gone stale and silently reverted a working
tree once.

If the branch's previous PR is already merged, restart the branch from
`origin/main` rather than stacking on merged history.

Do not merge on a red or pending CI. Check that the step you care about actually
ran, rather than trusting a green tick: an earlier CI assertion here grepped the
runner's environment for `VITE_` variables, which never holds deployment
variables, so it passed vacuously and proved nothing.

## Hard rules

**Never hand-edit a generated file.** See the table in `context.md`. Regenerate
instead.

**Never import `roster.generated.ts` from a component.** It is 180KB. Reach it
through `src/lib/roster.server.ts`. Client code that needs filter labels imports
`roster-facets.ts`, which is a few hundred bytes. CI asserts the roster stays out
of `.vercel/output/static`, so a violation fails the build rather than silently
shipping 180KB to every visitor.

**Never prefix a secret with `VITE_`.** That inlines it into the client bundle.
Read secrets from `process.env` inside a server function or server route handler.
Three `VITE_` variables are permitted because their values are public by design:
`VITE_SITE_URL`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — the anon key
ships in every Supabase browser app and the RLS policies in
`supabase/migrations/` are the enforcement. CI asserts no other `VITE_` variable
is read anywhere in `src/` or `scripts/`. The service-role key and
`RESEND_API_KEY` are secrets and stay unprefixed.

**Never hardcode an absolute URL.** Build it with `absoluteUrl()` from
`src/lib/site.ts`.

**Never invent a statistic, a review, a rating or a testimonial.** The site
already carries one unsourced number and that is one too many. If a claim needs
data that does not exist, say so and leave it out.

## SEO rules the codebase encodes

Breaking any of these is a regression, not a style choice.

Page titles go through `pageTitle()`, which keeps the whole title including the
` | SummonSpeakers` suffix under 60 characters. Descriptions stay under 160, by
convention rather than by a helper. No two pages share a title or a description.
All 64 sitemap URLs complied at the last full audit; measure on unescaped text if
you re-audit (see the gotcha below).

Faceted views on `/speakers` get `noindex,follow` plus a canonical to the base
list. Facets are `topic`, `category`, `state`, `gender`, `q`. **Test those named
fields, never `Object.keys(search).length`.** That expression counts tracking
parameters, so `?utm_source=newsletter` was emitting `noindex` on the main
speakers page. The same mistake hid the featured cards. Helpers `isFaceted()` and
`isNarrowed()` in `speakers.index.tsx` exist so this is written once.

Pagination is not a facet. `?page=2` onwards stays indexable, with its own
canonical and its own title. Noindexing pagination would put most of the 2,131
speakers beyond reach.

Non-canonical `*.vercel.app` hosts get `Disallow: /` from
`robots.txt`. The rule in `src/lib/robots.ts` is scoped to `*.vercel.app` on
purpose: `SITE_URL` is inlined at build time while the serving host comes from
DNS, so the two can disagree, and a broader "block any non-canonical host" rule
would answer `Disallow` on the live domain and deindex the site. Do not widen it.
`robots.test.ts` asserts a real domain is never blocked.

Every page needs a canonical, an `og:url`, an OG image via `ogImageMeta()`, and
breadcrumb JSON-LD. New pages need an OG card added to `scripts/build-og-images.ts`.

New indexable pages must appear in `sitemap[.]xml.tsx`. It generates from the
data, so a new topic or post lands automatically, but a new static route does not.

Changes to `robots.txt` or the sitemap only take effect on a Production deploy,
since both are server routes inside the Nitro function. Merging is not deploying:
confirm the deploy landed before reporting either as fixed.

## Gotchas that have already cost time

**Tailwind arbitrary values need a type hint for CSS variables.** Write
`text-[length:var(--display-md)]`. Without `length:` Tailwind emits a `color`
declaration and the font size is silently dropped, with no error anywhere.

**`.vercel` must stay ignored in three places:** `.gitignore`, `.prettierignore`,
and the `ignores` array in `eslint.config.js` (there is no `.eslintignore` in
this repo). Missing from the lint ignores, eslint walks 88 build artefacts and
appears to hang; it ran over ten minutes here before being killed.

**Headless Chromium clamps the layout viewport to a 500px minimum.** A 390px
screenshot shows a clipped 500px render, which looks exactly like a mobile
overflow bug. It produced a false finding here once. The viewport is also 87px
shorter than `--window-size`, which `scripts/build-og-images.ts` auto-calibrates.

**Count title lengths on unescaped text.** An audit that measured `&amp;` as five
characters inflated seven titles by four characters each and reported passing
pages as broken.

**The npm registry mirror in `bun.lock` can 403.** Rewrite tarball URLs to
`registry.npmjs.org`, install, then restore the lockfile byte-identically.

## Writing content

Copy is for event planners under time pressure. Lead with the answer. Give a real
number or say nothing.

Every fee figure comes from `src/data/fees.ts`. Never type a fee band into a page.

Topic names need care in prose. "Female Speakers" plus the word "speakers"
produced "female speakers speakers" in three places, and a pre-existing FAQ asked
"book a female speakers speaker?". Use `topicPhrase` and `topicPhraseSingular`
from `src/data/speakers.ts`, which carry `PHRASE_BASE` overrides (Authors becomes
author, Adventurers becomes adventure, "MCs & Hosts" becomes "MC and event host")
and a `midSentence()` helper that preserves acronyms.

Australian English, and Australian number formatting via
`toLocaleString("en-AU")`.

## Tests

`bun test`, built into bun, no runtime dependency. Three files so far:
`src/lib/robots.test.ts`, `src/data/roster.test.ts` and `src/lib/backend.test.ts`,
35 tests.

Add a test when logic has a subtle failure mode, particularly one where the wrong
answer looks plausible. Both existing files cover exactly that: a filter silently
dropping people, and a robots rule that could deindex the site.

Mutation-check anything you add. Reintroduce the bug, confirm the test fails,
restore. A test that passes either way is worse than no test, because it reads as
coverage.

## Decide vs ask

Decide yourself, state the assumption, keep going: naming, file layout, comment
wording, which helper to extract, how to structure a component, whether something
needs a test.

Ask first: anything that sends data to a third party, anything that touches
production DNS or environment variables, anything that deletes user-facing
content, anything that changes what the site claims commercially.

When a request seems wrong, say so in a sentence or two and then build it anyway
under a stated assumption. If it gets reaffirmed, that is the decision. This has
already happened once: a plan to narrow the gender filter was reversed on the
instruction that booking for a women's event is a real use case, and the feature
stayed whole.

## Reporting back

Short. A table of verified results beats paragraphs of narration.

State what you checked and how. "Verified against the running server" and
"verified by reading the source" are different claims and should not be blurred.

If something failed or you skipped part of the scope, say which part and why. Do
not describe a partially finished change as done.

Correct an error plainly and move on. No apologising, no recounting the mistake,
no tallying past errors.
