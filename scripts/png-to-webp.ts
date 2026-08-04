/**
 * Converts PNG/JPEG images to WEBP, optionally resizing, using the Chromium
 * that is already part of this repo's toolchain.
 *
 *   bun run to:webp public/speakers                    # whole directory
 *   bun run to:webp a.png b.png                        # specific files
 *   bun run to:webp public/speakers --width=1024       # resize long edge down
 *   bun run to:webp public/speakers --quality=90
 *   bun run to:webp public/speakers --keep             # keep the originals
 *
 * Why Chromium rather than cwebp or sharp: cwebp and ImageMagick are not
 * installed on every machine that clones this repo, and a build that silently
 * skips compression because a binary is missing is worse than one that fails.
 * sharp would mean a native dependency for a job done a handful of times.
 * Chromium is already required by build-og-images.ts and build-favicons.ts, and
 * its canvas encoder produces WEBP everywhere the other two do not.
 *
 * The image is embedded as a data URL rather than loaded over file://, because a
 * file:// image taints the canvas and toDataURL then throws.
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, rm, stat, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const TMP_DIR = ".webp-tmp";
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);

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

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * Renders the conversion in a page and reads the result back out of the DOM.
 * `--dump-dom` is the only channel headless Chromium offers without a full CDP
 * client, so the encoded bytes come back as base64 text in an element.
 */
function page(dataUrl: string, maxWidth: number, quality: number): string {
  return `<!doctype html><html><body><output id="r"></output><script>
const img = new Image();
img.onload = () => {
  const scale = ${maxWidth} > 0 && img.naturalWidth > ${maxWidth} ? ${maxWidth} / img.naturalWidth : 1;
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  let url;
  try { url = c.toDataURL("image/webp", ${quality} / 100); } catch (e) {
    document.getElementById("r").textContent = "ERR:" + e.message; return;
  }
  // A browser without a WEBP encoder silently hands back a PNG, which would
  // ship a mislabelled file. Catch it here rather than on someone's device.
  if (!url.startsWith("data:image/webp")) {
    document.getElementById("r").textContent = "ERR:encoder returned " + url.slice(5, 20);
    return;
  }
  document.getElementById("r").textContent =
    "OK:" + c.width + "x" + c.height + ":" + url.slice(url.indexOf(",") + 1);
};
img.onerror = () => { document.getElementById("r").textContent = "ERR:image failed to decode"; };
img.src = ${JSON.stringify(dataUrl)};
</script></body></html>`;
}

const chromium = findChromium();

async function convert(
  src: string,
  maxWidth: number,
  quality: number,
): Promise<{ out: string; width: number; height: number; before: number; after: number }> {
  const ext = extname(src).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`${src}: not a PNG or JPEG`);

  const bytes = new Uint8Array(await Bun.file(src).arrayBuffer());
  const dataUrl = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;

  const html = join(TMP_DIR, `${basename(src).replace(/\W/g, "_")}.html`);
  await writeFile(html, page(dataUrl, maxWidth, quality));

  const proc = Bun.spawn(
    [
      chromium,
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--virtual-time-budget=10000",
      "--dump-dom",
      `file://${process.cwd()}/${html}`,
    ],
    { stdout: "pipe", stderr: "ignore" },
  );
  const dom = await new Response(proc.stdout).text();
  await proc.exited;

  const m = /<output id="r">([\s\S]*?)<\/output>/.exec(dom);
  const payload = m?.[1]?.trim() ?? "";
  if (!payload) throw new Error(`${src}: Chromium returned no result`);
  if (payload.startsWith("ERR:")) throw new Error(`${src}: ${payload.slice(4)}`);
  if (!payload.startsWith("OK:")) throw new Error(`${src}: unexpected result`);

  const [, dims, b64] = payload.split(":", 3);
  if (!dims || !b64) throw new Error(`${src}: malformed result`);
  const [w, h] = dims.split("x").map(Number);

  const outBytes = Buffer.from(b64, "base64");
  // RIFF....WEBP — refuse to write a file that is not actually WEBP.
  if (
    outBytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    outBytes.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    throw new Error(`${src}: output is not a WEBP container`);
  }

  const out = src.slice(0, -ext.length) + ".webp";
  await writeFile(out, outBytes);

  return {
    out,
    width: w ?? 0,
    height: h ?? 0,
    before: bytes.byteLength,
    after: outBytes.byteLength,
  };
}

async function targets(args: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const arg of args) {
    if (!existsSync(arg)) throw new Error(`No such path: ${arg}`);
    if ((await stat(arg)).isDirectory()) {
      for (const f of (await readdir(arg)).sort()) {
        if (SOURCE_EXT.has(extname(f).toLowerCase())) files.push(join(arg, f));
      }
    } else {
      files.push(arg);
    }
  }
  return files;
}

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith("--"));
  const paths = args.filter((a) => !a.startsWith("--"));

  const num = (name: string, fallback: number) => {
    const f = flags.find((x) => x.startsWith(`--${name}=`));
    if (!f) return fallback;
    const v = Number(f.split("=")[1]);
    if (!Number.isFinite(v) || v < 0) throw new Error(`--${name} needs a non-negative number`);
    return v;
  };

  const maxWidth = num("width", 0);
  const quality = num("quality", 82);
  const keep = flags.includes("--keep");

  if (!paths.length) {
    console.error("Usage: bun run to:webp <file-or-dir>... [--width=1024] [--quality=82] [--keep]");
    process.exit(1);
  }

  const files = await targets(paths);
  if (!files.length) {
    console.log("Nothing to convert — no .png, .jpg or .jpeg found.");
    return;
  }

  await mkdir(TMP_DIR, { recursive: true });
  let before = 0;
  let after = 0;
  const failures: string[] = [];

  try {
    for (const src of files) {
      try {
        const r = await convert(src, maxWidth, quality);
        before += r.before;
        after += r.after;
        if (!keep) await unlink(src);
        const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
        console.log(
          `ok     ${basename(r.out)}  ${r.width}x${r.height}  ${kb(r.before)} → ${kb(r.after)}  (−${pct}%)`,
        );
      } catch (err) {
        failures.push(src);
        console.error(
          `FAIL   ${basename(src)}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } finally {
    await rm(TMP_DIR, { recursive: true, force: true });
  }

  const done = files.length - failures.length;
  console.log(
    `\n${done}/${files.length} converted` +
      (done ? `, ${kb(before)} → ${kb(after)} (−${Math.round((1 - after / before) * 100)}%)` : ""),
  );
  if (failures.length) process.exit(1);
}

await main();
