import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { submitListing } from "@/lib/listings.server";
import { getBrowserClient, signInWithOAuth, type OAuthProvider } from "@/lib/supabase-auth";
import { absoluteUrl, ogImageMeta } from "@/lib/site";

export const Route = createFileRoute("/for-speakers/join")({
  head: () => ({
    meta: [
      { title: "Join SummonSpeakers — create your speaker listing" },
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
        children: JSON.stringify(
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

type Session = { email: string; accessToken: string };

function Join() {
  // Whether the browser Supabase client is configured — without it the OAuth
  // buttons would be dead ends, so the page stays honest and keeps the
  // email-only path. Set in an effect, not a state initializer: the client
  // only exists in the browser, so reading it during render would hydrate
  // against a different tree than the server sent.
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pick up the session after the OAuth redirect lands back here.
  useEffect(() => {
    const client = getBrowserClient();
    if (!client) return;
    setAuthReady(true);
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s?.user.email ? { email: s.user.email, accessToken: s.access_token } : null);
    });
    void client.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s?.user.email ? { email: s.user.email, accessToken: s.access_token } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleOAuth(provider: OAuthProvider) {
    setAuthError(null);
    try {
      await signInWithOAuth(provider);
      // Browser is now navigating to the provider; nothing more to do here.
    } catch {
      setAuthError("Sign-in didn't start. Try again, or use the form below.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitListing({
        data: {
          accessToken: session?.accessToken ?? "",
          full_name: String(form.get("name") ?? ""),
          // A signed-in speaker's email comes from their account — the form's
          // email field is only for the email-only path.
          email: session?.email ?? String(form.get("email") ?? ""),
          role: String(form.get("role") ?? ""),
          fee: String(form.get("fee") ?? ""),
          topics: String(form.get("topics") ?? ""),
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't submit that. Try again, or email hello@summonspeakers.com.");
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

          {authReady && (
            <div className="mt-12">
              <p className="label-mono text-[var(--ink-3)]">Create your account</p>
              {session ? (
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <p className="text-[var(--ink-2)]">
                    Signed in as <span className="font-semibold text-ink">{session.email}</span>.
                    Your listing will be linked to this account.
                  </p>
                  <button
                    onClick={() => {
                      void getBrowserClient()
                        ?.auth.signOut()
                        .then(() => setSession(null));
                    }}
                    className="inline-flex min-h-[44px] items-center text-sm underline underline-offset-4"
                  >
                    Use a different account
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  {(
                    [
                      ["Continue with Google", "google"],
                      ["Continue with Microsoft", "azure"],
                    ] as const
                  ).map(([label, provider]) => (
                    <button
                      key={provider}
                      onClick={() => void handleOAuth(provider)}
                      className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-full border border-[var(--line-2)] px-6 text-base transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {authError && (
                <p role="alert" className="mt-4 text-sm text-[var(--color-warning)]">
                  {authError}
                </p>
              )}
            </div>
          )}

          <form
            className="hairline-top mt-12 space-y-8 pt-12"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <p className="label-mono text-[var(--ink-3)]">
              {session ? "Your listing" : "Or list with your email"}
            </p>
            <div>
              <label htmlFor="name" className="label-mono mb-3 block text-[var(--ink-3)]">
                Full name
              </label>
              <input id="name" name="name" type="text" required className={fieldBase} />
            </div>
            {!session && (
              <div>
                <label htmlFor="email" className="label-mono mb-3 block text-[var(--ink-3)]">
                  Email
                </label>
                <input id="email" name="email" type="email" required className={fieldBase} />
              </div>
            )}
            <div>
              <label htmlFor="role" className="label-mono mb-3 block text-[var(--ink-3)]">
                How you'd like to be described
              </label>
              <input id="role" name="role" type="text" required className={fieldBase} />
            </div>
            <div>
              <label htmlFor="fee" className="label-mono mb-3 block text-[var(--ink-3)]">
                Your fee band
              </label>
              <input
                id="fee"
                name="fee"
                type="text"
                required
                placeholder="e.g. $15k – $20k"
                className={fieldBase}
              />
            </div>
            <div>
              <label htmlFor="topics" className="label-mono mb-3 block text-[var(--ink-3)]">
                Topics you speak on
              </label>
              <textarea id="topics" name="topics" rows={3} className={`${fieldBase} py-3`} />
            </div>
            {submitted ? (
              <p role="status" className="text-lg">
                Thank you. Your listing is with our editor and we'll be in touch within two business
                days.
              </p>
            ) : (
              <>
                <Button type="submit" loading={submitting}>
                  Submit for review
                </Button>
                {submitError && (
                  <p role="alert" className="text-sm text-[var(--color-warning)]">
                    Error: {submitError}
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </section>
    </Page>
  );
}
