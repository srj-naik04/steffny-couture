#!/usr/bin/env node
/**
 * fetch-site-images.mjs
 * Pulls images from steffnycouture.co.uk into /scripts/fetched-images/
 * Run: node scripts/fetch-site-images.mjs
 * Requires Node 20+
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'fetched-images');

const PAGES = [
  'https://www.steffnycouture.co.uk/',
  'https://www.steffnycouture.co.uk/dresses',
  'https://www.steffnycouture.co.uk/about-steffny-couture',
];

const IMG_RE = /<img[^>]+src=["']([^"']+)["']/gi;
const OG_RE  = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;

function best(url) {
  return url.split('?')[0].replace(/-standard(\.[a-z]+)$/i, '-high$1');
}

function filename(url) {
  return url.split('/').pop().replace(/[?#].*$/, '');
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Saving to: ${OUT_DIR}\n`);

  const urls = new Set();

  for (const page of PAGES) {
    console.log(`Crawling ${page}...`);
    try {
      const html = await fetch(page, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
      for (const re of [IMG_RE, OG_RE]) {
        for (const m of html.matchAll(re)) {
          const raw = m[1];
          if (/\.(jpe?g|png|webp)/i.test(raw.split('?')[0])) urls.add(best(raw));
        }
      }
    } catch (e) { console.warn(`  Failed: ${e.message}`); }
  }

  console.log(`\nFound ${urls.size} images\n`);
  let saved = 0;

  for (const url of urls) {
    const out = join(OUT_DIR, filename(url));
    if (existsSync(out)) { console.log(`  skip: ${filename(url)}`); continue; }
    try {
      const buf = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
      writeFileSync(out, buf);
      console.log(`  ✓ ${filename(url)} (${(buf.length/1024).toFixed(0)}KB)`);
      saved++;
    } catch (e) { console.warn(`  ✗ ${filename(url)}: ${e.message}`); }
  }

  console.log(`\nDone. ${saved} files saved.`);
  console.log('Next: pick 5-10, optimise at squoosh.app, move to /assets/images/');
}

main().catch(e => { console.error(e); process.exit(1); });