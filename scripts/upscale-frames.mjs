// Upscale + sharpen the 300 hero frames from the pristine originals in /images.
// Output: high-quality WebP into public/frames (clarity-per-byte beats JPEG).
//
// Honest note: Lanczos upscaling + unsharp mask improves PERCEIVED clarity and
// removes the browser's own upscaling blur on large screens. It cannot recover
// detail the original JPEG compression already discarded.

import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "images";
const OUT = "apps/web/public/frames";
const TARGET_W = 2560; // cap at source width; never enlarge
const CONCURRENCY = 8;

sharp.cache(false);
sharp.concurrency(1);

const files = (await readdir(SRC)).filter((f) => /ezgif-frame-\d+\.jpg$/i.test(f)).sort();
await mkdir(OUT, { recursive: true });

let done = 0;
let totalBytes = 0;

async function processFrame(file) {
  const inPath = path.join(SRC, file);
  const outName = file.replace(/\.jpg$/i, ".webp");
  const outPath = path.join(OUT, outName);

  await sharp(inPath)
    // source is already 2560px QHD — fit to width, never enlarge
    .resize({ width: TARGET_W, kernel: "lanczos3", withoutEnlargement: true })
    // light edge definition only (source is high-res, so no denoise/heavy sharpen)
    .sharpen({ sigma: 0.6 })
    // subtle warmth/punch to match the site's duotone treatment
    .modulate({ saturation: 1.05 })
    .webp({ quality: 82, effort: 5, smartSubsample: true })
    .toFile(outPath);

  const s = await stat(outPath);
  totalBytes += s.size;
  done++;
  if (done % 50 === 0 || done === files.length) {
    console.log(`  ${done}/${files.length} frames`);
  }
}

// simple concurrency pool
const queue = [...files];
async function worker() {
  while (queue.length) {
    const f = queue.shift();
    await processFrame(f);
  }
}

console.log(`Upscaling ${files.length} frames → ${TARGET_W}px WebP …`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const mb = (totalBytes / 1024 / 1024).toFixed(1);
const avgKb = Math.round(totalBytes / files.length / 1024);
console.log(`\nDone. ${files.length} frames, total ${mb} MB (avg ${avgKb} KB/frame).`);
