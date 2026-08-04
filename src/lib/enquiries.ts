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

/**
 * Enquiry submission.
 *
 * No backend is connected yet, so this validates and resolves locally — every
 * enquiry is currently discarded. Replace the body with a server function that
 * persists the enquiry and sends the planner and admin emails.
 */
export async function submitEnquiry({ data }: { data: EnquiryInput }) {
  if (!data.work_email || !data.full_name) {
    throw new Error("Missing required fields");
  }
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true as const };
}
