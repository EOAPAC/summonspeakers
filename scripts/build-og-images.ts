/**
 * Open Graph card generator.
 *
 *   bun scripts/build-og-images.ts [--only=slug]
 *
 * Writes 1200x630 PNGs to public/og/. Cards are pre-rendered and committed
 * rather than generated per request: the deploy target is a Cloudflare Worker,
 * which has no headless browser, and a share card has to exist the moment a
 * crawler asks for it.
 *
 * Requires a Chromium binary. Set CHROMIUM_PATH, or the script tries the usual
 * locations. Headless Chromium reserves some window height for UI it never
 * draws, so the viewport comes out shorter than --window-size asks for; the
 * script measures that offset at startup instead of hardcoding it, then crops
 * the render back to exactly 1200x630.
 */

import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { deflateSync, inflateSync } from "node:zlib";

import { topics } from "../src/data/speakers";

const WIDTH = 1200;
const HEIGHT = 630;
const OUT_DIR = "public/og";
const TMP_DIR = ".og-tmp";

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
  if (!hit) {
    throw new Error(
      `No Chromium found. Set CHROMIUM_PATH. Tried:\n  ${CHROMIUM_CANDIDATES.join("\n  ")}`,
    );
  }
  return hit;
}

// ── PNG cropping (stdlib only) ───────────────────────────────────────────────

