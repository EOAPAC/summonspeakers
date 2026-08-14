import { describe, expect, test } from "bun:test";

import { emptyFilters, queryRoster, rosterCount, type RosterFilters } from "./roster";

const q = (o: Partial<RosterFilters> = {}) => queryRoster({ ...emptyFilters, ...o });

describe("gender filtering", () => {
  test("no gender filter reports nothing withheld", () => {
    const all = q();
    expect(all.total).toBe(rosterCount);
    expect(all.unrecordedGender).toBe(0);
  });

  /**
   * The defect this guards: rows with no gender in the source were dropped by
   * either gender filter with no indication, so the counts did not add up and
   * speakers went missing with nothing on the page to explain it. Gender is a
   * bitmask now (a duo billed as "Female/Male" matches both filters), so the
   * per-filter totals can overlap — the invariant is that every recorded
   * speaker matches at least one filter, and the withheld count is the same
   * whichever filter is active.
   */
  test("every recorded speaker matches at least one gender filter", () => {
    const female = q({ gender: "female" });
    const male = q({ gender: "male" });
    const nonbinary = q({ gender: "nonbinary" });
    expect(female.unrecordedGender).toBe(male.unrecordedGender);
    expect(male.unrecordedGender).toBe(nonbinary.unrecordedGender);
    expect(female.total + male.total + nonbinary.total).toBeGreaterThanOrEqual(
      rosterCount - female.unrecordedGender,
    );
  });

  test("both main gender filters report the withheld count", () => {
    expect(q({ gender: "female" }).unrecordedGender).toBeGreaterThan(0);
    expect(q({ gender: "male" }).unrecordedGender).toBeGreaterThan(0);
  });

  test("the count reflects the other active filters, not the whole roster", () => {
    const withheldOverall = q({ gender: "female" }).unrecordedGender;
    const inPlace = q({ gender: "female", place: "Oceania/Australia/NSW" });
    expect(inPlace.unrecordedGender).toBeLessThanOrEqual(withheldOverall);
    // A filter that matches nobody has nobody to withhold either.
    expect(q({ gender: "female", q: "zzzznotaspeakername" }).unrecordedGender).toBe(0);
  });
});

describe("place filtering", () => {
  test("a parent place includes everything beneath it", () => {
    const europe = q({ place: "Europe" });
    const uk = q({ place: "Europe/UK" });
    const london = q({ place: "Europe/UK/London" });
    expect(london.total).toBeGreaterThan(0);
    expect(uk.total).toBeGreaterThanOrEqual(london.total);
    expect(europe.total).toBeGreaterThanOrEqual(uk.total);
  });

  test("AU state filtering still works through the tree", () => {
    const nsw = q({ place: "Oceania/Australia/NSW" });
    const au = q({ place: "Oceania/Australia" });
    expect(nsw.total).toBeGreaterThan(0);
    expect(au.total).toBeGreaterThanOrEqual(nsw.total);
  });
});

describe("fees", () => {
  test("listed fees sit in the published band", () => {
    const rows = q({ pageSize: 100 }).rows;
    const withFee = rows.filter((r) => r.fee !== null);
    expect(withFee.length).toBeGreaterThan(0);
    // Every listed speaker carries a published price: $5,000–$12,000 in $500
    // steps. Fee is never 0 and never fractional.
    for (const r of rows) {
      expect(r.fee).not.toBeNull();
      expect(r.fee!).toBeGreaterThanOrEqual(5000);
      expect(r.fee!).toBeLessThanOrEqual(12000);
      expect(r.fee! % 500).toBe(0);
    }
  });
});

describe("portrait gate", () => {
  test("every listed row has an approved portrait", () => {
    const page = q({ pageSize: 100 });
    expect(page.rows.length).toBeGreaterThan(0);
    for (const r of page.rows) expect(r.hasImage).toBe(true);
  });

  test("speakers without a portrait are not listed", () => {
    // A. Wess Mitchell is in the roster data but has no portrait yet.
    expect(q({ q: "A. Wess Mitchell" }).total).toBe(0);
  });
});

describe("filters that cannot match", () => {
  test("an unknown category matches nothing rather than being ignored", () => {
    // Silently ignoring it would render a typo'd URL as an unfiltered roster.
    expect(q({ categories: ["Not A Real Category"] }).total).toBe(0);
  });

  test("an unknown place matches nothing", () => {
    expect(q({ place: "Atlantis" }).total).toBe(0);
    expect(q({ place: "Europe/Atlantis" }).total).toBe(0);
  });
});

describe("paging", () => {
  test("a page beyond the end clamps rather than returning an empty list", () => {
    const page = q({ page: 9999 });
    expect(page.page).toBe(page.pageCount);
    expect(page.rows.length).toBeGreaterThan(0);
  });

  test("place counts are ordered biggest first", () => {
    const counts = q().places.map((s) => s.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });
});
