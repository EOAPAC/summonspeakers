import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { absoluteUrl, ogImageMeta, jsonLd } from "@/lib/site";
import { submitListing } from "@/lib/listings.server";

export const Route = createFileRoute("/for-speakers/join")({
  head: () => ({
    meta: [
      { title: "Join SummonSpeakers: create your speaker listing" },
      {
        name: "description",
        content:
          "Create a speaker listing with your own published fee band. Sign in with Google or Microsoft, add your topics and showreel, and submit for review.",
      },
      { property: "og:title", content: "Join SummonSpeakers" },
      {
        property: "og:description",
        content: "Create your speaker listing and start receiving direct enquiries.",
      },
      { property: "og:url", content: absoluteUrl("/for-speakers/join") },
      ...ogImageMeta("for-speakers"),
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/for-speakers/join") }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          breadcrumbJsonLd([
            { name: "Home", item: "/" },
            { name: "For speakers", item: "/for-speakers" },
            { name: "Join", item: "/for-speakers/join" },
          ]),
        ),
      },
    ],
  }),
  component: Join,
});

const fieldBase =
  "min-h-[56px] w-full rounded-[var(--radius-sm)] border border-[var(--line-2)] bg-surface px-4 text-base";

function Join() {
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const str = (k: string) => String(f.get(k) ?? "");

    setSubmitting(true);
    setError(null);
    try {
      await submitListing({
        data: {
          // Single sign-on is not wired up, so every listing arrives
          // unauthenticated. The server treats an empty token as anonymous and
          // leaves owner_id null for an admin to claim later.
          accessToken: "",
          full_name: str("name"),
          email: str("email"),
          role: str("role"),
          fee: str("fee"),
          topics: str("topics"),
        },
      });
      setSubmitted(true);
      form.reset();
    } catch {
      setError("We couldn't submit that. Try again, or email hello@summonspeakers.com.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "For speakers", to: "/for-speakers" },
          { label: "Join" },
        ]}
      />
      <section className="container-x pb-24 pt-10">
        <div className="max-w-[62ch]">
          <h1 className="display text-[length:var(--display-md)]">Join SummonSpeakers</h1>
          <p className="mt-8 text-lg text-[var(--ink-2)]">
            Create your listing, set your own fee band, and submit it for review. We reply within
            two business days.
          </p>

          <div className="mt-12">
            <p className="label-mono text-[var(--ink-3)]">Create your account</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              {["Continue with Google", "Continue with Microsoft"].map((label) => (
                <button
                  key={label}
                  onClick={() =>
                    setNotice(
                      "Single sign-on is not connected yet. Use the form below and we'll follow up by email.",
                    )
                  }
                  className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-full border border-[var(--line-2)] px-6 text-base transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
                >
                  {label}
                </button>
              ))}
            </div>
            {notice && (
              <p role="status" className="mt-4 text-sm text-[var(--ink-2)]">
                {notice}
              </p>
            )}
          </div>

          <form className="hairline-top mt-12 space-y-8 pt-12" onSubmit={handleSubmit}>
            <p className="label-mono text-[var(--ink-3)]">Or list with your email</p>
            {[
              { id: "name", label: "Full name", type: "text" },
              { id: "email", label: "Email", type: "email" },
              { id: "role", label: "How you'd like to be described", type: "text" },
              { id: "fee", label: "Your fee band", type: "text" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label-mono mb-3 block text-[var(--ink-3)]">
                  {f.label}
                </label>
                <input id={f.id} name={f.id} type={f.type} required className={fieldBase} />
              </div>
            ))}
            <div>
              <label htmlFor="topics" className="label-mono mb-3 block text-[var(--ink-3)]">
                Topics you speak on
              </label>
              <textarea id="topics" name="topics" rows={3} className={`${fieldBase} py-3`} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-[var(--color-warning)]">
                Error: {error}
              </p>
            )}
            {submitted ? (
              <p role="status" className="text-lg">
                Thank you. Your listing is with our editor and we'll be in touch within two business
                days.
              </p>
            ) : (
              <Button type="submit" loading={submitting}>
                Submit for review
              </Button>
            )}
          </form>
        </div>
      </section>
    </Page>
  );
}
