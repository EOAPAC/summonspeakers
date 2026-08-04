/* Enquiry flow prototype — 3 steps */

function Enquiry() {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    eventName: "",
    date: "",
    audience: "",
    topic: "",
    name: "",
    email: "",
    organisation: "",
    budget: "",
    notes: ""
  });
  const [submitted, setSubmitted] = React.useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next(e) {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <Page title="Enquiry sent — SummonSpeakers" description="Your speaker enquiry has been submitted." />
        <Header currentPath="/get-matched" />
        <Chrome title="Enquiry success">
          <section className="section-y-lg">
            <div className="container-x" style={{ maxWidth: 600 }}>
              <h1 className="display" style={{ fontSize: "var(--display-md)", marginBottom: 24 }}>Brief received</h1>
              <p style={{ color: "var(--ink-2)", fontSize: 18, marginBottom: 32 }}>
                We’ll review your event and return a shortlist of speakers within 24 hours.
              </p>
              <Button href="/" variant="primary">Back to home</Button>
            </div>
          </section>
        </Chrome>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Page title="Get matched — SummonSpeakers" description="Tell us about your event and we’ll match you with the right speaker." />
      <Header currentPath="/get-matched" />
      <Chrome title="Enquiry flow">
        <section className="section-y-lg">
          <div className="container-x" style={{ maxWidth: 720 }}>
            <span className="label-mono" style={{ display: "block", marginBottom: 16 }}>Step {step} of 3</span>
            <h1 className="display" style={{ fontSize: "var(--display-md)", marginBottom: 32 }}>
              {step === 1 && "Tell us about your event"}
              {step === 2 && "Your contact details"}
              {step === 3 && "Final details"}
            </h1>

            <form onSubmit={next} style={{ display: "grid", gap: 24 }}>
              {step === 1 && (
                <>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Event name</span>
                    <input type="text" required value={form.eventName} onChange={(e) => update("eventName", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Event date</span>
                    <input type="date" required value={form.date} onChange={(e) => update("date", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Audience size</span>
                    <select required value={form.audience} onChange={(e) => update("audience", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }}>
                      <option value="">Select…</option>
                      <option value="50-100">50 – 100</option>
                      <option value="100-500">100 – 500</option>
                      <option value="500-1000">500 – 1000</option>
                      <option value="1000+">1000+</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Topic or theme</span>
                    <input type="text" value={form.topic} onChange={(e) => update("topic", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Full name</span>
                    <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Work email</span>
                    <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Organisation</span>
                    <input type="text" required value={form.organisation} onChange={(e) => update("organisation", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                </>
              )}

              {step === 3 && (
                <>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Fee budget</span>
                    <select value={form.budget} onChange={(e) => update("budget", e.target.value)} style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }}>
                      <option value="">Select…</option>
                      <option value="under-10k">Under $10k</option>
                      <option value="10k-20k">$10k – $20k</option>
                      <option value="20k-50k">$20k – $50k</option>
                      <option value="over-50k">Over $50k</option>
                      <option value="open">Fee on application</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span className="label-mono">Anything else?</span>
                    <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={5} style={{ padding: 12, border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)" }} />
                  </label>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">Back</button>
                ) : (
                  <span />
                )}
                <Button variant="primary">{step === 3 ? "Send brief" : "Continue"}</Button>
              </div>
            </form>
          </div>
        </section>
      </Chrome>
      <Footer />
    </div>
  );
}

export default Enquiry;
