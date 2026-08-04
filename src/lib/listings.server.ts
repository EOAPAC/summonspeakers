import { createServerFn } from "@tanstack/react-start";

import { adminInbox, sendEmail } from "./email.server";
import { getServiceClient, userFromToken } from "./supabase.server";

export type ListingInput = {
  /** Supabase access token when the speaker signed in; empty for email-only. */
  accessToken: string;
  full_name: string;
  email: string;
  role: string;
  /** Free-text fee band, e.g. "$15k – $20k". Parsed into fee_min/fee_max. */
  fee: string;
  /** Comma- or newline-separated topic names. */
  topics: string;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const LIMITS = {
  accessToken: 4_096,
  full_name: 120,
  email: 200,
  role: 200,
  fee: 60,
  topics: 500,
} as const;

/**
 * Parse "$15k – $20k", "15,000-20000", "20000+" into whole-dollar bounds.
 * Returns nulls when nothing parseable is present — the admin then treats the
 * listing like fee_on_application and chases the number, per the README.
 */
export function parseFeeBand(raw: string): { fee_min: number | null; fee_max: number | null } {
  const matches = [...raw.toLowerCase().matchAll(/\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?/g)];
  const values = matches
    .map((m) => {
      const n = Number((m[1] ?? "").replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0) return null;
      return Math.round(m[2] === "k" ? n * 1_000 : n);
    })
    .filter((n): n is number => n !== null);
  if (values.length === 0) return { fee_min: null, fee_max: null };
  return { fee_min: Math.min(...values), fee_max: Math.max(...values) };
}

/** kebab-case slug from a name; collisions get a numeric suffix at insert. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateListing(raw: unknown): ListingInput {
  const input = (raw ?? {}) as Record<string, unknown>;
  const str = (key: keyof typeof LIMITS): string =>
    typeof input[key] === "string" ? (input[key] as string).trim().slice(0, LIMITS[key]) : "";

  const listing: ListingInput = {
    accessToken: str("accessToken"),
    full_name: str("full_name"),
    email: str("email"),
    role: str("role"),
    fee: str("fee"),
    topics: str("topics"),
  };

  if (!listing.full_name) throw new Error("Missing full_name");
  if (!listing.role) throw new Error("Missing role");
  if (!EMAIL_RE.test(listing.email)) throw new Error("Invalid email");
  return listing;
}

/**
 * Submit a speaker listing from /for-speakers/join.
 *
 * Signed-in path: the browser client completed OAuth, so the form sends its
 * access token; we resolve the user server-side and attach the listing to
 * them as owner. Email-only path: no token, the listing is created unclaimed
 * (owner null) and the admin follows up by email — the README's fallback.
 * Either way it lands as pending_review: only the admin publishes, and the
 * RLS policies make sure an owner cannot promote their own row.
 */
export const submitListing = createServerFn({ method: "POST" })
  .inputValidator(validateListing)
  .handler(async ({ data }) => {
    const supabase = getServiceClient();
    if (!supabase) {
      console.error("submitListing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
      throw new Error("Listing backend is not configured");
    }

    const user = await userFromToken(data.accessToken);
    const { fee_min, fee_max } = parseFeeBand(data.fee);
    const topics = [
      ...new Set(
        data.topics
          .split(/[\n,]+/)
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ];

    const baseSlug = slugify(data.full_name) || "speaker";
    let inserted = false;
    let lastError: unknown = null;
    // A shared name is a real case in this directory (the roster has one), so
    // suffix rather than fail on the unique slug constraint.
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const { error } = await supabase.from("speakers").insert({
        slug,
        name: data.full_name,
        role: data.role,
        fee_min,
        fee_max,
        fee_on_application: fee_min === null,
        topics,
        owner_id: user?.id ?? null,
        status: "pending_review",
      });
      if (!error) {
        inserted = true;
      } else if (error.code === "23505") {
        lastError = error;
      } else {
        console.error("submitListing: insert failed", error);
        throw new Error("Could not save the listing");
      }
    }
    if (!inserted) {
      console.error("submitListing: could not find a free slug", lastError);
      throw new Error("Could not save the listing");
    }

    const admin = adminInbox();
    if (admin) {
      await sendEmail({
        to: admin,
        subject: `New speaker listing: ${data.full_name}`,
        text: [
          `Name: ${data.full_name}`,
          `Email: ${data.email}`,
          `Role: ${data.role}`,
          `Fee: ${data.fee || "not stated"}${fee_min !== null ? ` (parsed ${fee_min}–${fee_max})` : ""}`,
          `Topics: ${topics.join(", ") || "none given"}`,
          `Account: ${user ? `signed in (${user.email ?? user.id})` : "email only — no account"}`,
        ].join("\n"),
      });
    }

    return { ok: true as const, signedIn: user !== null };
  });
