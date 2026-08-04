/**
 * Roster importer — turns the speaker-directory CSV into src/data/roster.generated.ts.
 *
 *   bun scripts/import-roster.ts <path-to-csv>
 *
 * Re-run this whenever the source spreadsheet changes; never hand-edit the
 * generated file. The CSV carries four columns:
 *
 *   Speaker name | Category/topic tags | State | Notes
 *
 * Tags are "; "-separated and may be hierarchical ("Business > Sales &
 * Marketing"); only the part before ">" is kept, then folded through
 * CATEGORY_PARENT below. Gender lives in Notes as "Gender: Female".
 */

// ── CSV ──────────────────────────────────────────────────────────────────────

/** Minimal RFC 4180 reader. Fields may be quoted; "" is an escaped quote. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ── Taxonomy ─────────────────────────────────────────────────────────────────

/**
 * Sparse tags folded into the category a planner would actually browse.
 *
 * The source data breaks Sport down to the discipline (Taekwondo has one
 * speaker, Beach Volleyball one), which makes a filter dropdown useless. Each
 * key here becomes its parent; anything absent stays first-class.
 */
const CATEGORY_PARENT: Record<string, string> = {
  // Sport, by discipline and role
  AFL: "Sport",
  "AFL Coach": "Sport",
  "AFL Premiership Winner": "Sport",
  AFLW: "Sport",
  "Aerial Skiing": "Sport",
  Athletics: "Sport",
  Basketball: "Sport",
  "Beach Volleyball": "Sport",
  Boxing: "Sport",
  "Car Racing": "Sport",
  Coach: "Sport",
  Cricket: "Sport",
  Cycling: "Sport",
  Diving: "Sport",
  "Formula One": "Sport",
  "Grand Prix": "Sport",
  Gymnastics: "Sport",
  Hockey: "Sport",
  "Horse Racing": "Sport",
  Marathon: "Sport",
  MotoGP: "Sport",
  Netball: "Sport",
  Rowing: "Sport",
  "Rugby League": "Sport",
  "Rugby Union": "Sport",
  Sailing: "Sport",
  Skating: "Sport",
  Skiing: "Sport",
  Snowboarding: "Sport",
  Soccer: "Sport",
  "Sports Commentator": "Sport",
  "Sports Journalist": "Sport",
  Surfing: "Sport",
  Swimming: "Sport",
  Taekwondo: "Sport",
  Tennis: "Sport",
  Triathlon: "Sport",
  Volleyball: "Sport",
  "Wheelchair Rugby": "Sport",
  "Winter Olympics": "Sport",

  // Expedition and endurance
  Antarctic: "Adventurers",
  Mountaineer: "Adventurers",
  "Mt Everest": "Adventurers",

  // Lived experience and representation
  Disability: "Diversity & Inclusion",
  "Gender Equality": "Diversity & Inclusion",
  Neurodiversity: "Diversity & Inclusion",

  // Everything else sparse
  Author: "Authors", // singular/plural duplicate in the source
  Influencer: "Social Media & Networking",
  "Influencer Speakers": "Social Media & Networking",
  Neuroscience: "Mental Health & Wellness",
  Photography: "Media",
  TEDx: "Inspirational",
};

/** Gender, not a topic — these tags are dropped from the category list. */
const GENDER_TAGS = new Set(["Female", "Male"]);

/** Placeholder in the source for "we have not categorised this speaker yet". */
const NON_CATEGORIES = new Set(["Not tagged", "Not stated", ""]);

const AU_STATES = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);

/** Source values that carry no location information — treated as not stated. */
const STATE_DROP = new Set(["Various", "Not stated", "Unknown", "N/A"]);

/**
 * One speaker is listed as "Australia; New Zealand", meaning they cover the
 * whole country rather than a state. Spelling that out beats a bare "Australia"
 * sitting between ACT and International in the dropdown.
 */
const STATE_RELABEL: Record<string, string> = { Australia: "Australia (nationwide)" };

// ── Normalisation ────────────────────────────────────────────────────────────

function categoriesFor(raw: string): string[] {
  const out = new Set<string>();
  for (const piece of raw.split(";")) {
    const top = piece.split(">")[0]!.trim();
    if (!top || GENDER_TAGS.has(top) || NON_CATEGORIES.has(top)) continue;
    out.add(CATEGORY_PARENT[top] ?? top);
  }
  return [...out].sort();
}

/**
 * "NSW (Sydney)" -> { states: ["NSW"], city: "Sydney" }
 * "International (Asia; Singapore)" -> { states: ["International"], city: "Asia; Singapore" }
 * "International; VIC" -> { states: ["International", "VIC"], city: "" }
 */
function locationFor(raw: string): { states: string[]; city: string } {
  const trimmed = raw.trim();
  const open = trimmed.indexOf("(");
  const head = (open === -1 ? trimmed : trimmed.slice(0, open)).trim();
  const city = open === -1 ? "" : trimmed.slice(open + 1, trimmed.lastIndexOf(")")).trim();

  const states = head
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !NON_CATEGORIES.has(s) && !STATE_DROP.has(s))
    .map((s) => (AU_STATES.has(s.toUpperCase()) ? s.toUpperCase() : s))
    .map((s) => STATE_RELABEL[s] ?? s);

  return { states: [...new Set(states)].sort(), city };
}

