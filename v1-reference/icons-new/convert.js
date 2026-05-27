#!/usr/bin/env node
// Converts 1-bit Pixel Icons PNG pack to BUILTIN_ICONS JS entries.
// Usage: node convert.js
// Output: icons_new.js (array of {id, label, cat, d, v} objects)

const {execSync} = require('child_process');
const fs   = require('fs');
const path = require('path');

const SPRITES = path.join(__dirname, '1-bit_Pixel_Icons/Sprites');
const OUT     = path.join(__dirname, 'icons_new.js');
const W = 16, H = 16;

// Map PNG filename prefix → UI category
const CAT_MAP = {
  Alchemy:    'Alchemy',
  Arrows:     'Navigation',
  Boardgames: 'Gaming',
  Controller: 'Gaming',
  Cosmetics:  'Objects',
  Emoji:      'Symbols',
  Food:       'Food',
  Hats:       'Objects',
  Map:        'Navigation',
  Media:      'Media',
  Misc:       'Misc',
  Platforms:  'Interface',
  RPG:        'RPG',
  Software:   'Interface',
  Sports:     'Sports',
  Tools:      'Tools',
  Travel:     'Travel',
  Warfare:    'Warfare',
  Weather:    'Nature',
};

// These two-word prefixes are both category, not label content
const COMPOUND = new Set(['Map_Markers', 'Tools_Crafting']);

// Last-word suffixes that indicate variants worth keeping in the label
const VARIANTS = new Set([
  'Empty','Full','Open','Closed','On','Off','Active','Inactive',
  'Dead','Alive','Up','Down','Lit','Unlit','Filled','Outline',
]);

function parseFile(fname) {
  const base  = fname.replace('.png', '');
  const parts = base.split('_');

  // Determine how many leading segments are "category"
  let skip = 1;
  if (parts.length >= 2 && COMPOUND.has(parts[0] + '_' + parts[1])) skip = 2;

  const catKey = parts[0];
  const cat    = CAT_MAP[catKey] || 'Misc';
  const id     = 'px-' + base.toLowerCase().replace(/_/g, '-');
  const name   = parts.slice(skip); // meaningful words

  // Label: first 2 words, + last word if it's a variant
  let labelParts;
  if (name.length <= 2) {
    labelParts = name;
  } else {
    const last   = name[name.length - 1];
    const isVar  = /^\d+$/.test(last) || VARIANTS.has(last);
    labelParts   = name.slice(0, 2);
    if (isVar && name.length > 2) labelParts.push(last);
  }

  return { id, label: labelParts.join(' '), cat };
}

function getGrid(pngPath) {
  // Normalise to 16x16, flatten alpha, threshold → raw 8-bit gray bytes
  const raw = execSync(
    `magick "${pngPath}" -background white -alpha remove -alpha off` +
    ` -gravity NorthWest -extent ${W}x${H}` +
    ` -threshold 50% -colorspace Gray -depth 8 -compress None GRAY:-`
  );
  const grid = [];
  for (let y = 0; y < H; y++) {
    grid.push([]);
    for (let x = 0; x < W; x++) {
      grid[y][x] = raw[y * W + x] < 128; // true = dark = foreground pixel
    }
  }
  return grid;
}

function buildPath(grid) {
  // Run-length encode each row into SVG path rectangles.
  // viewBox is "0 0 16 16", one unit = one pixel.
  const parts = [];
  for (let y = 0; y < H; y++) {
    let run = -1;
    for (let x = 0; x <= W; x++) {
      const on = x < W && grid[y][x];
      if (on && run < 0) {
        run = x;
      } else if (!on && run >= 0) {
        const w = x - run;
        // M<x> <y> h<w> v1 H<x> z  — absolute H back to start avoids negative numbers
        parts.push(`M${run} ${y}h${w}v1H${run}z`);
        run = -1;
      }
    }
  }
  return parts.join('');
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files   = fs.readdirSync(SPRITES).filter(f => f.endsWith('.png')).sort();
const entries = [];
const failed  = [];

process.stderr.write(`Converting ${files.length} icons...\n`);

for (let i = 0; i < files.length; i++) {
  if (i % 100 === 0) process.stderr.write(`  ${i}/${files.length}\n`);

  const f = files[i];
  const { id, label, cat } = parseFile(f);

  try {
    const grid = getGrid(path.join(SPRITES, f));
    const d    = buildPath(grid);
    if (!d) { failed.push(f + ' (blank)'); continue; }
    entries.push({ id, label, cat, d });
  } catch (e) {
    failed.push(f + ': ' + e.message.slice(0, 80));
  }
}

const lines = entries.map(e =>
  `  {id:${JSON.stringify(e.id)},label:${JSON.stringify(e.label)},cat:${JSON.stringify(e.cat)},d:${JSON.stringify(e.d)},v:"0 0 16 16"}`
).join(',\n');

fs.writeFileSync(OUT, `[\n${lines}\n]\n`);

process.stderr.write(`\nDone: ${entries.length} icons converted, ${failed.length} failed.\n`);
if (failed.length) {
  process.stderr.write('Failed:\n' + failed.slice(0, 30).join('\n') + '\n');
}
