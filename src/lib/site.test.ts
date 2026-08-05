import { describe, expect, test } from "bun:test";

import { jsonLd } from "./site";

describe("jsonLd", () => {
  /**
   * The defect this guards: JSON.stringify alone in an inline <script> lets a
   * "</script>" inside any string — bios come from a database other tools
   * write to — close the tag and turn the rest of the payload into markup.
   */
  test("a </script> in the data cannot close the script tag", () => {
    const hostile = { bio: 'nice talk</script><script>alert("x")</script>' };
    const out = jsonLd(hostile);
    expect(out.includes("</script>")).toBe(false);
    expect(out.includes("<")).toBe(false);
  });

  test("escaping is invisible to a JSON parser", () => {
    const value = { a: "</script>", b: "1 < 2", c: ["<", "plain"] };
    expect(JSON.parse(jsonLd(value))).toEqual(value);
  });
});
