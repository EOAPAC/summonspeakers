/**
 * Roster importer — turns the speaker-directory CSVs into src/data/roster.generated.ts.
 *
 *   bun scripts/import-roster.ts data/roster-sources/*.csv
 *
 * Re-run this whenever a source spreadsheet changes; never hand-edit the
 * generated files. Each CSV carries four columns:
 *
 *   Speaker name | Category/topic tags | State | Notes
 *
 * Tags are "; "-separated and may be hierarchical ("Business > Sales &
 * Marketing"); only the part before ">" is kept, then folded through
 * CATEGORY_PARENT below. Notes carries "Gender: Female" and, in the global
 * directory, "Speaking fee: $15,000".
 *
 * Locations come in two grammars, detected per value:
 *
 *   AU legacy    "NSW (Sydney)", "International; VIC"
 *   Hierarchical "Europe > UK > London", "Americas > US; Asia > Japan"
 *
 * Both normalise into one place tree (region → country → area) exported as
 * rosterPlaces. A speaker appearing in more than one source CSV under the same
 * name is one person: their categories, locations and gender merge, and the
 * fee comes from whichever file states one.
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
 * Sparse or duplicate tags folded into the category a planner would actually
 * browse. A value may be a list when the source tag genuinely spans two of our
 * categories ("Business & Leadership" is both). Anything absent stays
 * first-class.
 *
 * The AU directory breaks Sport down to the discipline (Taekwondo has one
 * speaker); the global directory has its own vocabulary of 65 tags with heavy
 * overlap ("Government & Politics" vs "Politics, Government & Global Affairs").
 * Every fold is listed here so the next import argues with a map, not a diff.
 */
const CATEGORY_PARENT: Record<string, string | string[]> = {
  // Sport, by discipline and role (AU)
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
  "Sports & Olympics": "Sport",

  // Expedition and endurance
  Antarctic: "Adventurers",
  Mountaineer: "Adventurers",
  "Mt Everest": "Adventurers",
  Adventure: "Adventurers",

  // Lived experience and representation
  Disability: "Diversity & Inclusion",
  "Gender Equality": "Diversity & Inclusion",
  Neurodiversity: "Diversity & Inclusion",
  "Diversity, Inclusion & Gender Equality": "Diversity & Inclusion",
  "International Women's Day": "Diversity & Inclusion",
  Pride: "Diversity & Inclusion",
  "Human Rights": "Diversity & Inclusion",

  // Business and leadership
  "Business & Leadership": ["Business", "Leadership"],
  Entrepreneurs: "Business",
  Negotiation: "Business",
  Luxury: "Business",
  "Echelon Front": "Leadership",
  "Workplace innovation": "People & Culture",

  // Politics and the world
  "Government & Politics": "Politics & Law",
  "Politics, Government & Global Affairs": "Politics & Law",
  "Fraud, Corruption and Corporate Crime": "Politics & Law",
  "International Affairs & Security": "World Affairs",
  Geopolitics: "World Affairs",
  Globalization: "World Affairs",
  "World Leaders": "World Affairs",
  "Iran & Global Impact": "World Affairs",
  "US–China Relations": "World Affairs",
  APAC: "World Affairs",
  "Global Trade & Tariffs": "Economy & Finance",

  // Money
  "Finance & Markets": "Economy & Finance",
  "Economic & Financial Affairs": "Economy & Finance",
  "Fintech & Cryptocurrency": "Economy & Finance",

  // Technology and science
  "Technology, Innovation & Science": "Technology, Future & Innovation",
  "Technology Ethics - Regulation": "Technology, Future & Innovation",
  "Cyber Security": "Technology, Future & Innovation",
  "AI - Emerging Tech": "AI",
  "Space Travel & Tourism": "Science",
  "Mathematics and Statistics": "Science",

  // Health and mind
  "Health & Wellbeing": "Health, Lifestyle & Wellbeing",
  "Global Health": "Health, Lifestyle & Wellbeing",
  Healthcare: "Health, Lifestyle & Wellbeing",
  "Longevity & Lifespan": "Health, Lifestyle & Wellbeing",
  "Resilience, Wellbeing & Happiness": "Resilience",
  Psychology: "Mental Health & Wellness",
  Neuroscience: "Mental Health & Wellness",

  // Environment
  "Environment & Sustainability": "Sustainability",
  "Sustainability - Environment": "Sustainability",
  ESG: "Sustainability",
  Energy: "Environment & Climate Change",
  "Energy Transition": "Environment & Climate Change",

  // Society and culture
  "Society, Culture & Education": "Social Trends & Current Affairs",
  "Demographics & Population": "Social Trends & Current Affairs",
  "Education - Policy & Practice": "Education",
  "Social Media": "Social Media & Networking",
  Influencer: "Social Media & Networking",
  "Influencer Speakers": "Social Media & Networking",
  "Marketing - Communications": "Advertising & Marketing",

  // Stage formats and honours
  "After Dinner": "After Dinner Speakers",
  "Moderators & Chairpersons": "Master of Ceremonies (MCs) & Hosts",
  "Inspirational & Motivational": ["Inspirational", "Motivational"],
  TED: "Inspirational",
  TEDx: "Inspirational",
  "Nobel Laureates": "Inspirational",
  Comedy: "Entertainment",

  // Everything else sparse
  Author: "Authors", // singular/plural duplicate in the source
  Photography: "Media",
};

