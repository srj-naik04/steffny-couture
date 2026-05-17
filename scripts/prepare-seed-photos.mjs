/**
 * Optimises a curated set of garment photos (scraped from steffnycouture.co.uk
 * by fetch-site-images.mjs) into scripts/seed-photos/, which the demo seed
 * (seed.mjs) uploads as booking photos.
 *
 * Run:  node scripts/prepare-seed-photos.mjs
 */
import { mkdirSync } from 'node:fs';

import sharp from 'sharp';

const SOURCES = [
  ['img_1289-high.jpg', 'g1.jpg'],
  ['img_0678-high.jpg', 'g2.jpg'],
  ['6f7c7dd9-7706-4423-a6e6-5a65371e2795-high.jpg', 'g3.jpg'],
  ['e8f35e67-d0d7-474d-aa00-d346add6db55-high.jpg', 'g4.jpg'],
  ['img_0281-standard-fu02nr.jpg', 'g5.jpg'],
];

mkdirSync('scripts/seed-photos', { recursive: true });

for (const [src, out] of SOURCES) {
  const info = await sharp(`scripts/fetched-images/${src}`)
    .rotate()
    .resize({ width: 1000 })
    .jpeg({ quality: 70, mozjpeg: true })
    .toFile(`scripts/seed-photos/${out}`);
  console.log(
    `${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`,
  );
}

console.log('Seed photos prepared.');
