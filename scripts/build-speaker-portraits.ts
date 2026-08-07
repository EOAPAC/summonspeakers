/**
 * Generates the placeholder portraits for the 12 full-profile speakers via
 * Runware, writing WEBP files into public/speakers/ and a manifest the
 * components read.
 *
 * Run once, commit the output. Same reasoning as build-og-images.ts: this is
 * SSR, so calling an image API per request would be a per-visitor cost for an
 * asset that never changes.
 *
 *   RUNWARE_API_KEY=... bun run build:portraits
 *   bun run build:portraits --dry-run     # print prompts, call nothing
 *   bun run build:portraits --force       # regenerate files that already exist
 *   bun run build:portraits --only=daniel-hsu,priya-raman
 *
 * ── Why there are no reference images here ──────────────────────────────────
 * These twelve are invented personas, not real people, so every prompt is
 * text-only. Nothing conditions on a photograph of anyone, which means no real
 * person's likeness can come out the other end. Do not add referenceImages,
 * ipAdapters or photoMaker to this script: those exist to reproduce a specific
 * real face, and pointing them at a named individual is a different activity
 * with different consent requirements. If a real speaker joins the roster and
 * wants a portrait, take the photo they supply.
 *
 * ── Why nothing is inferred from a surname ──────────────────────────────────
 * The briefs below deliberately carry no ethnicity or appearance guesses read
 * off a name. Where a persona's presentation matters it is stated explicitly in
 * the brief by a human, and the only demographic signal taken from the repo is
 * the "Female speakers" topic tag, which is authored data. Everything else is
 * left to the model.
 */

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { roster } from "../src/data/roster.generated";

// The full profiles moved from a static array to Supabase in the migration,
// so the only slugs this script can know offline are the roster's and the
// twelve curated profiles', which it lists by hand.
const CURATED_SLUGS = [
  "andres-molina", "daniel-abbott", "daniel-hsu", "dr-maya-ellison", "grace-oyelaran",
  "helena-brandt", "james-okoro", "michael-toure", "nina-castellan",
  "omar-haddad", "priya-raman", "robert-ainsley", "sarah-lindqvist",
];
const KNOWN_SLUGS = new Set([...roster.map((s) => s.slug), ...CURATED_SLUGS]);

const API = "https://api.runware.ai/v1";
const MODEL = "runware:100@1";
const OUT_DIR = join(import.meta.dir, "..", "public", "speakers");
const MANIFEST = join(import.meta.dir, "..", "src", "data", "speaker-portraits.ts");

/** 4:5, and both multiples of 64 as the API requires. */
const WIDTH = 1024;
const HEIGHT = 1280;

const MAX_RETRIES = 3;

type Brief = {
  /** Wardrobe and setting, chosen to suit the speaking topic. */
  setting: string;
  /**
   * Optional explicit presentation notes. Left undefined for most personas so
   * the model decides; fill one in by hand if a specific persona is wanted.
   */
  presentation?: string;
};

/**
 * Per-persona direction. Keyed by slug so a missing entry is a loud failure
 * rather than a silently generic portrait.
 */
const BRIEFS: Record<string, Brief> = {
  "dr-maya-ellison": { setting: "charcoal blazer, plain mid-grey studio backdrop" },
  "james-okoro": { setting: "open-collar navy shirt, softly blurred arena interior" },
  "sarah-lindqvist": { setting: "minimal black roll-neck, cool pale-grey studio backdrop" },
  "priya-raman": { setting: "tailored deep-blue jacket, warm neutral studio backdrop" },
  "michael-toure": { setting: "soft grey suit without a tie, plain warm-grey backdrop" },
  "helena-brandt": { setting: "technical outdoor jacket, softly blurred cold daylight backdrop" },
  "daniel-hsu": { setting: "slate crew-neck under a light jacket, cool neutral backdrop" },
  "grace-oyelaran": { setting: "structured emerald jacket, plain warm-grey backdrop" },
  "andres-molina": { setting: "light wool jacket over an open shirt, soft cream backdrop" },
  "nina-castellan": { setting: "broadcast-ready dark jacket, softly blurred stage lighting" },
  "omar-haddad": { setting: "crisp white shirt and dark jacket, plain neutral backdrop" },
  "robert-ainsley": { setting: "formal dark suit and muted tie, deep grey studio backdrop" },
};

