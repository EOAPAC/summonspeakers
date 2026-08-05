import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "primaryInverse" | "secondary" | "ghost" | "ghostInverse";

const base =
  "group inline-flex items-center justify-center gap-3 font-semibold transition-all duration-500 [transition-timing-function:var(--ease)] disabled:opacity-40 disabled:pointer-events-none";

// `ghostInverse` carries the arrow too, so the header CTA keeps its width when
// it swaps to `primary` on scroll instead of jumping as a glyph appears.
const arrow = (variant: Variant) =>
  variant === "primary" || variant === "primaryInverse" || variant === "ghostInverse" ? (
    <span
      aria-hidden="true"
      className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:translate-x-1 group-hover:-translate-y-1"
    >
      ↗
    </span>
  ) : variant === "secondary" ? (
    <span aria-hidden="true">→</span>
  ) : null;

const variants: Record<Variant, string> = {
  primary:
    "rounded-full bg-ink text-surface min-h-[var(--hit-primary)] px-8 text-base tracking-[-0.02em] border border-ink hover:bg-surface hover:text-ink",
  // The primary button on a dark section. Same shape and same hover inversion,
  // colours swapped, because bg-ink on a near-black surface is invisible.
  primaryInverse:
    "rounded-full bg-surface text-ink min-h-[var(--hit-primary)] px-8 text-base tracking-[-0.02em] border border-surface hover:bg-transparent hover:text-surface",
  secondary:
    "min-h-[var(--hit-min)] text-base underline underline-offset-4 decoration-[var(--line-2)] hover:decoration-ink text-ink",
  ghost:
    "rounded-full border border-[var(--line-2)] min-h-[var(--hit-min)] px-6 text-sm hover:bg-ink hover:text-surface",
  // `ghost` on a dark section. Its hairline is a black alpha, which disappears
  // on near-black, and its hover fills black on black.
  ghostInverse:
    "rounded-full border border-white/35 min-h-[var(--hit-min)] px-6 text-sm text-surface hover:bg-surface hover:text-ink hover:border-surface",
};

export function Button({
  variant = "primary",
  className,
  loading,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Sending…" : children}
      {arrow(variant)}
    </button>
  );
}

function ButtonAnchor({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; children?: ReactNode }) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
      {arrow(variant)}
    </a>
  );
}

// Built with createLink rather than by wrapping <Link> directly. A plain
// wrapper widens `to`/`params`/`search` to the non-generic Link signature,
// which is why every call site previously needed an `as never` cast.
const ButtonLinkImpl = createLink(ButtonAnchor);

export const ButtonLink: LinkComponent<typeof ButtonAnchor> = (props) => (
  <ButtonLinkImpl {...props} />
);
