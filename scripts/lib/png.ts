/**
 * Minimal PNG surgery, stdlib only.
 *
 * Extracted from build-og-images.ts so build-speaker-plates.ts can share it.
 * Both need the same thing: headless Chromium withholds ~87px of --window-size
 * from the layout viewport, so a card has to be rendered taller than it should
 * be and then cropped back.
 *
 * Cropping here rather than via a canvas round-trip matters for file size. A
 * canvas re-encode of a 1024x1280 plate took it from 71KB to 266KB, because
 * Chromium's canvas PNG encoder is far less efficient than its screenshot
 * encoder. This keeps the original pixels and re-deflates them.
 */

import { deflateSync, inflateSync } from "node:zlib";

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
export function cropPng(data: Buffer, keep: number): Buffer {
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

/** Width and height from a PNG's IHDR. */
export function pngSize(data: Buffer): { width: number; height: number } {
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}
