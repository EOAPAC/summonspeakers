/**
 * Renders a designed portrait plate for each full-profile speaker into
 * public/speakers/, so the cards read as intentional rather than unfinished
 * while no photograph exists.
 *
 *   bun run build:plates
 *   bun run build:plates --only=daniel-hsu
 *   bun run build:plates --force        # overwrite existing files
 *
 * These are not photographs and are not pretending to be. A plate is the
 * speaker's monogram over the same hatch texture the placeholder already used,
 * set in the site's own type and ink tokens.
 *
 * By design it writes the same public/speakers/<slug>.webp path a real portrait
 * would occupy, so dropping in a photograph later overwrites the plate with no
 * code change. It skips any slug that already has a file unless --force, so it
 * will never clobber a real portrait.
 *
 * Chromium does the rendering, as in build-og-images.ts and build-favicons.ts.
 * The PNG it produces is converted by scripts/png-to-webp.ts.
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { speakers } from "../src/data/speakers";
import { cropPng, pngSize } from "./lib/png";

const WIDTH = 1024;
const HEIGHT = 1280; // 4:5, matching the profile page's aspect
const OUT_DIR = join("public", "speakers");
const TMP_DIR = ".plates-tmp";

/** Design tokens, copied from src/styles.css rather than parsed out of it. */
const INK = "#000000";
const INK_2 = "#525252";
const INK_3 = "#737373";
const SURFACE_ALT = "#ededed";
const LINE_2 = "rgba(0, 0, 0, 0.18)";