const NEGATIVE =
  "cartoon, illustration, painting, 3d render, cgi, deformed, disfigured, extra fingers, " +
  "extra limbs, blurry face, out of focus face, watermark, text, logo, signature, " +
  "oversaturated, plastic skin, waxy skin, airbrushed, uncanny, two heads, crowd, " +
  "multiple people, nsfw";

/** "a" or "an", so roles like "inclusive leadership speaker" read correctly. */
function article(phrase: string): string {
  return /^[aeiou]/i.test(phrase) ? "an" : "a";
}

function prompt(slug: string, name: string, role: string, isFemale: boolean): string {
  const brief = BRIEFS[slug];
  if (!brief) throw new Error(`No portrait brief for "${slug}". Add one to BRIEFS.`);
  const subject = brief.presentation ?? (isFemale ? "a woman" : "a man");
  const roleText = role.toLowerCase();
  return [
    `professional corporate headshot photograph of ${subject}`,
    `${article(roleText)} ${roleText}`,
    brief.setting,
    "head and shoulders, facing camera, calm confident expression, mouth closed",
    "soft key light with a gentle fill, shallow depth of field",
    "85mm portrait lens, natural skin texture with visible pores, photorealistic, editorial quality",
  ].join(", ");
}

/**
 * Deterministic per-slug seed, so a rerun reproduces the same faces and a
 * regenerated set does not silently reshuffle who looks like whom.
 */
function seedFor(slug: string): number {
  let h = 2166136261;
  for (const ch of slug) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 2_147_483_647;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Generated = { imageURL: string; cost: number };

async function generate(key: string, body: unknown, label: string): Promise<Generated> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res: Response;
    try {
      res = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      });
    } catch (cause) {
      // A network-level failure is worth one more try; a blocked host is not
      // going to unblock itself, so say which it looked like.
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `${label}: could not reach ${API} after ${MAX_RETRIES} attempts. ` +
            `If this is a 403 on CONNECT, the host is blocked by egress policy — ` +
            `run this where api.runware.ai is reachable.`,
          { cause },
        );
      }
      await sleep(2000 * 2 ** (attempt - 1));
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      if (attempt === MAX_RETRIES)
        throw new Error(`${label}: ${res.status} after ${MAX_RETRIES} attempts`);
      // Honour Retry-After when the API sends one rather than guessing.
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleep(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 2000 * 2 ** (attempt - 1),
      );
      continue;
    }

    const text = await res.text();
    if (!res.ok) throw new Error(`${label}: ${res.status} ${text.slice(0, 400)}`);

    const json = JSON.parse(text) as {
      data?: { imageURL?: string; cost?: number; NSFWContent?: boolean }[];
      errors?: { message?: string }[];
    };
    if (json.errors?.length) {
      throw new Error(`${label}: ${json.errors.map((e) => e.message ?? "unknown").join("; ")}`);
    }
    const first = json.data?.[0];
    if (!first?.imageURL) throw new Error(`${label}: response carried no imageURL`);
    if (first.NSFWContent) throw new Error(`${label}: flagged NSFW, not saved`);
    return { imageURL: first.imageURL, cost: first.cost ?? 0 };
  }
  throw new Error(`${label}: exhausted retries`);
}

async function download(url: string, dest: string, label: string): Promise<number> {
  // Re-hosted rather than hotlinked: the Runware URL is temporary, and the
  // site should not depend on a third party staying up to render a face.
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label}: download failed with ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  await writeFile(dest, bytes);
  return bytes.byteLength;
}

