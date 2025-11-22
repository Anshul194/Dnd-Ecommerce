/*
 Image optimization script using sharp
 - Scans the public image folders listed below
 - Generates responsive variants and AVIF/WebP outputs under `public/optimized/...`
 - Strips metadata and sets moderate quality

 Usage: node ./scripts/optimize-images.js
 Note: requires `sharp` installed. Run `npm install --save-dev sharp` before use.
*/

const fs = require("fs").promises;
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (err) {
  console.error(
    "Missing dependency: 'sharp' is required for image optimization."
  );
  console.error("Install it with: npm install --save-dev sharp");
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const TARGET_DIR = path.join(PUBLIC_DIR, "optimized");

const FOLDERS = [
  "category-images",
  "category-thumbnails",
  "subcategory-images",
  "subcategory-thumbnails",
  "uploads",
  "images",
];

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".jfif", ".webp", ".avif"];
const SIZES = [320, 640, 1024, 1600];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function walkDir(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walkDir(full, cb);
    } else if (ent.isFile()) {
      await cb(full);
    }
  }
}

function isImage(file) {
  const ext = path.extname(file).toLowerCase();
  return EXTENSIONS.includes(ext);
}

function relativeUnderPublic(file) {
  return path.relative(PUBLIC_DIR, file).replace(/\\/g, "/");
}

async function processFile(file) {
  if (!isImage(file)) return;
  const rel = relativeUnderPublic(file);
  if (rel.startsWith("optimized/")) return; // skip outputs

  // limit processing of extremely small files
  try {
    const stats = await fs.stat(file);
    if (stats.size < 1024) return; // skip tiny images
  } catch (e) {
    console.error("stat failed", file, e.message);
    return;
  }

  const parsed = path.parse(rel);
  const outDir = path.join(TARGET_DIR, parsed.dir);
  await ensureDir(outDir);

  for (const w of SIZES) {
    const outBase = path.join(outDir, `${parsed.name}-${w}`);
    try {
      // resize and write webp
      const input = path.join(PUBLIC_DIR, rel);
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .withMetadata({})
        .webp({ quality: 75 })
        .toFile(`${outBase}.webp`);

      // resize and write avif
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .withMetadata({})
        .avif({ quality: 50 })
        .toFile(`${outBase}.avif`);
    } catch (err) {
      console.error("Failed processing", input, "->", outBase, err.message);
    }
  }
}

(async function main() {
  console.log("Starting image optimization...");
  console.log(
    "Note: outputs are written to public/optimized/ (originals not modified)"
  );
  for (const folder of FOLDERS) {
    const dir = path.join(PUBLIC_DIR, folder);
    try {
      const stat = await fs.stat(dir);
      if (!stat.isDirectory()) continue;
    } catch (e) {
      continue; // skip missing
    }

    await walkDir(dir, processFile);
  }

  console.log("Done. Optimized images written to public/optimized/");
  console.log(
    "Tip: Serve optimized files from CDN or update markup to reference optimized variants."
  );
})();
