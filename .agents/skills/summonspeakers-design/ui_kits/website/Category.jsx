/* Category / topic page prototype */

function Category() {
  const speakers = [
    { name: "Dr. Maya Ellison", topics: ["Leadership", "AI ethics"], fee: "$15k – $20k", available: true },
    { name: "Samira Touati", topics: ["Leadership", "Culture"], fee: "$12k – $18k", available: true },
    { name: "Liam Parker", topics: ["Leadership", "Sport"], fee: "$8k – $12k", available: false },
    { name: "Chen Wei", topics: ["Leadership", "Finance"], fee: "$20k – $30k", available: true },
    { name: "Ava Donovan", topics: ["Leadership", "Policy"], fee: "$10k – $15k", available: true },
    { name: "Noah Bertrand", topics: ["Leadership", "Innovation"], fee: "$15k – $25k", available: false }
  ];

  const faq = [
    { question: "How do you choose speakers for a topic?", answer: "We curate by verified topic expertise, audience feedback, and event format experience." },
    { question: "Can I request a speaker outside this category?", answer: "Yes. Brief us on your event and we’ll match across the full directory." }
  ];

  return (
    <div>
      <Page title="Leadership speakers — SummonSpeakers" description="Keynote speakers and moderators on leadership, culture, and organisational change." />
      <Header currentPath="/topics" />
      <Chrome title="Topic: Leadership">
        <section className="section-y-lg">
          <div className="container-x">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Topics", href: "/topics" }, { label: "Leadership" }]} />
            <span className="label-mono" style={{ display: "block", marginBottom: 16 }}>Topic</span>
            <h1 className="display" style={{ fontSize: "var(--display-lg)", marginBottom: 24 }}>Leadership</h1>
            <p className="measure-lead" style={{ fontSize: "clamp(18px, 2vw, 24px)", color: "var(--ink-2)" }}>
              Speakers who help organisations lead through change, build culture, and make better decisions under pressure.
            </p>
          </div>
        </section>

        <section className="section-y" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container-x">
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {speakers.map((s) => <SpeakerCard key={s.name} speaker={s} href={`/speakers/${s.name.toLowerCase().replace(/\s+/g, "-")}`} />)}
            </div>
          </div>
        </section>

        <section className="section-y" style={{ background: "var(--surface-alt)" }}>
          <div className="container-x">
            <h2 className="display" style={{ fontSize: "var(--display-sm)", marginBottom: 32 }}>Common questions</h2>
            <FAQ items={faq} />
          </div>
        </section>
      </Chrome>
      <Footer />
    </div>
  );
}

export default Category;
