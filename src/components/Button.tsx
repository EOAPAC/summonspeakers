import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-500 [transition-timing-function:var(--ease)] disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "rounded-full bg-ink text-surface min-h-[var(--hit-primary)] px-8 text-base tracking-[-0.02em] border border-ink hover:bg-surface hover:text-ink",
  secondary:
    "min-h-[var(--hit-min)] text-base underline underline-offset-4 decoration-[var(--line-2)] hover:decoration-ink text-ink",
  ghost:
    "rounded-full border border-[var(--line-2)] min-h-[var(--hit-min)] px-6 text-sm hover:bg-ink hover:text-surface",
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
      {variant === "secondary" ? <span aria-hidden="true">→</span> : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children?: ReactNode }) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
      {variant === "secondary" ? <span aria-hidden="true">→</span> : null}
    </Link>
  );
}
