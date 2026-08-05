# SummonSpeakers

Speaker marketplace with every fee published upfront. This document is the
product specification: stack, data model, routes, design tokens and acceptance
criteria. Where something is deliberately out of scope it says so.

See [AGENTS.md](AGENTS.md) for repo conventions and the generated files.

---

## 1. What we're building

**SummonSpeakers is a speaker marketplace where event planners browse, compare and book professional speakers directly — with every fee shown upfront.**

The category is dominated by bureaus that hide pricing behind "fee on application" and a sales call, then add a 20–30% markup in the middle. Our entire wedge is the opposite: **open pricing, direct booking, no markup.** Every product decision below serves that wedge.

**One-line positioning:** Book the keynote speaker your event deserves — with fees shown upfront.

### Two audiences, one site

| | Event planner (demand) | Speaker (supply) |

|---|---|---|

| Wants | The right speaker, fast, at a knowable price | More paid bookings, without a gatekeeper |

| Fears | Overpaying; booking a dud; a slow sales process | Being marked up; losing the client relationship |

| Converts via | **Get matched** enquiry (2 min) | **Join SummonSpeakers** listing form |

### Success criteria for v1

1. A planner can go from landing → shortlist of speakers with visible fees → submitted enquiry in under three minutes.

2. Every speaker card and profile displays a fee band. A card without one is a bug.

3. A speaker can create a listing and submit it for review.

4. Enquiries reliably land in the admin inbox and trigger an email to the planner.

---

## 2. Stack

**Built:** TanStack Start (SSR) with Nitro, on Vite 8 and bun. React 19,
TypeScript, Tailwind v4. Hosted on Vercel. Speaker and editorial content is
committed TypeScript under `src/data/`; the 2,131-speaker roster is imported
from CSV by `bun run import:roster`.

**Not built yet.** Everything below is the intended backend. `src/lib/enquiries.ts`
is currently a local stub that validates and discards, so no database, auth or
email service is wired up and no secrets are needed to run the site.

- **Supabase** for Postgres, auth, storage (speaker photos, showreel thumbnails) and row-level security.

- **Auth:** Google and Microsoft OAuth as the primary options, email/password as fallback. Planners do **not** need an account to submit an enquiry — this is critical, never gate the enquiry behind signup.

- **Email:** transactional via Resend (enquiry confirmation to planner, notification to admin).

- **SEO:** every page needs server-renderable meta, a canonical URL, and JSON-LD. Use `react-helmet-async`. Routes must be real URLs, never hash routes.

---

## 3. Data model

```

speakers

  id uuid pk

  slug text unique              -- "dr-maya-ellison"

  name text

  role text                     -- "Resilience & leadership keynote speaker"

  tagline text                  -- one line, shown on cards

  bio_short text                -- 1–2 sentences, hero

  bio_long text[]               -- 3+ paragraphs, profile body

  fee_min int                   -- in whole dollars, e.g. 15000

  fee_max int                   -- e.g. 20000

  fee_on_application bool default false

  available bool default true

  location text                 -- "Sydney, AU · travels internationally"

  topics text[]                 -- ["Leadership","Resilience"]

  showreel_url text nullable

  headshot_path text nullable   -- supabase storage

  status text                   -- draft | pending_review | published

  created_at timestamptz

topics            id, slug, name, blurb, kind (topic|audience|event|industry|location)

speaker_topics    speaker_id, topic_id            -- many-to-many

testimonials      id, speaker_id nullable, quote, author_name, author_role, company, result

past_clients      id, speaker_id, name

enquiries         id, event_date, audience_size, topic_or_speaker, full_name, work_email,

                  budget_range nullable, city nullable, notes nullable,

                  speaker_id nullable, status (new|shortlisted|closed), created_at

```

**Fee display rule (implement once, use everywhere):** render `fee_min`–`fee_max` as `"$15k – $20k"`. If `fee_on_application` is true render `"Fee on application"` — and treat that as an exception the admin should chase, not a normal state.

**RLS:** `speakers` readable by anyone where `status = 'published'`; writable by the owning speaker. `enquiries` insert-only for anon, readable only by admin.

---

## 4. Routes

Build these in priority order. **P0 ships first.**

| Priority | Route | Purpose |

|---|---|---|

