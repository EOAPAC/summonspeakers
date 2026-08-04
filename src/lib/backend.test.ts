import { describe, expect, it } from "bun:test";

import { validateEnquiry } from "./enquiries.server";
import { parseFeeBand, slugify, validateListing } from "./listings.server";

const valid = {
  event_date: "2026-11-14",
  audience_size: "100 – 300",
  topic_or_speaker: "Leadership",
  full_name: "Alex Planner",
  work_email: "alex@example.com",
  budget_range: "",
  city: "",
  notes: "",
  speaker_slug: null,
};

describe("validateEnquiry", () => {
  it("accepts a complete enquiry", () => {
    expect(validateEnquiry(valid)).toEqual(valid);
  });

  it("accepts the optional step-3 fields empty", () => {
    const out = validateEnquiry({ ...valid, notes: undefined, city: undefined });
    expect(out.notes).toBe("");
    expect(out.city).toBe("");
  });

  it.each([
    ["event_date", { ...valid, event_date: "" }],
    ["audience_size", { ...valid, audience_size: "" }],
    ["topic_or_speaker", { ...valid, topic_or_speaker: "" }],
    ["full_name", { ...valid, full_name: "  " }],
  ])("rejects a missing %s", (_field, input) => {
    expect(() => validateEnquiry(input)).toThrow();
  });

  it("rejects a malformed email", () => {
    expect(() => validateEnquiry({ ...valid, work_email: "not-an-email" })).toThrow();
  });

  it("bounds every field, so an over-long notes blob is truncated not trusted", () => {
    const out = validateEnquiry({ ...valid, notes: "x".repeat(10_000) });
    expect(out.notes.length).toBe(2_000);
  });

  it("drops a non-string speaker_slug", () => {
    const out = validateEnquiry({ ...valid, speaker_slug: 42 });
    expect(out.speaker_slug).toBeNull();
  });
});

describe("parseFeeBand", () => {
  it.each([
    ["$15k – $20k", 15_000, 20_000],
    ["15,000-20000", 15_000, 20_000],
    ["$40k+", 40_000, 40_000],
    ["$7,500 – $11,500", 7_500, 11_500],
  ])("parses %s", (input, min, max) => {
    expect(parseFeeBand(input)).toEqual({ fee_min: min, fee_max: max });
  });

  it("returns nulls when there is nothing to parse", () => {
    expect(parseFeeBand("let's talk")).toEqual({ fee_min: null, fee_max: null });
  });

  it("orders a reversed band", () => {
    expect(parseFeeBand("$20k - $15k")).toEqual({ fee_min: 15_000, fee_max: 20_000 });
  });
});

describe("slugify", () => {
  it("kebab-cases a name", () => {
    expect(slugify("Dr Maya Ellison")).toBe("dr-maya-ellison");
  });

  it("strips diacritics", () => {
    expect(slugify("Sören Åström")).toBe("soren-astrom");
  });

  it("collapses punctuation", () => {
    expect(slugify("O'Brien, K.")).toBe("o-brien-k");
  });
});

describe("validateListing", () => {
  const listing = {
    accessToken: "",
    full_name: "Sam Speaker",
    email: "sam@example.com",
    role: "Resilience keynote speaker",
    fee: "$10k – $15k",
    topics: "Resilience, Leadership",
  };

  it("accepts a complete listing", () => {
    expect(validateListing(listing)).toEqual(listing);
  });

  it("rejects a missing name or role", () => {
    expect(() => validateListing({ ...listing, full_name: "" })).toThrow();
    expect(() => validateListing({ ...listing, role: "" })).toThrow();
  });

  it("rejects a malformed email", () => {
    expect(() => validateListing({ ...listing, email: "sam@" })).toThrow();
  });
});