/** Gender, not a topic — these tags are dropped from the category list. */
const GENDER_TAGS = new Set(["Female", "Male"]);

/**
 * "Keynote" appears on 2,162 of the global directory's rows: it describes the
 * booking format, not what the speaker talks about, so as a filter it would be
 * a near-synonym for "everyone". Dropped, same as the placeholder tags.
 */
const NON_CATEGORIES = new Set(["Not tagged", "Not stated", "Keynote", ""]);

/** Source values that carry no location information — treated as not stated. */
const STATE_DROP = new Set(["Various", "Not stated", "Unknown", "N/A", ""]);

// ── Places ───────────────────────────────────────────────────────────────────

const AU_STATES = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);

/**
 * Whole location tokens that need spelling out before the tree sees them.
 * These are the global directory's loose rows — bare "USA", a lowercase
 * "england", a city with no country — plus the AU directory's legacy labels.
 */
const PLACE_ALIAS: Record<string, string[]> = {
  Global: ["Global"],
  International: ["Global"],
  USA: ["Americas", "US"],
  "New York": ["Americas", "US", "New York"],
  "San Francisco": ["Americas", "US", "San Francisco"],
  Mexico: ["Americas", "Mexico"],
  "The Netherlands": ["Europe", "Netherlands"],
  netherlands: ["Europe", "Netherlands"],
  england: ["Europe", "UK"],
  "United Kingdom": ["Europe", "UK"],
  Dubai: ["Asia", "United Arab Emirates", "Dubai"],
  lithuania: ["Europe", "Lithuania"],
  Australia: ["Oceania", "Australia"],
  "Australia (nationwide)": ["Oceania", "Australia"],
  "New Zealand": ["Oceania", "New Zealand"],
};

const REGIONS = new Set(["Global", "Africa", "Americas", "Asia", "Europe", "Oceania"]);

/**
 * One location token → a path in the place tree, or null when it carries no
 * information. AU states become areas under Oceania > Australia so the whole
 * roster shares one hierarchy.
 */
function placePathFor(token: string): string[] | null {
  const trimmed = token.trim();
  if (!trimmed || STATE_DROP.has(trimmed)) return null;

  const upper = trimmed.toUpperCase();
  if (AU_STATES.has(upper)) return ["Oceania", "Australia", upper];

  const aliased = PLACE_ALIAS[trimmed];
  if (aliased) return [...aliased];

  let segs = trimmed
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segs.length) return null;

  // A bare "USA > Washington D.C." style first segment expands through the
  // alias table, then the rest of the path follows it.
  const headAlias = PLACE_ALIAS[segs[0]!];
  if (headAlias) segs = [...headAlias, ...segs.slice(1)];

  // "Oceania > Australia > Australia" repeats itself in a handful of rows.
  segs = segs.filter((s, i) => s !== segs[i - 1]);

  if (!REGIONS.has(segs[0]!)) {
    console.warn(`  unmapped location dropped: ${JSON.stringify(trimmed)}`);
    return null;
  }
  return segs;
}

// ── Normalisation ────────────────────────────────────────────────────────────

function categoriesFor(raw: string): string[] {
  const out = new Set<string>();
  for (const piece of raw.split(";")) {
    const top = piece.split(">")[0]!.trim();
    if (!top || GENDER_TAGS.has(top) || NON_CATEGORIES.has(top)) continue;
    const folded = CATEGORY_PARENT[top] ?? top;
    for (const c of Array.isArray(folded) ? folded : [folded]) out.add(c);
  }
  return [...out].sort();
}

/**
 * "NSW (Sydney)" -> { paths: [["Oceania","Australia","NSW"]], city: "Sydney" }
 * "Europe > UK > London; Americas > US" -> two paths, no city
 */
function locationFor(raw: string): { paths: string[][]; city: string } {
  const trimmed = raw.trim();
  const open = trimmed.indexOf("(");
  const head = (open === -1 ? trimmed : trimmed.slice(0, open)).trim();
  const city = open === -1 ? "" : trimmed.slice(open + 1, trimmed.lastIndexOf(")")).trim();

  const paths: string[][] = [];
  const seen = new Set<string>();
  for (const token of head.split(";")) {
    const path = placePathFor(token);
    if (!path) continue;
    const key = path.join("/");
    if (seen.has(key)) continue;
    seen.add(key);
    paths.push(path);
  }
  return { paths, city };
}