| P0 | `/` | Homepage — hero, category tiles, why-us, testimonials, featured speakers, closing CTA |

| P0 | `/speakers` | Full directory with filters |

| P0 | `/speakers/:slug` | Speaker profile — the core conversion page |

| P0 | `/topics/:slug` | Category listing (one reusable template for all topics) |

| P0 | `/get-matched` | 3-step enquiry flow + success screen (also opens as a modal) |

| P0 | `/speaker-fees` | Fee guide hub — tier × topic pricing table |

| P0 | `/how-it-works` | 4-step reassurance page |

| P1 | `/for-speakers` and `/for-speakers/join` | Supply-side landing + listing form |

| P1 | `/audiences/:slug`, `/events/:slug`, `/locations/:slug` | Same template as `/topics/:slug`, different filter |

| P2 | `/blog`, `/blog/:slug`, `/case-studies`, `/about`, `/contact`, `/privacy`, `/terms` | Content and legal |

**URL rules:** lowercase, hyphens, no trailing slash, no dates in slugs. A topic page is always `/topics/{slug}` — never `/speakers/topic/{slug}`.

**Navigation:** Header is Logo → Browse → Fees → How it works → For speakers → **Get matched** (primary). Breadcrumbs on every page below the top level, with `BreadcrumbList` JSON-LD.

---

## 5. Page specifications

### 5.1 Homepage

- **Hero:** H1 "Book the keynote speaker your event deserves — with fees shown upfront." Sub: "Browse, compare and book professional speakers directly. No bureau markup, no guessing what they cost." One primary **Get matched** button + a quiet "Browse speakers" text link. A row of 4–5 client wordmarks beneath, labelled "Trusted by event teams at".

- **Category index:** editorial rows (not boxes) linking to Motivational, Keynote, Leadership, Business, Futurist & AI, Female speakers. Each row: number, name, one-line blurb, arrow. Name slides right on hover.

- **Why planners choose us:** three benefits — Transparent fees / Direct booking / Matched to your brief — each with a number, heading and one short paragraph.

- **Testimonials:** three cards, each with quote, a result chip ("Booked in one afternoon"), photo, name, role, company.

- **Featured speakers:** four speaker cards.

- **Closing CTA:** oversized "Get matched" with "Tell us about your event and we'll send a shortlist within one business day."

### 5.2 Category listing (reusable template)

Breadcrumb → H1 matching the search term exactly ("Leadership Speakers") → 2–3 sentences of intro → a soft Get-matched panel → **filter bar** (topic, fee range, location, availability) → responsive grid of 8–12 speaker cards → FAQ ("How much do leadership speakers cost?", "How do I book a leadership speaker?") → closing CTA.

The page must be skimmable: a planner should read ten speakers and their fee bands in seconds.

### 5.3 Speaker profile — the most important page

In this order: hero (large headshot, name, one-line positioning, **prominent fee band**, availability dot, **Check availability** primary) → topic pills → 3+ paragraph bio → showreel embed → testimonials → past-clients logo strip → fee and travel details → FAQ ("What is {name}'s speaking fee?", "How do I book {name}?") → **six** similar speakers.

- Fee band is a hero feature, never fine print.

- On mobile the primary action sticks to the bottom of the viewport.

- JSON-LD: `Person` + `Offer`, plus `FAQPage` on the FAQ block.

### 5.4 Get matched (3 steps + success)

- **Step 1** (mostly selectable, not typed): event date, audience size, topic or specific speaker. Show "Free to enquire, no obligation."

- **Step 2:** full name, work email.

- **Step 3** (marked optional, skippable): budget range, city, free-text notes.

- Progress indicator across the top, back arrow on steps 2–3, "about two minutes" stated. Labels sit **above** inputs. Errors appear inline next to the offending field. Never clear entered data on error or on back.

- **Success:** "We'll send a shortlist of matched speakers to your inbox within one business day," plus a secondary button to keep browsing.

### 5.5 Speaker fees hub

H1 "How much does a keynote speaker cost?" Intro explaining we publish fees while most agencies hide them. Then a **tier × topic matrix** — Emerging / Established / Celebrity down one axis, Motivational / Leadership / Business / Futurist across the other — with real-looking ranges. Then FAQs on what drives a fee, travel costs, and how we compare to a bureau. Closing CTA.

