import { createServerFn } from "@tanstack/react-start";

import { rosterProfiles } from "@/data/roster-profiles.generated";
import type { RosterProfile, RosterProfileCard } from "@/data/roster-profiles";

/**
 * SERVER ONLY — pulls in roster-profiles.generated.ts (megabytes at full
 * roster size). The /speakers/$slug loader calls this when the slug is not one
 * of the curated profiles.
 */

export type RosterProfilePage = {
  profile: RosterProfile;
  similar: RosterProfileCard[];
};

const SLUG_RE = /^[a-z0-9-]{1,120}$/;

function card(p: RosterProfile): RosterProfileCard {
  return {
    slug: p.slug,
    name: p.name,
    role: p.role,
    tagline: p.tagline,
    fee_min: p.fee_min,
    fee_max: p.fee_max,
    location: p.location,
  };
}

export const getRosterProfilePage = createServerFn({ method: "GET" })
  .validator((input: unknown) => (typeof input === "string" && SLUG_RE.test(input) ? input : ""))
  .handler(({ data: slug }): RosterProfilePage | null => {
    if (!slug) return null;
    const profile = rosterProfiles[slug];
    if (!profile) return null;
    const similar = profile.similar
      .map((s) => rosterProfiles[s])
      .filter((p): p is RosterProfile => Boolean(p))
      .map(card);
    return { profile, similar };
  });