/**
 * Gender as a bitmask: 1 female, 2 male, 4 non-binary, 0 not recorded.
 * The global directory records duos ("Gender: Female/Male") and non-binary
 * speakers, so one speaker can carry more than one bit — a duo matches both
 * the Female and the Male filter, which is what someone using either filter
 * would want.
 */
function genderFor(notes: string): number {
  const m = /Gender:\s*([^|]+)/i.exec(notes);
  if (!m) return 0;
  let g = 0;
  for (const part of m[1]!.split("/")) {
    const p = part.trim().toLowerCase();
    if (p === "female") g |= 1;
    else if (p === "male") g |= 2;
    else if (p === "non binary" || p === "non-binary" || p === "nonbinary") g |= 4;
  }
  return g;
}

/** "Speaking fee: $15,000" -> 15000. Absent in the AU directory. */
function feeFor(notes: string): number | undefined {
  const m = /Speaking fee:\s*\$\s*([\d,]+)/i.exec(notes);
  if (!m) return undefined;
  const fee = Number(m[1]!.replace(/,/g, ""));
  return Number.isFinite(fee) && fee > 0 ? fee : undefined;
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

const csvPaths = process.argv.slice(2);
if (!csvPaths.length) {
  console.error("usage: bun scripts/import-roster.ts <path-to-csv> [more.csv ...]");
  process.exit(1);
}

/**
 * Two AU rows genuinely belong to two different people who share a name, so
 * they must not merge the way a cross-file duplicate does. Everyone else with
 * an identical name across (or within) the source files is treated as the
 * same person appearing twice.
 */
const KNOWN_DISTINCT = new Set(["Jessica Harmsen", "Richard Crawford"]);

type Entry = {
  name: string;
  slug: string;
  categories: Set<string>;
  /** Place paths, e.g. ["Europe","UK","London"], joined later against the tree. */
  paths: string[][];
  city: string;
  g: number;
  f?: number;
};

const bySlug = new Map<string, Entry>();
const seenSlugs = new Set<string>();
let skippedBlank = 0;
let mergedRows = 0;
let suffixed = 0;

for (const csvPath of csvPaths) {
  const text = (await Bun.file(csvPath).text()).replace(/^\uFEFF/, "");
  const [header, ...dataRows] = parseCsv(text);
  if (!header || header.length !== 4) {
    throw new Error(`${csvPath}: expected 4 columns, got ${header?.length}: ${header?.join(",")}`);
  }

  for (const row of dataRows) {
    const [name = "", tags = "", state = "", notes = ""] = row;
    const clean = name.trim();
    if (!clean) {
      skippedBlank++;
      continue;
    }

    const { paths, city } = locationFor(state);
    const categories = categoriesFor(tags);
    const g = genderFor(notes);
    const f = feeFor(notes);

    let slug = slugify(clean);
    const existing = bySlug.get(slug);

    if (existing && !KNOWN_DISTINCT.has(clean)) {
      // Same name in two files (or twice in one): one person, merged.
      mergedRows++;
      for (const c of categories) existing.categories.add(c);
      const known = new Set(existing.paths.map((p) => p.join("/")));
      for (const p of paths) if (!known.has(p.join("/"))) existing.paths.push(p);
      if (!existing.city && city) existing.city = city;
      existing.g |= g;
      if (existing.f === undefined && f !== undefined) existing.f = f;
      continue;
    }

    if (seenSlugs.has(slug)) {
      suffixed++;
      let n = 2;
      while (seenSlugs.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    seenSlugs.add(slug);
    bySlug.set(slug, {
      name: clean,
      slug,
      categories: new Set(categories),
      paths,
      city,
      g,
      ...(f !== undefined ? { f } : {}),
    });
  }
}

const entries = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "en"));

// ── Place tree ───────────────────────────────────────────────────────────────

/**
 * Nodes ordered parents-first: regions alphabetically, then each region's
 * children alphabetically, then areas. Stable across runs regardless of CSV
 * row order, so the generated indices only change when the data does.
 */
type PlaceNode = { name: string; parent: number };
const placeList: PlaceNode[] = [];
const placeIdByKey = new Map<string, number>();

{
  const keys = new Set<string>();
  for (const e of entries) {
    for (const path of e.paths) {
      for (let d = 1; d <= path.length; d++) keys.add(path.slice(0, d).join("/"));
    }
  }
  const sorted = [...keys].sort((a, b) => {
    const da = a.split("/").length;
    const db = b.split("/").length;
    // Parents before children; siblings and cousins alphabetically by path.
    return da - db || a.localeCompare(b, "en");
  });
  for (const key of sorted) {
    const segs = key.split("/");
    const parentKey = segs.slice(0, -1).join("/");
    const parent = parentKey ? placeIdByKey.get(parentKey)! : -1;
    placeIdByKey.set(key, placeList.length);
    placeList.push({ name: segs[segs.length - 1]!, parent });
  }
}

// ── Categories ───────────────────────────────────────────────────────────────

const categories = [...new Set(entries.flatMap((e) => [...e.categories]))].sort((a, b) =>
  a.localeCompare(b, "en"),
);
const catId = new Map(categories.map((c, i) => [c, i]));

// ── Output ───────────────────────────────────────────────────────────────────

const body = entries
  .map((e) => {
    const c = [...e.categories].map((x) => catId.get(x)!).sort((a, b) => a - b);
    const l = e.paths.map((p) => placeIdByKey.get(p.join("/"))!).sort((a, b) => a - b);
    const city = e.city ? `,city:${JSON.stringify(e.city)}` : "";
    const fee = e.f !== undefined ? `,f:${e.f}` : "";
    return `  {name:${JSON.stringify(e.name)},slug:${JSON.stringify(e.slug)},c:[${c}],l:[${l}]${city},g:${e.g}${fee}},`;
  })
  .join("\n");

const placesOut = placeList.map((p) => `{n:${JSON.stringify(p.name)},p:${p.parent}}`).join(",");

// Facets live in their own module so the filter UI can import the label lists
// without pulling all ${entries.length} rows into the client bundle.
const facetsOut = `// GENERATED by scripts/import-roster.ts — do not edit by hand.
// Small on purpose: safe to import from client components.

// Annotated as readonly rather than \`as const\`: filter values arrive from URL
// search params as plain strings, so a literal union buys nothing and makes
// every lookup need a cast.

/** Category labels. \`RosterEntry.c\` holds indices into this array. */
export const rosterCategories: readonly string[] = ${JSON.stringify(categories, null, 0)};

/**
 * The location tree, parents before children. \`p\` is the index of the parent
 * node, or -1 for a region. \`RosterEntry.l\` holds indices of the most specific
 * node each source row stated — filtering on a node matches it and everything
 * beneath it.
 */
export type RosterPlace = { n: string; p: number };
export const rosterPlaces: readonly RosterPlace[] = [${placesOut}];

/**
 * Roster size, so pages can quote a real figure without importing the rows.
 * Excludes the hand-written full profiles in ./speakers.
 */
export const ROSTER_COUNT = ${entries.length};
`;

const out = `// GENERATED by scripts/import-roster.ts — do not edit by hand.
// Source rows: ${entries.length}. Re-run the script to regenerate.
//
// Import this ONLY from server code. It is large; the filter UI reads labels
// from ./roster-facets instead.

export type RosterEntry = {
  name: string;
  slug: string;
  /** Indices into rosterCategories. */
  c: number[];
  /** Indices into rosterPlaces — most specific node per listed location. */
  l: number[];
  /** City or region free text from the source, omitted when not stated. */
  city?: string;
  /** Bitmask: 1 female, 2 male, 4 non-binary. 0 = not recorded. */
  g: number;
  /** Speaking fee in USD, omitted when the source does not state one. */
  f?: number;
};

export const roster: RosterEntry[] = [
${body}
];
`;

await Bun.write("src/data/roster-facets.ts", facetsOut);
await Bun.write("src/data/roster.generated.ts", out);

const counts = { female: 0, male: 0, nonbinary: 0, unknown: 0 };
for (const e of entries) {
  if (e.g === 0) counts.unknown++;
  if (e.g & 1) counts.female++;
  if (e.g & 2) counts.male++;
  if (e.g & 4) counts.nonbinary++;
}
const noCategory = entries.filter((e) => e.categories.size === 0).length;
const noPlace = entries.filter((e) => e.paths.length === 0).length;
const withFee = entries.filter((e) => e.f !== undefined).length;

console.log(`wrote src/data/roster.generated.ts`);
console.log(`  speakers:   ${entries.length}`);
console.log(`  categories: ${categories.length}`);
console.log(`  places:     ${placeList.length}`);
console.log(
  `  gender:     ${counts.female} female / ${counts.male} male / ${counts.nonbinary} non-binary / ${counts.unknown} not recorded`,
);
console.log(`  fee stated: ${withFee}`);
console.log(`  no category: ${noCategory} | no place: ${noPlace}`);
console.log(
  `  skipped blank rows: ${skippedBlank} | merged duplicate rows: ${mergedRows} | same-name kept distinct: ${suffixed}`,
);
