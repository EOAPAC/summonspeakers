# Hero heading size reduction

## Goal
Reduce the maximum size of the homepage H1 (“Book the keynote speaker your event deserves”) so it remains the largest display element but no longer feels oversized on very wide screens.

## Current state
- `src/styles.css` defines `--display-hero: clamp(44px, 9vw, 150px);`
- At the user’s current 1689px viewport, the computed size is roughly 152px, which reads as billboard-like.

## Change
- In `src/styles.css`, update the `--display-hero` token to a lower max value while keeping the minimum and viewport scaling intact.
- Proposed value: `clamp(44px, 8vw, 112px)` — still the largest heading on the page, but capped below the oversized territory.

## Verification
- Run a production build to confirm the CSS still compiles.
- Spot-check the homepage in the preview at the current desktop width to confirm the heading no longer dominates the viewport.