const CHROMIUM_CANDIDATES = [
  process.env["CHROMIUM_PATH"],
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((p): p is string => Boolean(p));

function findChromium(): string {
  const hit = CHROMIUM_CANDIDATES.find((p) => existsSync(p));
  if (!hit) throw new Error(`No Chromium found. Set CHROMIUM_PATH.`);
  return hit;
}

/**
 * The design skill's font copies if present, else the packages. Both are checked
 * because build-og-images.ts reads from the former and it is not in every clone.
 */
function fontPath(skillFile: string, pkgFile: string): string {
  const skill = join(".agents/skills/summonspeakers-design/fonts", skillFile);
  if (existsSync(skill)) return skill;
  if (existsSync(pkgFile)) return pkgFile;
  throw new Error(`Font not found: ${skillFile}`);
}

const FONT_SANS = fontPath(
  "hanken-grotesk-latin-wght-normal.woff2",
  "node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2",
);
const FONT_MONO = fontPath(
  "ibm-plex-mono-latin-500-normal.woff2",
  "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
);

/** Honorifics are not initials — "Dr Maya Ellison" is ME, not DM. */
const HONORIFICS = new Set(["dr", "dr.", "prof", "prof.", "mr", "mrs", "ms", "sir", "dame", "the"]);

export function monogram(name: string): string {
  const words = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .filter((w) => !HONORIFICS.has(w.toLowerCase()));
  const letters = words.map((w) => [...w][0] ?? "").filter(Boolean);
  // First and last, so a middle name does not push out the surname initial.
  const picked = letters.length > 2 ? [letters[0], letters[letters.length - 1]] : letters;
  return picked.join("").toUpperCase();
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function plate(name: string, role: string, initials: string): string {
  const cwd = process.cwd();
  // Two letters sit comfortably at 340px; a single letter can go larger.
  const monoSize = initials.length > 2 ? 240 : initials.length === 2 ? 340 : 420;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"HG";src:url("file://${cwd}/${FONT_SANS}") format("woff2");font-weight:100 900}
@font-face{font-family:"PM";src:url("file://${cwd}/${FONT_MONO}") format("woff2");font-weight:500}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden}
body{
  background-color:${SURFACE_ALT};
  background-image:repeating-linear-gradient(45deg,rgba(0,0,0,.12) 0 1px,transparent 1px 9px);
  font-family:"HG",system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;justify-content:space-between;padding:72px 64px;
}
.mark{
  flex:1;display:flex;align-items:center;justify-content:center;
  font-size:${monoSize}px;font-weight:300;letter-spacing:-0.04em;line-height:1;
  color:${INK};opacity:.19;
}
.foot{border-top:1.5px solid ${LINE_2};padding-top:28px}
.name{font-family:"PM",monospace;font-weight:500;font-size:26px;letter-spacing:.1em;
  text-transform:uppercase;color:${INK_2}}
.role{font-family:"PM",monospace;font-weight:500;font-size:19px;letter-spacing:.08em;
  text-transform:uppercase;color:${INK_3};margin-top:12px}
</style></head><body>
<div class="mark">${esc(initials)}</div>
<div class="foot"><div class="name">${esc(name)}</div><div class="role">${esc(role)}</div></div>
</body></html>`;
}

const chromium = findChromium();

/**
 * Chromium withholds ~87px of --window-size from the layout viewport, so the
 * window has to be that much taller for 1280px of content to lay out, and the
 * screenshot — which captures the full window height, not the viewport — then
 * gets cropped back down. build-og-images.ts does the same thing for the same
 * reason.
 *
 * Skipping this is not cosmetic. With a 1280px window the viewport is 1193px, the
 * footer lands below it, and the role line renders sliced in half. The output was
 * still exactly 1024x1280, so the dimension check passed and only looking at the
 * image caught it.
 */
async function viewportOffset(): Promise<number> {
  const probe = `<!doctype html><html><body style="margin:0"><span id="o"></span>
<script>document.getElementById("o").textContent="H"+window.innerHeight;</script></body></html>`;
  const proc = Bun.spawn(
    [
      chromium,
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      `--window-size=${WIDTH},${HEIGHT}`,
      "--dump-dom",
      `data:text/html,${encodeURIComponent(probe)}`,
    ],
    { stdout: "pipe", stderr: "ignore" },
  );
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  const inner = Number(/H(\d+)/.exec(text)?.[1] ?? HEIGHT);
  const offset = Math.max(0, HEIGHT - inner);
  console.log(`viewport offset: ${offset}px (window ${HEIGHT} gives viewport ${inner})`);
  return offset;
}

/**
 * Crops the oversized screenshot back to WIDTH x HEIGHT, keeping the top rows.
 *
 * Uses the stdlib crop shared with build-og-images.ts rather than a canvas
 * round-trip. The canvas route works but re-encodes: it took a plate from 71KB to
 * 266KB, because Chromium's canvas PNG encoder is much weaker than its screenshot
 * encoder. This keeps the original pixels.
 */
async function cropToSize(file: string): Promise<void> {
  const raw = Buffer.from(await Bun.file(file).arrayBuffer());
  await writeFile(file, cropPng(raw, HEIGHT));
}

async function shoot(html: string, out: string, offset: number): Promise<void> {
  const page = join(TMP_DIR, `${out}.html`);
  await writeFile(page, html);
  const proc = Bun.spawn(
    [
      chromium,
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=8000",
      `--window-size=${WIDTH},${HEIGHT + offset}`,
      `--screenshot=${join(OUT_DIR, `${out}.plate.png`)}`,
      `file://${process.cwd()}/${page}`,
    ],
    { stdout: "ignore", stderr: "ignore" },
  );
  await proc.exited;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  // Only a real photograph blocks a plate; an existing plate is refreshed.
  const existing = new Set(
    (await readdir(OUT_DIR))
      .filter((f) => !f.includes(".plate."))
      .map((f) => f.slice(0, f.lastIndexOf(".")))
      .filter(Boolean),
  );

  const targets = speakers.filter((s) => !only || only.has(s.slug));
  const offset = await viewportOffset();

  let made = 0;
  let skipped = 0;
  const failures: string[] = [];

  try {
    for (const s of targets) {
      // Never overwrite a real portrait that has already landed here.
      if (existing.has(s.slug) && !force) {
        skipped++;
        console.log(`skip   ${s.slug} (has a real photo — --force to replace)`);
        continue;
      }

      const initials = monogram(s.name);
      await shoot(plate(s.name, s.role, initials), s.slug, offset);

      const file = join(OUT_DIR, `${s.slug}.plate.png`);
      if (existsSync(file) && offset > 0) await cropToSize(file);
      if (!existsSync(file)) {
        failures.push(`${s.slug}: Chromium wrote no file`);
        console.error(`FAIL   ${s.slug}: no output`);
        continue;
      }
      const bytes = new Uint8Array(await Bun.file(file).arrayBuffer());
      const { width: w, height: h } = pngSize(Buffer.from(bytes));
      if (w !== WIDTH || h !== HEIGHT) {
        failures.push(`${s.slug}: got ${w}x${h}, wanted ${WIDTH}x${HEIGHT}`);
        console.error(`FAIL   ${s.slug}: ${w}x${h} (wanted ${WIDTH}x${HEIGHT})`);
        continue;
      }
      made++;
      console.log(
        `ok     ${s.slug}  ${initials}  ${w}x${h}  ${(bytes.byteLength / 1024).toFixed(0)}KB`,
      );
    }
  } finally {
    await rm(TMP_DIR, { recursive: true, force: true });
  }

  console.log(`\n${made} rendered, ${skipped} skipped, ${failures.length} failed`);
  if (made)
    console.log(`Next: bun run to:webp ${OUT_DIR} && bun run build:portraits --manifest-only`);
  if (failures.length) process.exit(1);
}

await main();
