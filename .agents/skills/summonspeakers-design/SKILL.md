---
name: summonspeakers-design
description: Use this skill to generate well-branded interfaces and assets for SummonSpeakers, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

**Source of truth:** `src/styles.css` defines every token and utility this project uses. Where this skill and the code disagree, the code wins — and the skill should be corrected. Never introduce a colour that is not in `src/styles.css`.

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's here

- `README.md` — full context: the two audiences, ten principles, content voice, visual foundations, iconography, and caveats. **Start here.**

- `colors_and_type.css` — all design tokens (color, type, spacing, radius, elevation, motion) + semantic element classes. Import this in any artifact.

- `assets/` — logo wordmark (light + dark) and spotlight mark.

- `preview/` — small specimen cards for every token group and component.

- Reference implementations live in the app itself at `src/components/` — read those, not a separate prototype kit.

## The one thing to remember

Trust is the product. The system is monochrome — there is no brand hue, and the single primary action per page is a solid ink pill that inverts to white on hover. The fee band is a hero element, never fine print. Clarity in five seconds, one primary action, show value before asking for commitment.

## Caveats

Fonts (Hanken Grotesk; Newsreader is self-hosted from `fonts/`), the icon set (Lucide), the logo, and all photography are **substitutions/placeholders** built from a written brief — no production codebase was available. Replace with real brand assets before shipping. See README › CAVEATS.
