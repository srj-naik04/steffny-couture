/**
 * Rasterises the brand SVG artwork in `assets/branding/` into the PNG files
 * `app.json` ships (CLAUDE.md §8). Re-run whenever the SVG source changes.
 *
 * Run:  node scripts/generate-assets.mjs
 */
import sharp from 'sharp';

const JOBS = [
  { src: 'assets/branding/icon.svg', out: 'assets/icon.png', size: 1024 },
  {
    src: 'assets/branding/monogram.svg',
    out: 'assets/android-icon-foreground.png',
    size: 1024,
  },
  { src: 'assets/branding/icon.svg', out: 'assets/favicon.png', size: 64 },
];

for (const job of JOBS) {
  await sharp(job.src, { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(job.out);
  console.log(`${job.out}  (${job.size}×${job.size})`);
}

// Splash logotype — wide, transparent, shown "contain" on the ivory splash.
await sharp('assets/branding/splash.svg', { density: 384 })
  .resize(1280, 640, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile('assets/splash-icon.png');
console.log('assets/splash-icon.png  (1280×640)');

console.log('Brand assets generated.');
