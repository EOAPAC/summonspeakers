import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/speakers", label: "Browse" },
  { to: "/speaker-fees", label: "Fees" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/for-speakers", label: "For speakers" },
];

/** Matches the header's own min-height, so the flip lands on its bottom edge. */
const HEADER_H = 72;

/** The id a dark hero puts on its bottom edge. See `HeroSentinel` below. */
const SENTINEL_ID = "hero-sentinel";

/**
 * Routes that render a `HeroSentinel`.
 *
 * Only used for the first paint: the header has to be dark in the server
 * render, or the page loads with a white bar that snaps to dark once the
 * observer fires. From then on the sentinel is the source of truth, and a
 * route missing from this list still gets the right header a frame later —
 * it just flashes.
 */
const DARK_HERO_ROUTES = new Set(["/"]);

/**
 * A 1px marker at the bottom edge of a dark hero. Absolutely positioned rather
 * than being the section's last child, because the section's bottom padding
 * would otherwise put it ~80px early and flip the header mid-hero.
 */
export function HeroSentinel() {
  return <span id={SENTINEL_ID} aria-hidden="true" className="absolute bottom-0 left-0 size-px" />;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasDarkHero = DARK_HERO_ROUTES.has(pathname);
  const [overHero, setOverHero] = useState(hasDarkHero);

  useEffect(() => {
    setOverHero(hasDarkHero);
    if (!hasDarkHero) return;
    const sentinel = document.getElementById(SENTINEL_ID);
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // `isIntersecting` alone is not enough: a hero taller than the viewport
        // puts the sentinel below the fold, which reads as "scrolled past" and
        // paints a white bar over black. A positive `top` means the hero bottom
        // is still below the header, so we are over it either way.
        setOverHero(entry.isIntersecting || entry.boundingClientRect.top > 0);
      },
      { rootMargin: `-${HEADER_H}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasDarkHero, pathname]);

  // The open mobile panel needs an opaque background of its own, and inheriting
  // the hero's would leave it dark halfway down a white page. Simpler to drop
  // to the solid header for as long as the menu is open.
  const onDark = overHero && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,color] duration-300",
        onDark
          ? // The hero's own colour rather than `transparent`: the header would
            // otherwise let the H1 scroll through the nav on its way past.
            "on-ink border-transparent bg-[var(--color-footer)] text-surface"
          : "border-[var(--line)] bg-surface/95 backdrop-blur",
      )}
    >
      <div className="container-x flex min-h-[72px] items-center justify-between gap-6">
        <Link
          to="/"
          className="label-mono inline-flex min-h-[var(--hit-min)] items-center text-sm font-semibold tracking-[0.1em]"
        >
          SUMMONSPEAKERS
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex min-h-[44px] items-center text-sm transition-colors",
                onDark ? "text-white/70 hover:text-white" : "text-[var(--ink-2)] hover:text-ink",
              )}
              activeProps={{ className: onDark ? "text-white" : "text-ink" }}
            >
              {n.label}
            </Link>
          ))}
          {/* Outlined over the hero, solid once past it. The hero already puts a
              solid white "Get matched" pill 300px below this one, and two
              identical pills read as a duplicate rather than a hierarchy. Once
              that pill scrolls away this is the only CTA left, so it takes over
              as the primary. */}
          <ButtonLink
            to="/get-matched"
            variant={onDark ? "ghostInverse" : "primary"}
            className="px-6 text-sm"
          >
            Get matched
          </ButtonLink>
        </nav>
        <button
          className="flex size-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="label-mono">
            {open ? "CLOSE" : "MENU"}
          </span>
        </button>
      </div>
      {open && (
        <div className="container-x border-t border-[var(--line)] bg-surface pb-6 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex min-h-[56px] items-center border-b border-[var(--line)] text-base"
              >
                {n.label}
              </Link>
            ))}
            <ButtonLink to="/get-matched" className="mt-6" onClick={() => setOpen(false)}>
              Get matched
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
