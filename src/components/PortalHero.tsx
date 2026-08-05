import { Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";

import { ButtonLink } from "./Button";
import { HeroSentinel } from "./Header";
import { Eyebrow } from "./Page";

const clients = ["NORTHBRIDGE", "ARDENT HEALTH", "MERIDIAN", "HAVENLINE", "PALEWOOD"];

/** SSR renders on the server, where useLayoutEffect warns. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/**
 * The portal hero. The page opens closed: two black panels meet in the middle,
 * the wordmark sits whole across them, and there is no header. On scroll the
 * panels part to uncover the portrait, the wordmark grows while its tracking
 * tightens and its halves fly off opposite edges, and the sticky header plus
 * the hero content arrive in the space it vacated. One motion, not two.
 *
 * Everything binds to scroll position so it reverses on the way back up. Styles
 * are written to refs inside requestAnimationFrame — setState per scroll frame
 * would drop frames on the largest image on the site.
 *
 * The markup ships OPEN (panels clear, content visible, wordmark gone) and the
 * mount effect closes it. That makes the SSR render, the no-JS render and the
 * reduced-motion render all the finished page, which is the only way this
 * degrades safely. The header is driven through two custom properties on the
 * root element — `--portal-hdr` (0..1) and `--portal-hdr-pe` (pointer-events
 * keyword) — because the header belongs to another component and per-frame
 * React state is off the table.
 */
export function PortalHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const panelLRef = useRef<HTMLDivElement>(null);
  const panelRRef = useRef<HTMLDivElement>(null);
  const dotLRef = useRef<HTMLSpanElement>(null);
  const dotRRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const markWrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);
  const spanARef = useRef<HTMLSpanElement>(null);
  const spanBRef = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === "undefined") return;

    // Reduced motion: leave the shipped-open state alone, bind nothing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-section.getBoundingClientRect().top / total, 0, 1);
      const raw = Math.min(1, p / 0.62);
      const e = raw * raw * (3 - 2 * raw);
      const band = (a: number, b: number) => clamp((e - a) / (b - a), 0, 1);

      if (panelLRef.current) panelLRef.current.style.transform = `translate3d(${-112 * e}%, 0, 0)`;
      if (panelRRef.current) panelRRef.current.style.transform = `translate3d(${112 * e}%, 0, 0)`;

      if (imgRef.current) {
        imgRef.current.style.transform = `scale(${1.14 - 0.14 * e})`;
        imgRef.current.style.filter = `brightness(${0.62 + 0.38 * e}) contrast(${0.86 + 0.14 * e})`;
        imgRef.current.style.opacity = String(0.7 + 0.3 * e);
      }
      if (washRef.current) washRef.current.style.opacity = String(0.34 * e);
      if (veilRef.current) veilRef.current.style.opacity = String(0.55 + 0.45 * e);

      const dotFade = String(1 - band(0, 0.7));
      if (dotLRef.current) {
        dotLRef.current.style.transform = `translate(${-40 * e}vw, ${-29 * e}vh)`;
        dotLRef.current.style.opacity = dotFade;
      }
      if (dotRRef.current) {
        dotRRef.current.style.transform = `translate(${40 * e}vw, ${29 * e}vh)`;
        dotRRef.current.style.opacity = dotFade;
      }

      // Grow and tighten together — one without the other reads as a plain zoom.
      if (markRef.current) {
        markRef.current.style.transform = `scale(${1 + 0.22 * e})`;
        markRef.current.style.letterSpacing = `${-0.012 - 0.05 * e}em`;
      }
      if (spanARef.current) spanARef.current.style.transform = `translateX(${-62 * e}vw)`;
      if (spanBRef.current) spanBRef.current.style.transform = `translateX(${62 * e}vw)`;
      if (markWrapRef.current) markWrapRef.current.style.opacity = String(1 - band(0.62, 0.96));

      const reveal = band(0.55, 1);
      root.style.setProperty("--portal-hdr", String(reveal));
      root.style.setProperty("--portal-hdr-pe", reveal > 0.5 ? "auto" : "none");

      if (contentRef.current) {
        contentRef.current.style.opacity = String(reveal);
        contentRef.current.style.transform = `translateY(${26 * (1 - reveal)}px)`;
        // Invisible content must not swallow clicks on the seam dots or take
        // keyboard focus while the portal is closed.
        contentRef.current.style.visibility = reveal === 0 ? "hidden" : "visible";
        contentRef.current.style.pointerEvents = reveal > 0.5 ? "auto" : "none";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      // Leaving the page mid-portal must not strand the header hidden.
      root.style.removeProperty("--portal-hdr");
      root.style.removeProperty("--portal-hdr-pe");
    };
  }, []);

  return (
    // -mt matches the header's 72px min-height: the header ships hidden at
    // scroll 0, and without the pull-up its empty flow slot reads as a white
    // bar above the closed portal.
    <section ref={sectionRef} className="relative -mt-[72px] h-[250vh] bg-[var(--color-footer)]">
      <div className="on-ink sticky top-0 isolate h-dvh overflow-hidden text-surface">
        {/* 1 — portrait. LCP element; preloaded from the route head. */}
        <img
          ref={imgRef}
          src="/hero-speaker.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover will-change-transform"
          style={{ objectPosition: "78% center" }}
        />
        {/* 2 — wash */}
        <div
          ref={washRef}
          aria-hidden="true"
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.42), rgba(0,0,0,.6))",
            opacity: 0.34,
          }}
        />
        {/* 3 — veil. Left-to-right, not radial: the portrait is lit on the right
            and the copy sits on the left, so the shadow runs horizontally. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,12,14,.96) 0%, rgba(10,12,14,.86) 42%, rgba(10,12,14,.25) 78%, rgba(10,12,14,.5) 100%)",
            opacity: 1,
          }}
        />
        {/* 4 — panels, shipped clear of the viewport */}
        <div
          ref={panelLRef}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[52%] border-r border-white/10 bg-[var(--color-footer)] will-change-transform"
          style={{ transform: "translate3d(-112%, 0, 0)" }}
        />
        <div
          ref={panelRRef}
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[52%] bg-[var(--color-footer)] will-change-transform"
          style={{ transform: "translate3d(112%, 0, 0)" }}
        />
        {/* 5 — seam dots, above the panels so they mark the closed seam */}
        <span
          ref={dotLRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-white"
          style={{ marginLeft: -21.5, opacity: 0 }}
        />
        <span
          ref={dotRRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-white"
          style={{ marginLeft: 14.5, opacity: 0 }}
        />
        {/* 6 — content stack, shipped visible */}
        <div ref={contentRef} className="relative z-10 flex h-full flex-col justify-center">
          <div className="container-x">
            <h1 className="display max-w-[19ch] text-[length:clamp(34px,6.2vw,92px)]">
              Keynote Speakers Your Event Deserves
            </h1>
            <p className="mt-8 max-w-[48ch] text-lg text-white/70">
              Browse, compare and book professional speakers with fees shown upfront. No hidden
              fees, no guessing what they cost.
            </p>
            <div className="mt-10 flex flex-col flex-wrap items-start gap-6 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-8">
              <ButtonLink to="/get-matched" variant="primaryInverse">
                Get matched
              </ButtonLink>
              <Link
                to="/speakers"
                className="inline-flex min-h-[44px] items-center gap-2 text-base text-surface underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                Browse speakers <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="label-mono mt-6 text-white/75">Free to enquire, no obligation</p>
            <div className="mt-12 hidden border-t border-[var(--line-on-dark)] pt-8 min-[700px]:block">
              <Eyebrow className="text-white/60">Trusted by event teams at</Eyebrow>
              <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
                {clients.map((c) => (
                  <li key={c} className="label-mono-lg text-white/80">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* 7 — wordmark. Not the h1: it duplicates the logo and carries no
            search value, and getting that wrong costs the homepage its only H1.
            8.4vw is measured, not arbitrary — at 11vw the fourteen characters
            render at ~101% of viewport and both outer S's clip. */}
        <div
          ref={markWrapRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          style={{ opacity: 0 }}
        >
          <p
            ref={markRef}
            className="flex whitespace-nowrap font-extrabold uppercase leading-none"
            style={{
              fontSize: "clamp(28px, 8.4vw, 112px)",
              letterSpacing: "-0.012em",
              gap: "0.04em",
            }}
          >
            <span ref={spanARef} className="will-change-transform">
              SUMMON
            </span>
            <span ref={spanBRef} className="will-change-transform">
              SPEAKERS
            </span>
          </p>
        </div>
      </div>
      <HeroSentinel />
    </section>
  );
}