function readChunks(data: Buffer): Array<{ type: string; body: Buffer }> {
  const out: Array<{ type: string; body: Buffer }> = [];
  let pos = 8;
  while (pos < data.length) {
    const length = data.readUInt32BE(pos);
    out.push({
      type: data.subarray(pos + 4, pos + 8).toString("latin1"),
      body: data.subarray(pos + 8, pos + 8 + length),
    });
    pos += 12 + length;
  }
  return out;
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, body: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4, 8), body])), 0);
  return Buffer.concat([head, body, crc]);
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** Crop a non-interlaced 8-bit PNG to its first `keep` rows. */
function cropPng(data: Buffer, keep: number): Buffer {
  const chunks = readChunks(data);
  const ihdr = chunks.find((c) => c.type === "IHDR")!.body;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const depth = ihdr.readUInt8(8);
  const colour = ihdr.readUInt8(9);
  if (depth !== 8 || ihdr.readUInt8(12) !== 0) {
    throw new Error(`unsupported PNG: depth=${depth} interlace=${ihdr.readUInt8(12)}`);
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colour as 0 | 2 | 4 | 6]!;
  const stride = width * bpp;

  const raw = inflateSync(
    Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.body)),
  );
  const rows = Math.min(keep, height);
  const out = Buffer.alloc(rows * (stride + 1));
  let prev = Buffer.alloc(stride);
  let src = 0;

  for (let y = 0; y < rows; y++) {
    const filter = raw[src++]!;
    const line = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp]! : 0;
      const b = prev[i]!;
      const c = i >= bpp ? prev[i - bpp]! : 0;
      if (filter === 1) line[i] = (line[i]! + a) & 0xff;
      else if (filter === 2) line[i] = (line[i]! + b) & 0xff;
      else if (filter === 3) line[i] = (line[i]! + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) line[i] = (line[i]! + paeth(a, b, c)) & 0xff;
    }
    out[y * (stride + 1)] = 0;
    line.copy(out, y * (stride + 1) + 1);
    prev = line;
  }

  const newIhdr = Buffer.from(ihdr);
  newIhdr.writeUInt32BE(rows, 4);
  newIhdr.writeUInt8(0, 11);
  newIhdr.writeUInt8(0, 12);
  return Buffer.concat([
    data.subarray(0, 8),
    makeChunk("IHDR", newIhdr),
    makeChunk("IDAT", deflateSync(out, { level: 9 })),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Card template ────────────────────────────────────────────────────────────

const FONT_DIR = ".agents/skills/summonspeakers-design/fonts";

function card({ eyebrow, headline, footL, footR }: Card): string {
  const cwd = process.cwd();
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Long headlines need a smaller size or they overflow the card.
  const size = headline.length > 46 ? 68 : headline.length > 30 ? 84 : 104;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"HG";src:url("file://${cwd}/${FONT_DIR}/hanken-grotesk-latin-wght-normal.woff2") format("woff2");font-weight:100 900}
@font-face{font-family:"PM";src:url("file://${cwd}/${FONT_DIR}/ibm-plex-mono-latin-500-normal.woff2") format("woff2");font-weight:500}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden}
body{background:#fff;color:#000;font-family:"HG",system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px}
.mono{font-family:"PM",monospace;font-weight:500;letter-spacing:.1em;text-transform:uppercase}
.eyebrow{font-size:20px;color:#737373}
h1{text-transform:uppercase;font-weight:800;letter-spacing:-.05em;line-height:.9;font-size:${size}px;max-width:15ch}
.foot{display:flex;align-items:center;justify-content:space-between;gap:24px;border-top:2px solid #000;padding-top:26px}
.sub{font-size:26px;letter-spacing:-.02em;color:#525252}
.pill{font-family:"PM",monospace;font-weight:500;font-size:18px;letter-spacing:.1em;text-transform:uppercase;
  border:1.5px solid rgba(0,0,0,.18);border-radius:9999px;padding:14px 26px;white-space:nowrap}
</style></head><body>
<div class="mono eyebrow">${esc(eyebrow)}</div>
<h1>${esc(headline)}</h1>
<div class="foot"><div class="sub">${esc(footL)}</div><div class="pill">${esc(footR)}</div></div>
</body></html>`;
}

type Card = { slug: string; eyebrow: string; headline: string; footL: string; footR: string };

// ── Chromium driver ──────────────────────────────────────────────────────────

const chromium = findChromium();

async function shoot(html: string, out: string, windowHeight: number): Promise<Buffer> {
  const page = `${TMP_DIR}/${out.replace(/\W/g, "_")}.html`;
  await writeFile(page, html);
  const png = `${TMP_DIR}/${out.replace(/\W/g, "_")}.png`;
  const proc = Bun.spawn(
    [
      chromium,
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      `--window-size=${WIDTH},${windowHeight}`,
      `--screenshot=${png}`,
      `file://${process.cwd()}/${page}`,
    ],
    { stdout: "ignore", stderr: "ignore" },
  );
  await proc.exited;
  return Buffer.from(await Bun.file(png).arrayBuffer());
}

/** Measure how much window height Chromium withholds from the viewport. */
async function calibrate(): Promise<number> {
  const probe = `<!doctype html><html><head><style>html,body{margin:0}
  body{font:28px monospace}</style></head><body><span id="o"></span>
  <script>document.getElementById("o").textContent="H"+window.innerHeight;</script></body></html>`;
  const dom = Bun.spawn(
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
  const text = await new Response(dom.stdout).text();
  const m = /H(\d+)/.exec(text);
  const inner = m ? Number(m[1]) : HEIGHT;
  const offset = HEIGHT - inner;
  console.log(`  viewport offset: ${offset}px (asked ${HEIGHT}, got ${inner})`);
  return Math.max(0, offset);
}

// ── Cards ────────────────────────────────────────────────────────────────────

const FEES = "$3K – $120K · PUBLISHED";

const staticCards: Card[] = [
  {
    slug: "default",
    eyebrow: "SummonSpeakers",
    headline: "Book the keynote speaker your event deserves",
    footL: "With fees shown upfront.",
    footR: FEES,
  },
  {
    slug: "speakers",
    eyebrow: "SummonSpeakers · The roster",
    headline: "Every speaker, every fee band",
    footL: "Search by category, location and gender.",
    footR: FEES,
  },
  {
    slug: "speaker-fees",
    eyebrow: "SummonSpeakers · Fee guide",
    headline: "How much does a keynote speaker cost?",
    footL: "Published bands by tier and topic.",
    footR: FEES,
  },
  {
    slug: "get-matched",
    eyebrow: "SummonSpeakers · Get matched",
    headline: "A shortlist in one business day",
    footL: "Free to enquire, no account needed.",
    footR: "2 MINUTES",
  },
  {
    slug: "how-it-works",
    eyebrow: "SummonSpeakers · How it works",
    headline: "From brief to booking in four steps",
    footL: "Fees visible at every stage.",
    footR: "NO MARKUP",
  },
  {
    slug: "for-speakers",
    eyebrow: "SummonSpeakers · For speakers",
    headline: "Get booked for paid speaking",
    footL: "Set your own fee. Keep the relationship.",
    footR: "0% COMMISSION",
  },
  {
    slug: "about",
    eyebrow: "SummonSpeakers · About",
    headline: "Trust is the product",
    footL: "Why we publish every fee.",
    footR: "$0 ADDED",
  },
  {
    slug: "blog",
    eyebrow: "SummonSpeakers · Journal",
    headline: "Speaker fees, explained plainly",
    footL: "Cost guides and briefing notes.",
    footR: FEES,
  },
  {
    slug: "case-studies",
    eyebrow: "SummonSpeakers · Case studies",
    headline: "Rooms we helped fill",
    footL: "Real briefs, real speakers, real fees.",
    footR: FEES,
  },
];

const topicCards: Card[] = topics.map((t) => ({
  slug: `topic-${t.slug}`,
  eyebrow: "SummonSpeakers · Category",
  headline: t.heading,
  footL: "Fees published on every full profile.",
  footR: FEES,
}));

// ── Main ─────────────────────────────────────────────────────────────────────

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const all = [...staticCards, ...topicCards].filter((c) => !only || c.slug === only);

await rm(TMP_DIR, { recursive: true, force: true });
await mkdir(TMP_DIR, { recursive: true });
await mkdir(OUT_DIR, { recursive: true });

console.log(`Rendering ${all.length} Open Graph cards with ${chromium}`);
const offset = await calibrate();

let done = 0;
for (const c of all) {
  const raw = await shoot(card(c), c.slug, HEIGHT + offset);
  await writeFile(`${OUT_DIR}/${c.slug}.png`, cropPng(raw, HEIGHT));
  done++;
  if (done % 10 === 0 || done === all.length) console.log(`  ${done}/${all.length}`);
}

await rm(TMP_DIR, { recursive: true, force: true });
console.log(`Wrote ${done} cards to ${OUT_DIR}/`);
