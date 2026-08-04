import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ButtonLink } from "./Button";

const nav = [
  { to: "/speakers", label: "Browse" },
  { to: "/speaker-fees", label: "Fees" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/for-speakers", label: "For speakers" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-surface/95 backdrop-blur">
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
              className="flex min-h-[44px] items-center text-sm text-[var(--ink-2)] transition-colors hover:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              {n.label}
            </Link>
          ))}
          <ButtonLink to="/get-matched" className="px-6 text-sm">
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
        <div className="container-x border-t border-[var(--line)] pb-6 md:hidden">
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
