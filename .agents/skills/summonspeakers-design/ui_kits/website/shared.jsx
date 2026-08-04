/* SummonSpeakers UI kit — shared components
 * These components use the design tokens in ../colors_and_type.css.
 * Use them inside a React/Babel setup or copy into production code.
 */

export function Button({ children, variant = "primary", href, onClick, loading, ariaLabel }) {
  const Tag = href ? "a" : "button";
  const className = {
    primary: "btn-primary",
    amber: "btn-amber",
    secondary: "btn-secondary",
    ghost: "btn-secondary"
  }[variant] || "btn-primary";

  return (
    <Tag
      className={className}
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      style={{ pointerEvents: loading ? "none" : undefined }}
    >
      {loading ? "Sending…" : children}
    </Tag>
  );
}

export function FeeBand({ children, available }) {
  return (
    <span className="fee-band">
      {available && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--cta-amber)",
            display: "inline-block"
          }}
        />
      )}
      {children}
    </span>
  );
}

export function Pill({ children, href }) {
  return href ? (
    <a href={href} className="pill" style={{ textDecoration: "none" }}>
      {children}
    </a>
  ) : (
    <span className="pill">{children}</span>
  );
}

export function SpeakerCard({ speaker, href }) {
  return (
    <a href={href} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="media-well" style={{ borderRadius: 0, height: 220 }}>
        <img
          src={speaker.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"}
          alt={speaker.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }}
        />
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{speaker.name}</div>
        <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 12 }}>
          {speaker.topics?.slice(0, 2).join(" · ")}
        </div>
        <FeeBand available={speaker.available}>{speaker.fee}</FeeBand>
      </div>
    </a>
  );
}

export function Header({ currentPath }) {
  const [open, setOpen] = React.useState(false);
  const links = [
    { label: "Speakers", href: "/speakers" },
    { label: "Topics", href: "/topics" },
    { label: "Fees", href: "/fees" },
    { label: "How it works", href: "/how-it-works" },
    { label: "For speakers", href: "/for-speakers" }
  ];

  return (
    <header className="hairline-top" style={{ borderBottom: "1px solid var(--line)" }}>
      <div className="container-x" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, letterSpacing: "-0.04em", fontSize: 20 }}>
          SummonSpeakers
        </a>
        <nav style={{ display: "flex", gap: 24, alignItems: "center" }} className="desktop-nav">
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ textDecoration: "none", color: currentPath === l.href ? "var(--ink)" : "var(--ink-2)", fontWeight: 500, fontSize: 14 }}>
              {l.label}
            </a>
          ))}
          <Button href="/get-matched" variant="primary">Get matched</Button>
        </nav>
        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="mobile-nav" style={{ borderTop: "1px solid var(--line)", padding: "16px var(--pad-inline)" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ display: "block", padding: "12px 0", textDecoration: "none", color: "var(--ink-2)" }}>
              {l.label}
            </a>
          ))}
          <Button href="/get-matched" variant="primary" style={{ marginTop: 12 }}>Get matched</Button>
        </div>
      )}
      <style>{`
        .mobile-toggle { display: none; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="on-ink" style={{ paddingBlock: "var(--sec-pad)" }}>
      <div className="container-x" style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div>
          <div style={{ fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 16 }}>SummonSpeakers</div>
          <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: "32ch" }}>
            Matching event organisers with speakers who move audiences.
          </p>
        </div>
        <div>
          <div className="label-mono" style={{ marginBottom: 16, color: "var(--ink-3)" }}>Explore</div>
          <a href="/speakers" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>Speakers</a>
          <a href="/topics" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>Topics</a>
          <a href="/fees" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>Fees</a>
        </div>
        <div>
          <div className="label-mono" style={{ marginBottom: 16, color: "var(--ink-3)" }}>Company</div>
          <a href="/how-it-works" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>How it works</a>
          <a href="/for-speakers" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>For speakers</a>
        </div>
        <div>
          <div className="label-mono" style={{ marginBottom: 16, color: "var(--ink-3)" }}>Legal</div>
          <a href="/privacy" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>Privacy</a>
          <a href="/terms" style={{ display: "block", color: "#fff", textDecoration: "none", marginBottom: 8, fontSize: 14 }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, fontSize: 14, color: "var(--ink-3)" }}>
        {items.map((item, i) => (
          <li key={item.href || item.label}>
            {i > 0 && <span style={{ marginRight: 8 }}>/</span>}
            {item.href ? <a href={item.href} style={{ color: "var(--ink-2)", textDecoration: "none" }}>{item.label}</a> : <span style={{ color: "var(--ink)" }}>{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Page({ children, title, description }) {
  return (
    <div>
      <title>{title}</title>
      <meta name="description" content={description} />
      {children}
    </div>
  );
}

export function ClosingCta({ title = "Get matched", body = "Tell us about your event. We’ll return a shortlist of speakers within 24 hours." }) {
  return (
    <section className="section-y-lg" style={{ background: "var(--surface-alt)" }}>
      <div className="container-x">
        <div style={{ maxWidth: 900 }}>
          <h2 className="display" style={{ fontSize: "var(--display-cta)", marginBottom: 24 }}>{title}</h2>
          <p className="measure-lead" style={{ fontSize: "clamp(18px, 2vw, 24px)", color: "var(--ink-2)", marginBottom: 32 }}>
            {body}
          </p>
          <Button href="/get-matched" variant="primary">Start your brief</Button>
        </div>
      </div>
    </section>
  );
}

export function FAQ({ items }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {items.map((item) => (
        <details key={item.question} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <summary style={{ fontWeight: 700, cursor: "pointer", listStyle: "none" }}>{item.question}</summary>
          <p style={{ color: "var(--ink-2)", marginTop: 12, maxWidth: "var(--measure-lead)" }}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
