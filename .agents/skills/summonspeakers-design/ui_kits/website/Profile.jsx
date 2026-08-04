/* Speaker profile page prototype */

function Profile() {
  const speaker = {
    name: "Dr. Maya Ellison",
    tagline: "Leadership researcher. AI ethics adviser. Former chief of staff to two Fortune 50 CEOs.",
    fee: "$15k – $20k",
    available: true,
    topics: ["Leadership", "AI ethics", "Culture change", "Decision-making"],
    bio: "Dr. Maya Ellison studies how leaders make decisions under uncertainty. She advises boards and executive teams on responsible AI adoption, culture change, and governance. Her keynote, The Quiet Leader, has been delivered at over 120 events across Europe, North America, and Asia.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
  };

  return (
    <div>
      <Page title={`${speaker.name} — SummonSpeakers`} description={`Book ${speaker.name} for your event. ${speaker.tagline}`} />
      <Header currentPath="/speakers" />
      <Chrome title={`Profile: ${speaker.name}`}>
        <section className="section-y-lg">
          <div className="container-x">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Speakers", href: "/speakers" }, { label: speaker.name }]} />
            <div style={{ display: "grid", gap: 48, gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
              <div>
                <span className="label-mono" style={{ display: "block", marginBottom: 16 }}>Speaker profile</span>
                <h1 className="display" style={{ fontSize: "var(--display-lg)", marginBottom: 16 }}>{speaker.name}</h1>
                <p className="measure-lead" style={{ color: "var(--ink-2)", marginBottom: 24 }}>{speaker.tagline}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                  <FeeBand available={speaker.available}>{speaker.fee}</FeeBand>
                  {speaker.topics.map((t) => <Pill key={t}>{t}</Pill>)}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button href="/get-matched?speaker=maya-ellison" variant="primary">Request Maya</Button>
                  <Button href="#bio" variant="secondary">Read bio</Button>
                </div>
              </div>
              <div className="media-well" style={{ aspectRatio: "4/5" }}>
                <img src={speaker.image} alt={speaker.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
              </div>
            </div>
          </div>
        </section>

        <section id="bio" className="section-y" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container-x">
            <div style={{ display: "grid", gap: 48, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <h2 className="display" style={{ fontSize: "var(--display-sm)", marginBottom: 24 }}>About</h2>
                <p style={{ color: "var(--ink-2)", maxWidth: "var(--measure-lead)", fontSize: 18, lineHeight: 1.6 }}>{speaker.bio}</p>
              </div>
              <div>
                <h2 className="display" style={{ fontSize: "var(--display-sm)", marginBottom: 24 }}>Topics</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {speaker.topics.map((t) => <Pill key={t} href={`/topics/${t.toLowerCase().replace(/\s+/g, "-")}`}>{t}</Pill>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Chrome>
      <Footer />
    </div>
  );
}

export default Profile;
