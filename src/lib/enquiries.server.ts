import { createServerFn } from "@tanstack/react-start";

import { adminInbox, sendEmail } from "./email.server";
import { getServiceClient } from "./supabase.server";

export type EnquiryInput = {
  event_date: string;
  audience_size: string;
  topic_or_speaker: string;
  full_name: string;
  work_email: string;
  budget_range: string;
  city: string;
  notes: string;
  speaker_slug: string | null;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Field ceilings. A server function is a public RPC endpoint; bound everything. */
const LIMITS = {
  event_date: 20,
  audience_size: 40,
  topic_or_speaker: 200,
  full_name: 120,
  work_email: 200,
  budget_range: 40,
  city: 120,
  notes: 2_000,
  speaker_slug: 120,
} as const;

/**
 * Validate and normalise untrusted enquiry input. Throws on the first problem
 * — the client validates the same rules before submitting, so a throw here
 * means the request never came from our form.
 */
export function validateEnquiry(raw: unknown): EnquiryInput {
  const input = (raw ?? {}) as Record<string, unknown>;
  const str = (key: keyof typeof LIMITS): string =>
    typeof input[key] === "string" ? (input[key] as string).trim().slice(0, LIMITS[key]) : "";

  const enquiry: EnquiryInput = {
    event_date: str("event_date"),
    audience_size: str("audience_size"),
    topic_or_speaker: str("topic_or_speaker"),
    full_name: str("full_name"),
    work_email: str("work_email"),
    budget_range: str("budget_range"),
    city: str("city"),
    notes: str("notes"),
    speaker_slug: str("speaker_slug") || null,
  };

  if (!enquiry.event_date) throw new Error("Missing event_date");
  if (!enquiry.audience_size) throw new Error("Missing audience_size");
  if (!enquiry.topic_or_speaker) throw new Error("Missing topic_or_speaker");
  if (!enquiry.full_name) throw new Error("Missing full_name");
  if (!EMAIL_RE.test(enquiry.work_email)) throw new Error("Invalid work_email");
  return enquiry;
}

/**
 * Submit an enquiry. Persists to Supabase, then emails the planner a
 * confirmation and the admin a notification.
 *
 * If Supabase is not configured the enquiry cannot be saved, and pretending
 * otherwise is how leads silently vanish — so the function throws and the form
 * shows its error state rather than a fake success.
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(validateEnquiry)
  .handler(async ({ data }) => {
    const supabase = getServiceClient();
    if (!supabase) {
      console.error("submitEnquiry: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
      throw new Error("Enquiry backend is not configured");
    }

    const { error } = await supabase.from("enquiries").insert({
      event_date: data.event_date,
      audience_size: data.audience_size,
      topic_or_speaker: data.topic_or_speaker,
      full_name: data.full_name,
      work_email: data.work_email,
      budget_range: data.budget_range || null,
      city: data.city || null,
      notes: data.notes || null,
      speaker_slug: data.speaker_slug,
    });
    if (error) {
      console.error("submitEnquiry: insert failed", error);
      throw new Error("Could not save the enquiry");
    }

    const admin = adminInbox();
    if (admin) {
      await sendEmail({
        to: admin,
        subject: `New enquiry: ${data.topic_or_speaker} — ${data.full_name}`,
        text: [
          `Name: ${data.full_name}`,
          `Email: ${data.work_email}`,
          `Event date: ${data.event_date}`,
          `Audience size: ${data.audience_size}`,
          `Topic or speaker: ${data.topic_or_speaker}`,
          data.speaker_slug ? `Speaker slug: ${data.speaker_slug}` : "",
          data.budget_range ? `Budget: ${data.budget_range}` : "",
          data.city ? `City: ${data.city}` : "",
          data.notes ? `Notes: ${data.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }

    await sendEmail({
      to: data.work_email,
      subject: "Your SummonSpeakers enquiry",
      text: [
        `Hi ${data.full_name.split(" ")[0]},`,
        "",
        "Thanks for your enquiry. We'll send a shortlist of matched speakers to this inbox within one business day, with fees included so you can compare before you reply.",
        "",
        `What you told us: ${data.topic_or_speaker}, ${data.event_date}, ${data.audience_size}.`,
        "",
        "— SummonSpeakers",
      ].join("\n"),
    });

    return { ok: true as const };
  });
