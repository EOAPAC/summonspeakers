/**
 * Transactional email via Resend's HTTPS API. SERVER ONLY — RESEND_API_KEY is
 * a secret and must stay unprefixed (see AGENTS.md).
 *
 * fetch rather than the resend package: the API is one POST, and a dependency
 * to wrap one POST buys nothing.
 *
 * Env vars:
 *   RESEND_API_KEY — secret, server-side.
 *   RESEND_FROM    — verified sender, e.g. "SummonSpeakers <hello@summonspeakers.com>".
 *   ADMIN_EMAIL    — where enquiry and listing notifications land.
 *
 * Email is best-effort by design: an enquiry is already persisted before we
 * get here, so a Resend outage must not turn a saved enquiry into a failed
 * one. Failures are logged, not thrown.
 */

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload): Promise<{ sent: boolean }> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM"];
  if (!apiKey || !from) {
    console.warn("sendEmail skipped: RESEND_API_KEY or RESEND_FROM is not set", {
      subject: payload.subject,
    });
    return { sent: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: payload.to, subject: payload.subject, text: payload.text }),
    });
    if (!res.ok) {
      console.error("Resend rejected an email", { status: res.status, body: await res.text() });
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("Resend request failed", error);
    return { sent: false };
  }
}

export function adminInbox(): string | null {
  return process.env["ADMIN_EMAIL"] ?? null;
}