This page should read like the authoritative answer an AI assistant would quote. Keep the numbers in plain text, not images.

### 5.6 How it works

Four numbered steps: 1) Tell us about your event, 2) Get a matched shortlist with fees shown, 3) Book directly through us, 4) We support you through to the day. Address the worries inline: enquiring is free, and what happens if a speaker cancels (free cancellation up to 14 days before). Calm and reassuring, not salesy.

### 5.7 For speakers

Hero: "Get booked for more paid speaking engagements." Benefits: a profile that ranks in search, direct enquiries from real planners, transparent fees that respect their value. Three-step "how listing works", one speaker testimonial, primary **Join SummonSpeakers**. The join form offers **Google and Microsoft sign-in prominently above** the email option. Tone: respectful and premium — speakers are supply we're courting, not users we're processing.

---

## 6. Design system

The visual system is **monochrome editorial**. Import these tokens as CSS variables and map them into the Tailwind theme; do not introduce new colours.

```css
/* colour — black, white, two greys. No brand hue by design. */

--color-ink: #000;
--color-ink-2: #525252;
--color-ink-3: #737373;

--color-surface: #fff;
--color-surface-alt: #ededed;
--color-footer: #0a0a0a;

--line: rgba(0, 0, 0, 0.1);
--line-2: rgba(0, 0, 0, 0.18);
--line-on-dark: rgba(255, 255, 255, 0.1);

--color-accent: #000;
--color-accent-hover: #fff; /* primary inverts on hover */

--color-warning: #7a2e1c; /* inline form errors only */

/* type — one grotesque + one mono */

--font-body: "Hanken Grotesk", Inter, system-ui, sans-serif;

--font-mono: "IBM Plex Mono", ui-monospace, monospace;

--display-hero: clamp(44px, 9vw, 150px);
--display-cta: clamp(48px, 11vw, 170px);

--display-lg: clamp(32px, 5vw, 72px);
--display-md: clamp(28px, 5vw, 60px);

--tracking-display: -0.05em;
--tracking-body: -0.02em;
--tracking-mono: 0.1em;

--leading-display: 0.9;
--leading-cta: 0.86;

/* shape, rhythm, motion */

--radius-pill: 9999px;
--radius-card: 18px;
--radius-media: 14px;
--radius-sm: 8px;

--pad-inline: clamp(20px, 6vw, 96px);
--sec-pad: clamp(64px, 9vw, 140px);

--ease: cubic-bezier(0.16, 1, 0.3, 1);
--dur-base: 500ms;
--dur-slow: 1000ms;

--hit-primary: 56px;
--hit-min: 44px;
```

**Rules that make it look right:**

- **Display type is uppercase, weight 800, −0.05em tracking, sub-1 leading.** Big and tight.

- **Mono is the label voice** — eyebrows, section numbers, fee bands, footer headings. If it's a label, it's mono, uppercase, 0.10em.

- **Hairlines, not shadows.** The system is flat: `1px rgba(0,0,0,.10)` rules separate sections; a `2px` black rule opens a section. Shadows only on overlays and sticky bars.

- **One primary action per screen** — a solid black pill that inverts to white on hover, 56px tall. Everything else is an underlined text action or a hairline outline pill.

- **Imagery is grayscale**, warming to full colour on hover. Placeholders are a diagonal-hatch fill with a mono caption.

- **Motion is long and decelerating** (`cubic-bezier(.16,1,.3,1)`, 500–1000ms). No bounce, no springs. Respect `prefers-reduced-motion`.

### Components to build first

- **Button** — `primary` (black pill, inverts), `secondary` (underlined text + →), `ghost` (hairline pill, fills with ink). Supports loading and disabled.

- **FeeBand** — mono uppercase hairline pill, optional availability dot, `onApplication` and `invert` variants.

- **Pill** — mono uppercase topic tag, renders as a link.

- **SpeakerCard** — grayscale 4:3 media well (scales 1.04 and reveals a ↗ disc on hover), then a hairline meta row with name left and **fee in mono right**. Keyboard operable: `role="button"`, Enter/Space, visible focus ring.

---

## 7. Voice

Calm, plain-spoken, reassuring — a confident concierge, not a salesperson. Short sentences. Say the number. Name the thing the reader is worried about before they have to ask.