/** Extensions a portrait may have. WEBP is what this script writes; the others
 *  are here so a photo supplied by a real speaker can be dropped in as-is. */
const IMAGE_EXT = [".webp", ".png", ".jpg", ".jpeg", ".avif"];

/**
 * A `.plate.` in the filename marks a rendered monogram graphic rather than a
 * photograph. The two need different alt text — one is decorative and duplicates
 * the heading beside it, the other depicts a face — and the filename is the only
 * place that distinction survives a directory listing.
 */
const PLATE_MARKER = ".plate";

function parseName(file: string): { slug: string; kind: "plate" | "photo" } | null {
  const ext = IMAGE_EXT.find((e) => file.toLowerCase().endsWith(e));
  if (!ext) return null;
  const stem = file.slice(0, -ext.length);
  return stem.endsWith(PLATE_MARKER)
    ? { slug: stem.slice(0, -PLATE_MARKER.length), kind: "plate" }
    : { slug: stem, kind: "photo" };
}

async function writeManifest(): Promise<number> {
  const files = existsSync(OUT_DIR) ? await readdir(OUT_DIR) : [];
  const entries: [string, { src: string; kind: "plate" | "photo" }][] = [];
  for (const f of files.sort()) {
    const parsed = parseName(f);
    if (!parsed) continue;
    // A real photograph wins over a plate for the same speaker.
    const existing = entries.find(([slug]) => slug === parsed.slug);
    const value = { src: `/speakers/${f}`, kind: parsed.kind };
    if (!existing) entries.push([parsed.slug, value]);
    else if (existing[1].kind === "plate" && parsed.kind === "photo") existing[1] = value;
  }

  for (const [slug] of entries) {
    if (!KNOWN_SLUGS.has(slug))
      console.warn(`warn   ${slug} is not a speaker slug — no profile will use it`);
  }

  await writeFile(
    MANIFEST,
    `// GENERATED by scripts/build-speaker-portraits.ts — do not edit by hand.
// Regenerate with: bun run build:portraits --manifest-only
//
// Small on purpose: safe to import from client components. Maps the speakers that
// have an image in public/speakers/ to its path and kind, so a profile without
// one renders the hatch placeholder during SSR rather than a broken image.
//
// "plate" is a rendered monogram graphic from build-speaker-plates.ts. "photo"
// is a portrait — generated or supplied. They get different alt text.
//
// Roster portraits (public/speakers/roster/<slug>.webp, scanned into
// roster-images.generated.ts) resolve through the same functions as a
// fallback, so the full-profile page, the index gate and the cards all agree
// on what "has a portrait" means.

import { rosterImageSlugs } from "./roster-images.generated";

export type PortraitKind = "plate" | "photo";

const PORTRAITS: Readonly<Record<string, { src: string; kind: PortraitKind }>> = {
${entries.map(([slug, v]) => `  "${slug}": { src: "${v.src}", kind: "${v.kind}" },`).join("\n")}
};

const ROSTER_PORTRAITS: ReadonlySet<string> = new Set(rosterImageSlugs);

// Curated portraits of real, named speakers (modelled on their own photos)
// rather than fictional placeholders — they get the roster-style alt text.
const REAL_PORTRAITS: ReadonlySet<string> = new Set(["daniel-abbott"]);

/** Public path to a speaker's image, or null when there is not one yet. */
export function portraitFor(slug: string): string | null {
  return PORTRAITS[slug]?.src ?? (ROSTER_PORTRAITS.has(slug) ? \`/speakers/roster/\${slug}.webp\` : null);
}

export function portraitKind(slug: string): PortraitKind | null {
  return PORTRAITS[slug]?.kind ?? (ROSTER_PORTRAITS.has(slug) ? "photo" : null);
}

/**
 * Alt text for a speaker's image.
 *
 * A plate carries the name and role as artwork and always sits beside a heading
 * with the same name, so it is decorative and takes an empty alt rather than
 * making a screen reader announce the name twice. A photo is described, and says
 * it is generated: the curated profiles are placeholders whose faces belong to
 * nobody, and roster portraits are AI-generated headshots published under the
 * site's disclosure convention.
 */
export function portraitAlt(slug: string, name: string): string {
  const kind = portraitKind(slug);
  if (kind === "plate") return "";
  if (PORTRAITS[slug] && !REAL_PORTRAITS.has(slug))
    return \`Portrait of \${name}, keynote speaker (AI-generated placeholder image)\`;
  return \`AI-generated portrait of \${name}, keynote speaker\`;
}

export const PORTRAIT_COUNT = ${entries.length};

/**
 * The slugs with a portrait, in one place: the portrait is the editorial
 * quality bar — it decides which profiles are indexed, listed in the sitemap
 * and offered in the enquiry dropdown.
 */
export const portraitSlugs: readonly string[] = ${JSON.stringify(entries.map(([slug]) => slug), null, 2)};
`,
  );
  return entries.length;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

  // Rebuilds the manifest from whatever is already in public/speakers/ without
  // generating anything. Needed because the portraits may not come from this
  // script at all — a real speaker's own photo, or another image API.
  if (args.includes("--manifest-only")) {
    const n = await writeManifest();
    console.log(`${n} portrait(s) in the manifest`);
    return;
  }

  const key = process.env["RUNWARE_API_KEY"];
  if (!key && !dryRun) {
    console.error(
      "RUNWARE_API_KEY is not set.\n\n" +
        "This script only needs the key where it runs — the generated files are\n" +
        "committed, so the deployed site never calls Runware. Export it for one run:\n\n" +
        "  RUNWARE_API_KEY=... bun run build:portraits\n\n" +
        "Use --dry-run to check the prompts without a key.",
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const targets = speakers.filter((s) => !only || only.has(s.slug));
  if (only) {
    const unknown = [...only].filter((s) => !speakers.some((sp) => sp.slug === s));
    if (unknown.length) throw new Error(`--only named unknown slugs: ${unknown.join(", ")}`);
  }

  let made = 0;
  let skipped = 0;
  let totalCost = 0;
  const failures: string[] = [];

  for (const s of targets) {
    const dest = join(OUT_DIR, `${s.slug}.webp`);
    if (existsSync(dest) && !force) {
      skipped++;
      console.log(`skip   ${s.slug} (exists — pass --force to redo)`);
      continue;
    }

    const isFemale = s.topics.includes("Female speakers");
    const positivePrompt = prompt(s.slug, s.name, s.role, isFemale);
    const seed = seedFor(s.slug);

    if (dryRun) {
      console.log(`\n── ${s.slug}  (seed ${seed})\n${positivePrompt}`);
      made++;
      continue;
    }

    const body = [
      {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        model: MODEL,
        positivePrompt,
        negativePrompt: NEGATIVE,
        width: WIDTH,
        height: HEIGHT,
        numberResults: 1,
        outputType: "URL",
        outputFormat: "WEBP",
        includeCost: true,
        checkNSFW: true,
        seed,
      },
    ];

    try {
      const { imageURL, cost } = await generate(key as string, body, s.slug);
      const bytes = await download(imageURL, dest, s.slug);
      totalCost += cost;
      made++;
      console.log(`ok     ${s.slug}  ${(bytes / 1024).toFixed(0)}KB  $${cost.toFixed(4)}`);
    } catch (err) {
      failures.push(`${s.slug}: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`FAIL   ${s.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const inManifest = dryRun ? -1 : await writeManifest();

  console.log(
    `\n${dryRun ? "[dry run] " : ""}${made} generated, ${skipped} skipped, ${failures.length} failed` +
      (dryRun ? "" : `\n${inManifest} portrait(s) in the manifest, $${totalCost.toFixed(4)} spent`),
  );

  // A partial run should not look like a clean one to CI or to a human skimming.
  if (failures.length) process.exit(1);
}

await main();
