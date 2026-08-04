# SummonSpeakers Design System

A monochrome editorial design system for **SummonSpeakers**, a speaker marketplace that matches event organisers with keynote speakers and moderators.

## Two audiences

1. **Event organisers (buyers)** — They need to trust the platform quickly, see value before signing up, and find the right speaker without friction. The design must feel calm, authoritative, and premium.
2. **Speakers (supply side)** — They need to feel that their fee, reputation, and brand will be treated with respect. The design must feel editorial, not transactional.

Both audiences share one emotional need: **confidence**. Every interface decision either builds or erodes it.

## Ten principles

1. **Trust is the product.** The visual system exists to remove doubt before the user asks a question.
2. **One primary action per page.** One black pill CTA, one next step. No competing buttons.
3. **Show the fee like a headline.** The fee band is a hero element, never fine print. It signals honesty.
4. **Black is a colour, not an absence.** Ink black carries weight; white breathes; greys organise.
5. **No gradients, no shadows as decoration.** Elevation is only for functional layers (nav, cards, modals).
6. **Typography does the talking.** Hanken Grotesk for UI and display; IBM Plex Mono for labels, metadata, and fees; Newsreader for editorial quotes and long-form.
7. **Hairlines, not borders.** 1px rules at 10% black separate content without boxing it in.
8. **Clarity in five seconds.** Every page answers “What is this?”, “Why should I care?”, and “What do I do next?” within one scroll.
9. **Reduced motion is default.** Animations are slow, purposeful, and respect `prefers-reduced-motion`.
10. **Accessibility is non-negotiable.** Minimum 4.5:1 contrast, 44px hit targets, keyboard focus rings, alt text on every image, semantic headings.

## Content voice

- Calm, plain-spoken, confident.
- No hype, no exclamation marks, no emojis.
- Sentence case everywhere except mono labels (uppercase).
- Headlines are statements, not questions.
- Body copy is short and specific. Avoid filler: “world-class”, “seamless”, “revolutionary”.
- Fee language: “From $5k”, “$15k – $20k”, “Fee on application”. Never hide the fee.
- CTA labels: “Get matched”, “View speakers”, “Send enquiry”, “Apply to list”. Verbs first, no “Learn more”.

## Visual foundations

### Colour

| Token            | Value                    | Role                             |
| ---------------- | ------------------------ | -------------------------------- |
| `--ink`          | `#000000`                | Primary text, buttons, key rules |
| `--ink-2`        | `#525252`                | Secondary text, captions         |
| `--ink-3`        | `#737373`                | Tertiary text, placeholders      |
| `--surface`      | `#ffffff`                | Page background                  |
| `--surface-alt`  | `#ededed`                | Subtle fills, tags, hover states |
| `--footer`       | `#0a0a0a`                | Dark footer surface              |
| `--line`         | `rgba(0,0,0,0.10)`       | Hairlines, dividers              |
| `--line-2`       | `rgba(0,0,0,0.18)`       | Input borders                    |
| `--line-on-dark` | `rgba(255,255,255,0.10)` | Dividers on dark surfaces        |
| `--warning`      | `#7a2e1c`                | Errors and destructive actions   |
| `--accent`       | `#000000`                | Primary action fill (ink)        |
| `--accent-hover` | `#ffffff`                | Hover accent                     |

### Typography

- **Body:** Hanken Grotesk Variable, fallback `system-ui, sans-serif`. Tracking `-0.02em`.
- **Display:** Hanken Grotesk Variable, uppercase, weight 800, tracking `-0.05em`, leading `0.9`.
- **Mono:** IBM Plex Mono, uppercase labels, tracking `0.1em`, size `0.6875rem` (11px).
- **Serif:** Newsreader Variable, fallback `Georgia, serif`. Used for editorial quotes and long-form accents.

Display sizes:

| Token            | Value                      |
| ---------------- | -------------------------- |
| `--display-hero` | `clamp(44px, 9vw, 150px)`  |
| `--display-cta`  | `clamp(48px, 11vw, 170px)` |
| `--display-lg`   | `clamp(32px, 5vw, 72px)`   |
| `--display-md`   | `clamp(28px, 5vw, 60px)`   |
| `--display-sm`   | `clamp(24px, 3vw, 34px)`   |

### Spacing

Base grid: 4px. Tokens `--space-1` (4px) through `--space-12` (96px).

Layout tokens:

| Token                | Value                      |
| -------------------- | -------------------------- |
| `--pad-inline`       | `clamp(20px, 6vw, 96px)`   |
| `--sec-pad`          | `clamp(64px, 9vw, 140px)`  |
| `--sec-pad-lg`       | `clamp(90px, 13vw, 200px)` |
| `--container`        | `1440px`                   |
| `--container-narrow` | `720px`                    |
| `--measure`          | `34ch`                     |
| `--measure-lead`     | `44ch`                     |

### Radius

| Token            | Value    |
| ---------------- | -------- |
| `--radius-sm`    | `8px`    |
| `--radius-md`    | `14px`   |
| `--radius-lg`    | `18px`   |
| `--radius-xl`    | `24px`   |
| `--radius-pill`  | `9999px` |
| `--radius-card`  | `18px`   |
| `--radius-media` | `14px`   |

### Elevation

| Token      | Value                          |
| ---------- | ------------------------------ |
| `--elev-1` | `none`                         |
| `--elev-2` | `0 8px 30px rgba(0,0,0,0.08)`  |
| `--elev-3` | `0 18px 60px rgba(0,0,0,0.14)` |

### Motion

| Token        | Value                           |
| ------------ | ------------------------------- |
| `--ease`     | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--dur-base` | `500ms`                         |
| `--dur-slow` | `1000ms`                        |
| `--dur-nav`  | `900ms`                         |

Use `prefers-reduced-motion: reduce` to disable transitions and animations.

## Iconography

Use **Lucide** icons. Choose line icons at 1.5px stroke, 24px default size. No filled icons. No icon-only buttons without an aria-label.

## Components

See `src/components/` for the reference implementations of:

- `Button` — primary (black pill), secondary (underlined text), ghost.
- `FeeBand` — mono uppercase hairline pill with optional availability dot.
- `Pill` — topic/tag, mono uppercase in a hairline pill, inverts on hover.
- `SpeakerCard` — grayscale media well, hover lift, fee display.
- `Header` — responsive nav with mobile drawer.
- `Footer` — four-column editorial footer.
- `Breadcrumbs` — path + JSON-LD.
- `Page` — layout wrapper, section padding, FAQ helpers.
- `ClosingCta` — oversized “Get matched” section.

## Caveats

- Fonts (Hanken Grotesk; Newsreader) are self-hosted in `fonts/` as substitutes. Verify licensing before production use.
- The logo wordmark and spotlight mark are placeholder SVGs based on the written brief. Replace with final brand assets before shipping.
- All photography is placeholder. Use real, licensed speaker imagery with consistent monochrome treatment and alt text.
- The icon set is Lucide, a substitute for a potential custom icon set.
- No production codebase was available when this skill was authored; everything was rebuilt from the brief.
