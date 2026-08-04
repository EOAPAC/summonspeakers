/* Home page prototype */

function Home() {
  const featured = [
    { name: "Dr. Maya Ellison", topics: ["Leadership", "AI ethics"], fee: "$15k – $20k", available: true },
    { name: "Jonas Reeves", topics: ["Climate", "Policy"], fee: "$10k – $15k", available: false },
    { name: "Priya Nambiar", topics: ["Finance", "Behaviour"], fee: "$20k – $30k", available: true },
    { name: "Derek Holt", topics: ["Sport", "Performance"], fee: "$8k – $12k", available: true }
  ];

  const categories = ["Leadership", "Innovation", "Climate", "Finance", "Health", "Sport", "Culture", "Policy"];

  return (
    <div>
      <Page title="SummonSpeakers — Find a keynote speaker for your next event" description="A speaker marketplace matching event organisers with keynote speakers, moderators, and panelists." />
      <Header currentPath="/" />
      <Chrome title="Homepage">
        <section className="section-y-lg" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="container-x">
            <span className="label-mono" style={{ display: "block", marginBottom: 16 }}>Speaker marketplace</span>
            <h1 className="display" style={{ fontSize: "var(--display-hero)", maxWidth: "12ch", marginBottom: 24 }}>
              Find the speaker your audience needs
            </h1>
            <p className="measure-lead" style={{ fontSize: "clamp(18px, 2vw, 24px)", color: "var(--ink-2)", marginBottom: 32 }}>
              SummonSpeakers matches event organisers with keynote speakers, moderators, and panelists who can move an audience.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button href="/get-matched" variant="primary">Get matched</Button>
              <Button href="/speakers" variant="secondary">View speakers</Button>
            </div>
          </div>
        </section>

        <section className="section-y">
          <div className="container-x">
            <h2 className="display" style={{ fontSize: "var(--display-sm)", marginBottom: 32 }}>Browse by topic</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {categories.map((c) => <Pill key={c} href={`/topics/${c.toLowerCase()}`}>{c}</Pill>)}
            </div>
          </div>
        </section>

        <section className="section-y" style={{ background: "var(--surface-alt)" }}>
          <div className="container-x">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
              <h2 className="display" style={{ fontSize: "var(--display-sm)" }}>Featured speakers</h2>
              <Button href="/speakers" variant="secondary">View all</Button>
            </div>
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {featured.map((s) => <SpeakerCard key={s.name} speaker={s} href={`/speakers/${s.name.toLowerCase().replace(/\s+/g, "-")}`} />)}
            </div>
          </div>
        </section>

        <ClosingCta />
      </Chrome>
      <Footer />
    </div>
  );
}

export default Home;
