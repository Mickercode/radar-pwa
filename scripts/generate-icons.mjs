/**
 * Generate PWA icons from the Radar logo.
 * Run: node scripts/generate-icons.mjs
 *
 * Produces:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-512-maskable.png
 *   public/apple-touch-icon.png
 *   public/favicon.png (replaces the existing one with a proper 48px version)
 */

import { mkdirSync, existsSync } from 'fs';
import sharp from 'sharp';

const LOGO = 'public/assets/logo-icon.jpeg';
const OUT = 'public/icons';

// Ensure output directory exists
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

async function resize(size, dest) {
  await sharp(LOGO)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(dest);
  console.log(`  ✓ ${dest}  (${size}×${size})`);
}

async function maskable(size, dest) {
  // Maskable: logo centered on a solid background with padding so it doesn't
  // get clipped by the OS mask. The asset is expected to be cropped (safe zone
  // is ~80% of the icon). We resize to ~70% of canvas and center it.
  const padding = Math.round(size * 0.15);
  const innerSize = size - padding * 2;
  await sharp(LOGO)
    .resize(innerSize, innerSize, { fit: 'cover', position: 'center' })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 26, g: 26, b: 46, alpha: 1 }, // --bg: #1a1a2e
    })
    .png()
    .toFile(dest);
  console.log(`  ✓ ${dest}  (${size}×${size}, maskable)`);
}

async function main() {
  console.log('Generating PWA icons from', LOGO, '\n');

  await resize(192, `${OUT}/icon-192.png`);
  await resize(512, `${OUT}/icon-512.png`);
  await maskable(512, `${OUT}/icon-512-maskable.png`);
  await resize(180, 'public/apple-touch-icon.png');
  await resize(48, 'public/favicon.png');

  console.log('\nDone — all icons generated.');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
