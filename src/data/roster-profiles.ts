import type { Speaker } from "./speakers";

/**
 * A roster speaker's full profile, built from their crawled source page by
 * speaker_pages/build_profiles.py. Same shape as a curated Speaker, plus the
 * talk topics and key points the source publishes, precomputed similar slugs,
 * and the origin URL for provenance.
 *
 * Types only — the data lives in roster-profiles.generated.ts, which is
 * server-only (it will be megabytes at full roster size).
 */
export type TalkTopic = { name: string; description: string };

export type RosterProfile = Speaker & {
  key_points: string[];
  talk_topics: TalkTopic[];
  /** Slugs of similar roster speakers, precomputed at build time. */
  similar: string[];
  /** Where the bio, topics and testimonials came from. */
  profile_url: string;
};

/** The card a "Similar speakers" grid needs, nothing more. */
export type RosterProfileCard = Pick<
  RosterProfile,
  "slug" | "name" | "role" | "tagline" | "fee_min" | "fee_max" | "location"
>;