- Write "Free cancellation up to 14 days before your event," not "flexible cancellation options available."

- Never "unlock", "supercharge", "world-class", "revolutionise". No exclamation marks. No emoji anywhere in the UI.

- CTAs are plain verbs: **Get matched**, **Check availability**, **Join SummonSpeakers**.

---

## 8. Accessibility (non-negotiable)

- Visible 2px focus ring on every interactive element, offset 3px, never removed. White ring on ink panels.

- Touch targets: 56px for primary actions, 44px minimum for everything else.

- Labels always visible above inputs — never placeholder-only.

- Errors are announced inline, adjacent to the field, and never rely on colour alone.

- All imagery has alt text; decorative glyphs are `aria-hidden`.

---

## 9. Seed data

Seed 12 speakers across Leadership, Motivational, Business and Futurist & AI so the grids and filters look real. Include one flagship example: **Dr Maya Ellison**, resilience and leadership keynote speaker, Sydney, fee `$15k – $20k`, available, with three bio paragraphs, three testimonials and eight past clients. Vary fee bands from `$7k – $11k` to `$40k+`, and mark one speaker `fee_on_application` so that state is visible.

---

## 10. Out of scope for v1

Do not build: payments or checkout, speaker calendars/real availability sync, messaging between planner and speaker, reviews and ratings submitted by users, multi-currency, i18n, a blog CMS, or an admin dashboard beyond a simple enquiries table. Enquiries are handled by email in v1.

---

## 11. Definition of done

- [ ] All P0 routes exist, are real URLs, and are reachable in two clicks from the homepage.

- [ ] Every speaker card and profile shows a fee band.

- [ ] Exactly one black primary action per screen; nothing else uses it.

- [ ] The enquiry flow submits without an account, persists to Supabase, emails the planner and notifies admin.

- [ ] Speaker profiles carry `Person` + `Offer` + `FAQPage` JSON-LD; every page below the top level has breadcrumbs.

- [ ] Mobile: single column, sticky primary action on profile pages, no horizontal scroll at 375px.

- [ ] Keyboard-only pass: every action reachable with a visible focus ring, no traps.

- [ ] Lighthouse ≥ 90 on performance and accessibility for `/`, `/topics/leadership`, `/speakers/dr-maya-ellison`.

## Running it locally

Needs [bun](https://bun.sh) and Node 22.12 or newer (Vite 8 requires it).

```sh
bun install
bun run dev
```

Other scripts: `bun run build` (production build), `bun run lint`,
`bun run format`, and the generators listed in [AGENTS.md](AGENTS.md).

## Deploying

Nitro targets Vercel — `bun run build` writes `.vercel/output` in Build Output
API v3 format, which Vercel picks up on its own. Leave the output directory
blank in project settings, and do **not** add an SPA catch-all rewrite: this is
server-rendered, so rewriting everything to `index.html` would break it.

Project settings that matter:

| Setting         | Value                                                | Why                                                                                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL` | e.g. `https://summonspeakers.com`, no trailing slash | Every canonical, `og:url`, share card and the sitemap resolve against it. `VITE_*` vars are inlined at build time, so it must exist before the build runs — otherwise preview deployments advertise the production canonical. Set it for Production and Preview. |
| `SUPABASE_URL` | e.g. `https://xxxx.supabase.co` | Server-side reads of the 12 full speaker profiles (`fetchSpeakers`). Unprefixed on purpose — see `supabase.server.ts`. Without it the homepage's featured speakers, the full-profile section on `/speakers`, and every `/speakers/$slug` page render nothing rather than 500, so the site still builds but looks broken. Set it for Production and Preview. |
| `VITE_SUPABASE_ANON_KEY` | the project's anon/publishable key | Paired with `SUPABASE_URL` to read published speakers under RLS. Despite the `VITE_` prefix this is read server-side via `process.env`, not inlined into the client bundle. Set it for Production and Preview. |
| Node version    | 22.x                                                 | Vite 8 needs 20.19+/22.12+. `engines` in `package.json` pins the floor.                                                                                                                                                                                          |

`bun.lock` is committed, so Vercel installs with bun without further
configuration. `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM` and
`ADMIN_EMAIL` are for the enquiry backend and stay optional until that ships.
