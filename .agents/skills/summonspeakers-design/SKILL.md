---
name: summonspeakers-design
description: Use this skill to generate well-branded interfaces and assets for SummonSpeakers, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's here

- `README.md` — full context: the two audiences, ten principles, content voice, visual foundations, iconography, and caveats. **Start here.**

- `colors_and_type.css` — all design tokens (color, type, spacing, radius, elevation, motion) + semantic element classes. Import this in any artifact.

- `assets/` — logo wordmark (light + dark) and spotlight mark.

- `preview/` — small specimen cards for every token group and component.

- `ui_kits/website/` — interactive recreation of the marketing + marketplace site (home, category, profile, enquiry flow) with reusable JSX components in `shared.jsx`, `Chrome.jsx`, `Home.jsx`, `Category.jsx`, `Profile.jsx`, `Enquiry.jsx`.

## The one thing to remember

Trust is the product. Amber is rationed to the single primary CTA per page; navy is the trust anchor; the fee band is a hero element, never fine print. Clarity in five seconds, one primary action, show value before asking for commitment.

## Caveats

Fonts (Hanken Grotesk; Newsreader is self-hosted from `fonts/`), the icon set (Lucide), the logo, and all photography are **substitutions/placeholders** built from a written brief — no production codebase was available. Replace with real brand assets before shipping. See README › CAVEATS.