function genderFor(notes: string): 0 | 1 | 2 {
  const m = /Gender:\s*(Female|Male)/i.exec(notes);
  if (!m) return 0;
  return m[1]!.toLowerCase() === "female" ? 1 : 2;
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Main ─────────────────────────────────────────────────────────────────────

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("usage: bun scripts/import-roster.ts <path-to-csv>");
  process.exit(1);
}

const text = (await Bun.file(csvPath).text()).replace(/^\uFEFF/, "");
const [header, ...dataRows] = parseCsv(text);
if (!header || header.length !== 4) {
  throw new Error(`expected 4 columns, got ${header?.length}: ${header?.join(",")}`);
}

type Entry = { name: string; slug: string; c: number[]; s: number[]; city: string; g: 0 | 1 | 2 };

const categoryIndex = new Map<string, number>();
const stateIndex = new Map<string, number>();
const intern = (map: Map<string, number>, key: string) => {
  const hit = map.get(key);
  if (hit !== undefined) return hit;
  const id = map.size;
  map.set(key, id);
  return id;
};

const seen = new Set<string>();
const entries: Entry[] = [];
let skippedBlank = 0;
let duplicates = 0;

for (const row of dataRows) {
  const [name = "", tags = "", state = "", notes = ""] = row;
  const clean = name.trim();
  if (!clean) {
    skippedBlank++;
    continue;
  }
  let slug = slugify(clean);
  if (seen.has(slug)) {
    duplicates++;
    // Two people genuinely share a name in the source; keep both, distinct slugs.
    let n = 2;
    while (seen.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  seen.add(slug);

  const { states, city } = locationFor(state);
  entries.push({
    name: clean,
    slug,
    c: categoriesFor(tags).map((c) => intern(categoryIndex, c)),
    s: states.map((s) => intern(stateIndex, s)),
    city,
    g: genderFor(notes),
  });
}

// Stable, human-readable order in the generated file.
entries.sort((a, b) => a.name.localeCompare(b.name, "en"));

// Re-intern against sorted label lists so the generated indices are stable
// across runs even if the CSV row order changes.
const categories = [...categoryIndex.keys()].sort((a, b) => a.localeCompare(b, "en"));
const states = [...stateIndex.keys()].sort((a, b) => a.localeCompare(b, "en"));
const catId = new Map(categories.map((c, i) => [c, i]));
const stateId = new Map(states.map((s, i) => [s, i]));
const oldCat = [...categoryIndex.entries()].reduce<Record<number, string>>((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});
const oldState = [...stateIndex.entries()].reduce<Record<number, string>>((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

const body = entries
  .map((e) => {
    const c = e.c.map((i) => catId.get(oldCat[i]!)!).sort((a, b) => a - b);
    const s = e.s.map((i) => stateId.get(oldState[i]!)!).sort((a, b) => a - b);
    const city = e.city ? `,city:${JSON.stringify(e.city)}` : "";
    return `  {name:${JSON.stringify(e.name)},slug:${JSON.stringify(e.slug)},c:[${c}],s:[${s}]${city},g:${e.g}},`;
  })
  .join("\n");

// Facets live in their own module so the filter UI can import the label lists
// without pulling all ${entries.length} rows into the client bundle.
const facetsOut = `// GENERATED by scripts/import-roster.ts — do not edit by hand.
// Small on purpose: safe to import from client components.

// Annotated as readonly string[] rather than \`as const\`: filter values arrive
// from URL search params as plain strings, so a literal union buys nothing and
// makes every lookup need a cast.

/** Category labels. \`RosterEntry.c\` holds indices into this array. */
export const rosterCategories: readonly string[] = ${JSON.stringify(categories, null, 0)};

/** State / region labels. \`RosterEntry.s\` holds indices into this array. */
export const rosterStates: readonly string[] = ${JSON.stringify(states, null, 0)};

/**
 * Roster size, so pages can quote a real figure without importing the rows.
 * Excludes the hand-written full profiles in ./speakers.
 */
export const ROSTER_COUNT = ${entries.length};
`;

const out = `// GENERATED by scripts/import-roster.ts — do not edit by hand.
// Source rows: ${entries.length}. Re-run the script to regenerate.
//
// Import this ONLY from server code. It is ~180KB; the filter UI reads labels
// from ./roster-facets instead.

export type RosterEntry = {
  name: string;
  slug: string;
  /** Indices into rosterCategories. */
  c: number[];
  /** Indices into rosterStates. A speaker may list more than one. */
  s: number[];
  /** City or region in the source, omitted when not stated. */
  city?: string;
  /** 0 = not recorded, 1 = female, 2 = male. */
  g: 0 | 1 | 2;
};

export const roster: RosterEntry[] = [
${body}
];
`;

await Bun.write("src/data/roster-facets.ts", facetsOut);
await Bun.write("src/data/roster.generated.ts", out);

const counts = { female: 0, male: 0, unknown: 0 };
for (const e of entries) counts[e.g === 1 ? "female" : e.g === 2 ? "male" : "unknown"]++;
const noCategory = entries.filter((e) => e.c.length === 0).length;
const noState = entries.filter((e) => e.s.length === 0).length;

console.log(`wrote src/data/roster.generated.ts`);
console.log(`  speakers:   ${entries.length}`);
console.log(`  categories: ${categories.length}`);
console.log(`  states:     ${states.length}  (${states.join(", ")})`);
console.log(
  `  gender:     ${counts.female} female / ${counts.male} male / ${counts.unknown} not recorded`,
);
console.log(`  no category: ${noCategory} | no state: ${noState}`);
console.log(`  skipped blank rows: ${skippedBlank} | duplicate names kept: ${duplicates}`);
