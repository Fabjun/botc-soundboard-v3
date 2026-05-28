#!/usr/bin/env tsx
/**
 * sync-tokens-inventory.ts
 *
 * Reads SoS_DESIGN_25052026/tokens.css, extracts all CSS custom properties
 * grouped by section, and writes a table between AUTO-GENERATED markers
 * in DESIGN_SYSTEM.md §A.
 *
 * Run: npm run sync:tokens  (from v3/)
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS_CSS = join(ROOT, 'SoS_DESIGN_25052026', 'tokens.css');
const DESIGN_SYSTEM = join(ROOT, 'DESIGN_SYSTEM.md');

const MARKER_START = '<!-- AUTO-GENERATED:tokens START — nicht manuell editieren -->';
const MARKER_END = '<!-- AUTO-GENERATED:tokens END -->';

interface TokenEntry {
  name: string;
  value: string;
  description: string;
  group: string;
}

function parseTokens(css: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  let currentGroup = 'Allgemein';
  let inLegacyBlock = false;

  // Detect legacy aliases block start
  const legacyMarker = 'LEGACY ALIASES';

  const lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect legacy aliases block
    if (line.includes(legacyMarker)) {
      inLegacyBlock = true;
      currentGroup = 'Legacy Aliases (--sb-*)';
      continue;
    }

    // Detect section headers: /* ── SECTION NAME ── ... */
    // or /* ── SECTION NAME (multiline) */
    const sectionMatch = line.match(/\/\*\s*──\s*([A-ZÄÖÜ][^─*]+?)\s*──/);
    if (sectionMatch && !inLegacyBlock) {
      const raw = sectionMatch[1].trim();
      // Capitalize nicely, remove trailing dashes
      currentGroup = raw.replace(/\s+/g, ' ');
      continue;
    }

    // Token line: --name: value; /* optional comment */
    // The inline comment comes AFTER the semicolon, so we capture the
    // entire line from the colon and split at the first semicolon.
    const nameMatch = line.match(/^\s*(--[\w-]+)\s*:/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const colonIdx = line.indexOf(':');
    const afterColon = line.slice(colonIdx + 1);
    const semicolonIdx = afterColon.indexOf(';');
    if (semicolonIdx === -1) continue; // no semicolon = not a declaration

    let rawValue = afterColon.slice(0, semicolonIdx).trim();
    const afterSemicolon = afterColon.slice(semicolonIdx + 1).trim();

    // Extract single-line inline comment from after the semicolon
    let description = '';
    const inlineComment = afterSemicolon.match(/\/\*\s*(.+?)\s*\*\//);
    if (inlineComment) {
      description = inlineComment[1].trim();
      description = description.replace(/^[·\s]+/, '').trim();
    }

    // Shorten very long values (e.g. drop-shadow chains)
    const displayValue =
      rawValue.length > 60 ? rawValue.slice(0, 57) + '…' : rawValue;

    entries.push({
      name,
      value: displayValue,
      description,
      group: currentGroup,
    });
  }

  return entries;
}

function generateTable(entries: TokenEntry[]): string {
  // Group by section, preserve order
  const groups = new Map<string, TokenEntry[]>();
  for (const e of entries) {
    if (!groups.has(e.group)) groups.set(e.group, []);
    groups.get(e.group)!.push(e);
  }

  const lines: string[] = [];
  for (const [group, tokens] of groups) {
    lines.push(`### ${group}`);
    lines.push('');
    lines.push('| Token | Wert | Beschreibung |');
    lines.push('|-------|------|-------------|');
    for (const t of tokens) {
      const desc = t.description || '—';
      lines.push(`| \`${t.name}\` | \`${t.value}\` | ${desc} |`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function run(): void {
  const css = readFileSync(TOKENS_CSS, 'utf8');
  const entries = parseTokens(css);
  const table = generateTable(entries);

  let doc = readFileSync(DESIGN_SYSTEM, 'utf8');
  const startIdx = doc.indexOf(MARKER_START);
  const endIdx = doc.indexOf(MARKER_END);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers not found in ${DESIGN_SYSTEM}`);
  }

  const before = doc.slice(0, startIdx + MARKER_START.length);
  const after = doc.slice(endIdx);

  doc = `${before}\n${table}\n${after}`;
  writeFileSync(DESIGN_SYSTEM, doc, 'utf8');

  console.log(`sync-tokens: wrote ${entries.length} tokens in ${groups(entries)} groups → §A`);
}

function groups(entries: TokenEntry[]): number {
  return new Set(entries.map((e) => e.group)).size;
}

run();
