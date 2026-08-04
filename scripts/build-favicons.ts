/**
 * Favicon generator.
 *
 *   bun scripts/build-favicons.ts
 *
 * Rasterises public/favicon.svg into the PNG sizes browsers ask for, plus a
 * multi-size favicon.ico for older clients. Edit the SVG and re-run; never edit
 * the generated PNGs.
 *
 * Needs Chromium (set CHROMIUM_PATH, or the usual locations are tried). The ICO
 * wraps PNGs rather than BMPs, which every browser since IE11 reads.
 */

import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";

const SVG = "public/favicon.svg";
const TMP = ".favicon-tmp";

/** PNG outputs: size -> path. 180 is Apple's touch icon, 192/512 are for the manifest. */
const PNGS: Array<{ size: number; out: string }> = [
  { size: 32, out: "public/favicon-32.png" },
  { size: 180, out: "public/apple-touch-icon.png" },
  { size: 192, out: "public/icon-192.png" },
  { size: 512, out: "public/icon-512.png" },
];

/** Sizes embedded in favicon.ico. 48 is what Windows uses for shortcuts. */
const ICO_SIZES = [16, 32, 48];

const CHROMIUM_CANDIDATES = [
  process.env["CHROMIUM_PATH"],
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((p): p is string => Boolean(p));

const chromium = CHROMIUM_CANDIDATES.find((p) => existsSync(p));
if (!chromium) {
  throw new Error(
    `No Chromium found. Set CHROMIUM_PATH. Tried:\n  ${CHROMIUM_CANDIDATES.join("\n  ")}`,
  );
}

/**
 * Render the SVG at an exact pixel size.
 *
 * Headless Chromium withholds part of the window height from the viewport, so a
 * square --window-size would crop the image. Asking for a tall window and
 * letting the <img> sit at the top-left avoids needing to know the offset.
 */
async function render(size: number): Promise<Buffer> {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#fff}
img{position:absolute;top:0;left:0;width:${size}px;height:${size}px}
</style></head><body><img src="file://${process.cwd()}/${SVG}"></body></html>`;
  const page = `${TMP}/${size}.html`;
  const png = `${TMP}/${size}.png`;
  await writeFile(page, html);
  const proc = Bun.spawn(
    [
      chromium!,
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--default-background-color=ffffffff",
      "--virtual-time-budget=4000",
      `--window-size=${size},${size + 200}`,
      `--screenshot=${png}`,
      `file://${process.cwd()}/${page}`,
    ],
    { stdout: "ignore", stderr: "ignore" },
  );
  await proc.exited;
  return cropSquare(Buffer.from(await Bun.file(png).arrayBuffer()), size);
}

// ── Minimal PNG read/write, so the script needs no image library ─────────────

import { deflateSync, inflateSync } from "node:zlib";

function chunks(data: Buffer) {
  const out: Array<{ type: string; body: Buffer }> = [];
  let pos = 8;
  while (pos < data.length) {
    const len = data.readUInt32BE(pos);
    out.push({
      type: data.subarray(pos + 4, pos + 8).toString("latin1"),
      body: data.subarray(pos + 8, pos + 8 + len),
    });
    pos += 12 + len;
  }
  return out;
}

const CRC = (() => {
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
  for (const b of buf) c = CRC[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, body: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4, 8), body])), 0);
  return Buffer.concat([head, body, crc]);
}

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Keep the top-left size x size square of a PNG. */
function cropSquare(data: Buffer, size: number): Buffer {
  const cs = chunks(data);
  const ihdr = cs.find((c) => c.type === "IHDR")!.body;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.readUInt8(9) as 0 | 2 | 4 | 6]!;
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(cs.filter((c) => c.type === "IDAT").map((c) => c.body)));

  const rows: Buffer[] = [];
  let prev = Buffer.alloc(stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[src++]!;
    const line = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp]! : 0;
      const b = prev[i]!;
      const c = i >= bpp ? prev[i - bpp]! : 0;
      if (f === 1) line[i] = (line[i]! + a) & 0xff;
      else if (f === 2) line[i] = (line[i]! + b) & 0xff;
      else if (f === 3) line[i] = (line[i]! + ((a + b) >> 1)) & 0xff;
      else if (f === 4) line[i] = (line[i]! + paeth(a, b, c)) & 0xff;
    }
    rows.push(line);
    prev = line;
  }

  const keep = Math.min(size, height);
  const cols = Math.min(size, width);
  const out = Buffer.alloc(keep * (cols * bpp + 1));
  for (let y = 0; y < keep; y++) {
    out[y * (cols * bpp + 1)] = 0;
    rows[y]!.subarray(0, cols * bpp).copy(out, y * (cols * bpp + 1) + 1);
  }
  const newIhdr = Buffer.from(ihdr);
  newIhdr.writeUInt32BE(cols, 0);
  newIhdr.writeUInt32BE(keep, 4);
  newIhdr.writeUInt8(0, 11);
  newIhdr.writeUInt8(0, 12);
  return Buffer.concat([
    data.subarray(0, 8),
    chunk("IHDR", newIhdr),
    chunk("IDAT", deflateSync(out, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** ICO container wrapping one PNG per size. */
function buildIco(images: Array<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries: Buffer[] = [];
  for (const { size, png } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32BE(0, 8);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

// ── Main ─────────────────────────────────────────────────────────────────────

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });

console.log(`Rasterising ${SVG} with ${chromium}`);

for (const { size, out } of PNGS) {
  await writeFile(out, await render(size));
  console.log(`  ${out} (${size}x${size})`);
}

const icoImages = [];
for (const size of ICO_SIZES) icoImages.push({ size, png: await render(size) });
await writeFile("public/favicon.ico", buildIco(icoImages));
console.log(`  public/favicon.ico (${ICO_SIZES.join(", ")})`);

await rm(TMP, { recursive: true, force: true });
