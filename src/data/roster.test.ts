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
   * The defect this guards: 16 rows have no gender in the source CSV, so either
   * gender filter dropped them with no indication and the two counts did not add
   * up to the roster. Anyone comparing the numbers saw 16 speakers missing with
   * nothing on the page to explain it.
   */
  test("female + male + withheld accounts for every speaker", () => {
    const female = q({ gender: "female" });
    const male = q({ gender: "male" });
    expect(female.unrecordedGender).toBe(male.unrecordedGender);
    expect(female.total + male.total + female.unrecordedGender).toBe(rosterCount);
  });

  test("both gender filters report the withheld count", () => {
    expect(q({ gender: "female" }).unrecordedGender).toBeGreaterThan(0);
    expect(q({ gender: "male" }).unrecordedGender).toBeGreaterThan(0);
  });

  test("the count reflects the other active filters, not the whole roster", () => {
    const withheldOverall = q({ gender: "female" }).unrecordedGender;
    const inState = q({ gender: "female", state: "NSW" });
    expect(inState.unrecordedGender).toBeLessThanOrEqual(withheldOverall);
    // A filter that matches nobody has nobody to withhold either.
    expect(q({ gender: "female", q: "zzzznotaspeakername" }).unrecordedGender).toBe(0);
  });
});

describe("filters that cannot match", () => {
  test("an unknown category matches nothing rather than being ignored", () => {
    // Silently ignoring it would render a typo'd URL as an unfiltered roster.
    expect(q({ categories: ["Not A Real Category"] }).total).toBe(0);
  });

  test("an unknown state matches nothing", () => {
    expect(q({ state: "Atlantis" }).total).toBe(0);
  });
});

describe("paging", () => {
  test("a page beyond the end clamps rather than returning an empty list", () => {
    const page = q({ page: 9999 });
    expect(page.page).toBe(page.pageCount);
    expect(page.rows.length).toBeGreaterThan(0);
  });

  test("state counts are ordered biggest first", () => {
    const counts = q().states.map((s) => s.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });
});
