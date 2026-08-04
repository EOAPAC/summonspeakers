import { Link } from "@tanstack/react-router";

const cols = [
  {
    heading: "BROWSE",
    links: [
      { to: "/speakers", label: "All speakers" },
      { to: "/topics/$slug", params: { slug: "leadership" }, label: "Leadership" },
      { to: "/topics/$slug", params: { slug: "motivational" }, label: "Motivational" },
      { to: "/topics/$slug", params: { slug: "futurist-ai" }, label: "Futurist & AI" },
    ],
  },
  {
    heading: "PLANNERS",
    links: [
      { to: "/get-matched", label: "Get matched" },
      { to: "/speaker-fees", label: "Speaker fees" },
      { to: "/how-it-works", label: "How it works" },
    ],
  },
  {
    heading: "SPEAKERS",
    links: [
      { to: "/for-speakers", label: "Why list with us" },
      { to: "/for-speakers/join", label: "Join SummonSpeakers" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { to: "/about", label: "About" },
      { to: "/blog", label: "Journal" },
      { to: "/case-studies", label: "Case studies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-ink bg-[var(--color-footer)] text-surface">
      <div className="container-x section-y">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="label-mono">SUMMONSPEAKERS</p>
            <p className="mt-4 max-w-[24ch] text-sm text-white/60">
              Book the keynote speaker your event deserves — with fees shown upfront.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="label-mono text-white/50">{col.heading}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      params={l.params as never}
                      className="inline-flex min-h-[44px] items-center text-sm text-white/80 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="label-mono mt-16 border-t border-[var(--line-on-dark)] pt-8 text-white/40">
          © {new Date().getFullYear()} SUMMONSPEAKERS
        </p>
      </div>
    </footer>
  );
}
